var filmographyActorRows = $("div.filmo-row[id*='actor']")
filmographyActorRows.each(function(index) {
  var yearElement = $(this).children("span");
  var year = yearElement.text();
  var filmElement = $(this).children("b").children("a");
  var title = filmElement.text();
  var url = filmElement.attr('href');
  imdbIdRegex = /\/title\/(tt.*)\//;
  var matches = url.match(imdbIdRegex);
  var imdbId = matches[1];

  message = {
    action: "getImdbMetadata",
    imdbId: imdbId,
    title: title,
    year: year,
  }

  browser.runtime.sendMessage(message)
  .then(function(response) {
    response.title = title;
    console.log(response);
  })
  .catch((err) => {
    console.log('sendMessage error (getImdbMetadata)');
    console.error(err);
  });
});

function addFlag(data, element) {
  var countryCode = "CA";
  var flagUrl = "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.7.0/flags/4x3/" + countryCode + ".svg"
}

function addRating(rating, element) {
  element.text(rating + '\xa0' + year);
}
