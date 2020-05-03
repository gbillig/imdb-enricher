browser.runtime.onMessage.addListener(
  function(message, sender, response) {
    if (message.action == "getNetflixCountries") {
      return getNetflixCountries(message, sender, response);
    }
  }
);

browser.webRequest.onBeforeSendHeaders.addListener(
  addUnogsRefererHeader,
  {urls: ["https://unogs.com/api/search*"]},
  ["blocking", "requestHeaders", "extraHeaders"]
);

function getNetflixCountries(message, sender, response) {
  var token = null;

  var promise = getUnogsToken()
  .then(function(unogsToken) {
    token = unogsToken;
    return getNetflixId(message.title, message.imdbId, token);
  })
  .then(function(response) {
    return processSearchResponse(response, message.imdbId);
  })
  .then(function(netflixId) {
    return getNetflixCountriesFromUnogs(netflixId, token)
  })
  .then(function(response) {
    return processNetflixCountries(response);
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
    console.error(err);
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

function getNetflixId(title, imdbId, unogsToken) {
  var baseUrl = "https://unogs.com/api/search";
  var limit = 5;
  var offset = 0;
  var query = encodeURI(title);
  var url = baseUrl + '?limit=' + limit + '&offset=' + offset + '&query=' + query;

  var promise = fetch(url, {
    method: 'GET',
    headers: {
      'authorization': 'Bearer ' + unogsToken,
      'referrer': 'http://unogs.com',
    }
  })
  .then(function(response) {
    return response.json();
  })
  .catch((err) => {
    console.log('requestUnogsToken error');
    console.error(err);
  });

  return promise;
}

function addUnogsRefererHeader(e) {
  foundReferer = false;
  refererValue = 'https://unogs.com/';

  for (var header of e.requestHeaders) {
    if (header.name.toLowerCase() === "referer") {
      header.value = refererValue;
      foundReferer = true;
      break;
    }
  }

  if (!foundReferer) {
    e.requestHeaders.push({name:"Referer", value:refererValue});
  }

  return {requestHeaders: e.requestHeaders};
}

function processSearchResponse(data, imdbId) {
for (const searchResult of data["results"]) {
    if (searchResult.imdbid == imdbId) {
      return searchResult.nfid;
    }
  }

  return undefined;
  //throw new Error('IMDb entry not found in uNoGS search results');
}

function getNetflixCountriesFromUnogs(netflixId, unogsToken) {
  var baseUrl = "https://unogs.com/api/title/countries";
  var url = baseUrl + '?netflixid=' + netflixId;

  var promise = fetch(url, {
    method: 'GET',
    headers: {
      'authorization': 'Bearer ' + unogsToken,
    }
  })
  .then(function(response) {
    return response.json();
  })
  .catch((err) => {
    console.log('requestUnogsToken error');
    console.error(err);
  });

  return promise;
}

function processNetflixCountries(data) {
  return data.map(x => x.cc);

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
