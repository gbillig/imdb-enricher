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
	var api_key = 'ab272ca2'
	var rating =  10;
	
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
	var base_url = 'http://www.omdbapi.com/'
	var title_query_param = '?t=' + enc_title
	var year_query_param = '&y=' + year
	var format_query_param = '&plot=short&r=json'
	var api_key_param = '&apikey=' + api_key
	var endpoint = base_url + title_query_param + year_query_param + format_query_param + api_key_param

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
