console.log('Hello World');

var filmography_section = $(".filmo-category-section")
filmography_section.children().children("span").each(function (index) {
	var year = $(this).text();
	$(this).text("test " + year);
})