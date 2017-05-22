var filmography_section = $(".filmo-category-section")
filmography_section.children().each(function (index) {
	var year_elem = $(this).children("span");
	var year = year_elem.text();
	var film_elem = $(this).children("b").children("a");
	var title = film_elem.text();
	var title_url = film_elem.attr('href');
	
	fetchRating(title_url, year, year_elem);
	// makeApiCall(title, year, year_elem);
});


/*
 * This function fetches the page specified by the url parameter and parses
 * the film's rating. The rating is then appended to the film's row.
 */
function fetchRating(url, year, element) {
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
	
	xmlHttp.open('GET',"http://www.imdb.com" + url, true);
	xmlHttp.send();
}

/*
 * This function uses the OMDb API to fetch film ratings.
 * On May 9, 2017, OMDb API became private. This function is now depricated.
 */
function makeApiCall(title, year, element) {
	var rating =  10;
	
	var re = new RegExp(' ', 'g');
    apikey = title.replace(re, "+");
	
	year = year.replace('\xa0', '');
	
	var xmlHttp = new XMLHttpRequest();
	var endpoint = 'http://www.omdbapi.com/?t=' + apikey + '&y=' + year + '&plot=short&r=json';

	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
			var data = JSON.parse(xmlHttp.responseText);
			rating = data.imdbRating;
			
			element.text(rating + '\xa0' + year);
		}
	};
	xmlHttp.open('GET', endpoint, true);
	xmlHttp.send();
}
