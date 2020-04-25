chrome.runtime.sendMessage({action: "getUnogsToken"}, function(response) {
  unogsToken = null;
  if (response.result) {
    unogsToken = response.result.token;
  }

  var filmographySection = $(".filmo-category-section")
  filmographySection.children().each(function (index) {
    var yearElement = $(this).children("span");
    var year = yearElement.text();
    var filmElement = $(this).children("b").children("a");
    var title = filmElement.text();
    var url = filmElement.attr('href');
    imdbIdRegex = /\/title\/(tt.*)\//;
    var matches = url.match(imdbIdRegex);
    var imdbId = matches[1];

    getNetflixId(title, imdbId, getNetflixCountries)
    getRating(title, url, year, yearElement);
    //getNetflixCountries(title, url, year, yearElement, unogsToken);
  });
});

function getRating(title, url, year, element) {
  var useOmdb = true;

  if (useOmdb) {
    getRatingOmdb(title, year, element);
  } else {
    getRatingImdb(url, year, element);
  }
  // getNetflixCountries(title, element)
}

/*
 * Get the IMDb page via the url parameter and parse the rating.
 * Append the rating to the year row in the current page.
 */
function getRatingImdb(url, year, element) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var data = $.parseHTML(xhr.responseText);
      var rating = null;
      $.each(data, function(index) {
        var ratingValueElement = $(this).find("div.ratingValue");
        if (ratingValueElement.length > 0) {
          var value = ratingValueElement.children("strong").children("span").text();
          if (value != null) {
            rating = value;
          }
        }
      });

      if (rating != null) {
        element.text(rating + '\xa0' + year);
      }
    }
  };

  xhr.open('GET',"https://www.imdb.com" + url, true);
  xhr.send();
}

/*
 * Get film rating using the OMDb API.
 * Append the rating to the year row in the current page.
 * Note: the OMDb API was made private on May 9, 2017, and then subsequently was made public again on November 2, 2017.
 */
function getRatingOmdb(title, year, element) {
  var omdbApiKey = 'ab272ca2'
  var rating = null;

  var titleRegex = new RegExp(' ', 'g');
  encodedTitle = title.replace(titleRegex, "+");

  var yearRegex = new RegExp(/\d\d\d\d/);
  year = yearRegex.exec(year);
  if (year != null) {
    year = year[0];
  } else {
    year = "";
  }

  var xhr = new XMLHttpRequest();
  var baseUrl = 'https://www.omdbapi.com/';
  var titleQueryParam = '?t=' + encodedTitle;
  var yearQueryParam = '&y=' + year;
  var formatQueryParam = '&plot=short&r=json';
  var omdbApiKeyParam = '&apikey=' + omdbApiKey;
  var endpoint = baseUrl + titleQueryParam + yearQueryParam + formatQueryParam + omdbApiKeyParam;

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      rating = data.imdbRating;

      if (rating != null) {
        element.html('<b>' + rating + '</b>\xa0' + year);
      }
    }
  };

  xhr.open('GET', endpoint, true);
  xhr.send();
}

function getNetflixId(title, imdbId, callback) {
  // use the search endpoint to get the netflix id
}

function getNetflixCountries(netflixId, token, callback) {
  var xhr = new XMLHttpRequest();
  var baseUrl = "https://unogs.com/api/title/countries";
  var url = baseUrl + '?netflixid=' + netflixId;
  xhr.setRequestHeader('authorization', 'Bearer ' + token);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      callback(JSON.parse(xhr.responseText);
    }
  };

  xhr.open('GET', endpoint, true);
  xhr.send();
}

function addFlag(data, element) {
  var countryCode = "CA";
  var flagUrl = "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.7.0/flags/4x3/" + countryCode + ".svg"
}
