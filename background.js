/*
 * Make a request to get token from uNoGS authentication endpoint
 */
function requestUnogsToken(sendResponse) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      data = JSON.parse(xhr.responseText)
      processUnogsResponse(data, sendResponse)
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
function processUnogsResponse(data, sendResponse) {
  token = data["token"]["access_token"];

  if (token) {
    currDate = new Date();
    expirationDate = new Date(currDate.getTime() + 1000 * 60 * 60 * 24 - 1000 * 15);

    unogsCredentials = {
      token: token,
      expirationTime: expirationDate.getTime()
    }

    chrome.storage.local.set({unogsCredentials: unogsCredentials}, null);
    sendResponse({result: unogsCredentials});
  } else {
    sendResponse({result: null});
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "getUnogsToken") {
      getUnogsToken(sendResponse);
      return true;
    }
  }
);

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

/*
 * Retrieve token from the Storage API
 * Request a new token from uNoGS if none is found in the storage
 */
function getUnogsToken(sendResponse) {
  chrome.storage.local.get(['unogsCredentials'], function(result) {
    crendentials = result.unogsCredentials;

    if (isValidCredentials(crendentials)) {
      sendResponse({result: crendentials});
    } else {
      requestUnogsToken(sendResponse);
    }
  });
}
