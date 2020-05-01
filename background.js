browser.runtime.onMessage.addListener(
  function(message, sender, response) {
    if (message.action == "getNetflixCountries") {
      return getUnogsToken();
      //return getNetflixCountries(message, sender, response);
    }
  }
);

function getNetflixCountries(message, sender, response) {
  var promise = getUnogsToken()
  .then(function(token) {
    return getNetflixId(token, message);
  })
  .then(function(netflixId, token) {
    return getNetflixCountriesFromUnogs(netflixId, token)
  })
  .catch(function(err) {
    console.log('getNetflixCountries error');
    console.error(err);
  });

  // getNetflixId(message.title, message.imdbId, getNetflixCountries)

  return promise;
}

/*
 * Get a valid uNoGS token:
 *   - first try to get a token from Storage.
 *   - otherwise fetch a new token from uNoGS
 */
function getUnogsToken() {
  promise = browser.storage.local.get(['unogsCredentials'])
  .then(function(credentials) {
    return processUnogsCredentials(credentials);
  })
  .catch((err) => {
    console.log('refreshUnogsToken error');
    console.error(err)
  });

  return promise;
}

/*
 * Return token from Storage if it's valid. Otherwise request a new token.
 */
function processUnogsCredentials(object) {
  credentials = object.unogsCredentials;

  if (isValidCredentials(credentials)) {
    return credentials.token;
  }

  var promise = requestUnogsToken()
  .then(function(response) {
    return processUnogsResponse(response);
  })
  .catch((err) => {
    console.log("processUnogsCredentials error");
    console.error(err);
  });

  return promise;
}

/*
 * Make a request to get token from uNoGS authentication endpoint.
 */
function requestUnogsToken() {
  currDate = new Date();
  url = 'http://unogs.com/api/user?user_name=' + currDate / 10

  var promise = fetch(url, {method: 'POST'})
  .then(function(response) {
    return response.json();
  })
  .catch((err) => {
    console.log('requestUnogsToken error');
    console.err(err);
  });

  return promise;
}

function processUnogsResponse(data) {
  token = data["token"]["access_token"];

  if (!token) {
    throw new Error('Invalid token returned from uNoGS');
  }

  currDate = new Date();
  expirationDate = new Date(currDate.getTime() + 1000 * 60 * 60 * 24 - 1000 * 15);

  unogsCredentials = {
    token: token,
    expirationTime: expirationDate.getTime()
  }

  var promise = browser.storage.local.set({unogsCredentials: unogsCredentials})
  .then(function() {
    return token;
  })
  .catch((err) => {
    console.log("processUnogsResponse error");
    console.error(err);
  });

  return promise;
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

function getNetflixCountriesFromUnogs(netflixId, token, callback) {
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

function isValidCredentials(credentials) {
  if (isEmptyObject(credentials)) {
    return false;
  }

  if (credentials.token == null || credentials.token === '') {
    return false;
  }

  if (credentials.expirationTime <= new Date().getTime()) {
    return false;
  }

  return true;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}
