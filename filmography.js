console.log('Hello World');

var filmography_section = $(".filmo-category-section")
filmography_section.children().each(function (index) {
	var year_span = $(this).children("span");
	var title =  $(this).children("b").children("a").text();
	var year = year_span.text();
	
	makeApiCall(title, year, year_span);
})


//http://www.omdbapi.com/?t=Maladies+&y=2012&plot=short&r=json

function makeApiCall(title, year, element) {
	var rating =  10;
	
	var title_re = new RegExp(' ', 'g');
	apikey = title.replace(title_re, "+");

	var year_re = new RegExp(/\d\d\d\d/);
	year = year_re.exec(year);
	if (year != null) {
		year = year[0];
	} else {
		year = "";
	}

	var xmlHttp = new XMLHttpRequest();
	var endpoint = 'http://www.omdbapi.com/?t=' + apikey + '&y=' + year + '&plot=short&r=json';

	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
			var data = JSON.parse(xmlHttp.responseText);
			rating = data.imdbRating;

			if (rating == undefined) {
				rating = "N/A";
			}
			
			element.html('<b>' + rating + '</b>\xa0' + year);
		}
	};
	xmlHttp.open('GET', endpoint, true);
	xmlHttp.send();
}
