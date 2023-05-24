var UPDATE_INTERVAL = 1000; // 1 second
var HOST = 'http://' + window.location.host;
var BASE_URL = HOST + '/api';
var HAS_UPDATE_URL = BASE_URL + '/has-update';
var GET_UPDATE_URL = BASE_URL + '/get-update';


function getFreshData() {
    fetch(HOST, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(function (data) {
        // I want the data as a string bc it is html
        return data.text();
    }).then(function (html) {
        // hold the html in a new dom 
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        // get the body of the new dom
        var body = doc.getElementsByTagName('body')[0];
        // get the body of the current dom
        var currentBody = document.getElementsByTagName('body')[0];
        // replace the current body with the new body
        currentBody.parentNode.replaceChild(body, currentBody);
        body = null;
        doc = null;
        parser = null;
    }).catch(function (err) {
        console.log('err', err);
    });
}

function updateCreatedAt(jsonData) {
    var timeAgoElements = document.getElementsByClassName('card-created-at');

    for (var i = 0; i < timeAgoElements.length; i++) {
        var timeAgoElement = timeAgoElements[i];
        var timeAgo = jsonData.recentlyScanned[i].createdAt;

        // only bother to update the dome if the time Ago is different
        if (timeAgoElement.innerHTML !== "Scanned: " + timeAgo) {
            timeAgoElement.innerHTML = "Scanned: " + timeAgo;
        }
    }
}

function getStaleData() {
    fetch(GET_UPDATE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(function (data) {
        return data.json();
    }).then(function (jsonData) {
        updateCreatedAt(jsonData);
    }).catch(function (err) {
        console.log('err', err);
    });
}


function checkForUpdate() {
    // need to use OLD apis that any browser can use nothing new or fancy
    fetch(HAS_UPDATE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (!data.shouldUpdate) {
            // updates the time ago
            getStaleData();
        } else {
            getFreshData();
        }
    }).catch(function (err) {
        console.log('err', err);
    });
}

window.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    window.setInterval(checkForUpdate, UPDATE_INTERVAL);
}())