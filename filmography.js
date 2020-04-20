var filmography_section = $(".filmo-category-section")
filmography_section.children().each(function (index) {
  var year_elem = $(this).children("span");
  var year = year_elem.text();
  var film_elem = $(this).children("b").children("a");
  var title = film_elem.text();
  var url = film_elem.attr('href');

  getRating(title, url, year, year_elem);
});


function getRating(title, url, year, element) {
  var useOmdb = true;

  if (useOmdb) {
    getRatingOmdb(title, year, element);
  } else {
    getRatingImdb(url, year, element);
  }
  getNetflixCountries(title, element)
}

/*
 * Get the IMDb page via the url parameter and parse the rating.
 * Append the rating to the year row in the current page.
 */
function getRatingImdb(url, year, element) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
      var data = $.parseHTML(xmlHttp.responseText);
      var rating = null;
      $.each(data, function(index) {
        var value_elem = $(this).find("div.ratingValue");
        if (value_elem.length > 0) {
          var value = value_elem.children("strong").children("span").text();
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

  xmlHttp.open('GET',"https://www.imdb.com" + url, true);
  xmlHttp.send();
}

/*
 * Get film rating using the OMDb API.
 * Append the rating to the year row in the current page.
 * Note: the OMDb API was made private on May 9, 2017, and then subsequently was made public again on November 2, 2017.
 */
function getRatingOmdb(title, year, element) {
  var api_key = 'ab272ca2'
  var rating = null;

  var title_re = new RegExp(' ', 'g');
  enc_title = title.replace(title_re, "+");

  var year_re = new RegExp(/\d\d\d\d/);
  year = year_re.exec(year);
  if (year != null) {
    year = year[0];
  } else {
    year = "";
  }

  var xmlHttp = new XMLHttpRequest();
  var base_url = 'https://www.omdbapi.com/'
  var title_query_param = '?t=' + enc_title
  var year_query_param = '&y=' + year
  var format_query_param = '&plot=short&r=json'
  var api_key_param = '&apikey=' + api_key
  var endpoint = base_url + title_query_param + year_query_param + format_query_param + api_key_param

  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
      var data = JSON.parse(xmlHttp.responseText);
      rating = data.imdbRating;

      if (rating != undefined) {
        element.html('<b>' + rating + '</b>\xa0' + year);
      }
    }
  };
  xmlHttp.open('GET', endpoint, true);
  xmlHttp.send();
}

function getNetflixCountries(title, element) {
  chrome.storage.local.get(['unogs_credentials'], function(result) {
    if (isEmptyObject(result)) {
      chrome.runtime.sendMessage({action: "getUnogsCrendentials"}, function(response) {
        console.log(response.result);
      });
    }

    console.log('Value currently is ' + result.key);
  });

  let a = 10;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}
