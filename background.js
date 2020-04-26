chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "getNetflixCountries") {
      getUnogsToken(sendResponse);
      getNetflixId(request.title, request.imdbId, getNetflixCountries)

      return true;
    }
  }
);

/*
 * Retrieve token from the Storage API
 * Request a new token from uNoGS if none is found in the storage
 */
function getUnogsToken(callback) {
  chrome.storage.local.get(['unogsCredentials'], function(result) {
    crendentials = result.unogsCredentials;

    if (isValidCredentials(crendentials)) {
      callback(crendentials.token);
    } else {
      requestUnogsToken(callback);
    }
  });
}

/*
 * Make a request to get token from uNoGS authentication endpoint
 */
function requestUnogsToken(callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      data = JSON.parse(xhr.responseText)
      processUnogsResponse(data, callback)
    }
  };

  currDate = new Date();
  url = 'http://unogs.com/api/user?user_name=' + currDate / 10
  xhr.open("POST", url, true); // false would makes this a synchronous request
  // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhr.send();
}

/*
 * Process uNoGS response:
 *  - store the token via the Storage API
 *  - send response to the message with the token
 */
function processUnogsResponse(data, callback) {
  token = data["token"]["access_token"];

  if (token) {
    currDate = new Date();
    expirationDate = new Date(currDate.getTime() + 1000 * 60 * 60 * 24 - 1000 * 15);

    unogsCredentials = {
      token: token,
      expirationTime: expirationDate.getTime()
    }

    chrome.storage.local.set({unogsCredentials: unogsCredentials}, null);
    callback(token);
  } else {
    callback(null);
  }
}


function getNetflixId(title, imdbId, token, callback) {
  var baseUrl = "https://unogs.com/api/search";
  var limit = 5;
  var offset = 0;
  var query = encodeURI(title);
  var url = baseUrl + '?limit=' + limit + '&offset=' + offset + '&query=' + query;

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      searchResults = JSON.parse(xhr.responseText);
      for (const searchResult in searchResults) {
        if (searchResult["imdbid"] == imdbId) {
          callback(searchResult["nfid"]);
        }
      }
    }
  };

  xhr.open('GET', url, true);
  xhr.setRequestHeader('authorization', 'Bearer ' + token);
  // xhr.setRequestHeader('referer', 'https://unogs.com') // weird uNoGS API requirement
  xhr.setRequestHeader('referrer', 'http://unogs.com') // weird uNoGS API requirement
  xhr.send();
}

function getNetflixCountries(netflixId, token, callback) {
  var xhr = new XMLHttpRequest();
  var baseUrl = "https://unogs.com/api/title/countries";
  var url = baseUrl + '?netflixid=' + netflixId;

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      callback(JSON.parse(xhr.responseText));
    }
  };

  xhr.open('GET', url, true);
  xhr.setRequestHeader('authorization', 'Bearer ' + token);
  xhr.send();
}

function isValidCredentials(crendentials) {
  if (isEmptyObject(crendentials)) {
    return false;
  }

  if (crendentials.token == null || crendentials.token === '') {
    return false;
  }

  if (crendentials.expirationTime <= new Date().getTime()) {
    return false;
  }

  return true;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}
