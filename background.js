function getUnogsCredentials() {
	currDate = new Date()

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
			var data = JSON.parse(xmlHttp.responseText);
			token = data.token.access_token;

			if (token) {
				chrome.storage.local.set(
					{
						unogs_credentials: [
							{
								token: token,
								expirationDate: new Date(currDate.getTime() + 1000 * 60 * 24 - 1000 * 15)
							}
						],
					},
					null
				);
			}
		}
	};

	url = 'http://www.unogs.com/api/user?user_name=' + currDate / 10
	xmlHttp.open('POST', url, false);  // false makes this a synchronous request
	xmlHttp.send();
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "getUnogsCredentials") {
      getUnogsCredentials()
      sendResponse({result: true});
    }
  }
);
