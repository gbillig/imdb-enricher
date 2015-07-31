console.log('Hello World');

var filmography_section = $(".filmo-category-section")
filmography_section.children().each(function (index) {
	var year_span = $(this).children("span");
	var title =  $(this).children("b").children("a").text();
	var year = year_span.text();
	year_span.text(title + year);
})
