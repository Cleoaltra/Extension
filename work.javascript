manifest file
{

  "manifest_version": 2,
  "name": "Mac",
  "version": "1.0",

  "description": "Adds a browser action icon to the toolbar. Click the
button to choose a beast. The active tab's body content is then
replaced with a picture of the chosen beast. See
https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Examples#mac",
  "homepage_url":
"https://github.com/mdn/webextensions-examples/tree/master/mac",
  "icons": {
    "48": "icons/beasts-48.png"
  },

  "permissions": [
    "activeTab"
  ],

  "browser_action": {
    "default_icon": "icons/beasts-32.png",
    "default_title": "Mac",
    "default_popup": "popup/choose_beast.html"
  },

  "web_accessible_resources": [
    "patra.jpg",
    "macc.jpg",
    "jon.jpg"
  ]

}


The icon
"icons": {
  "48": "icons/beasts-48.png",
  "96": "icons/beasts-96.png"
}

the html file
choose_beast.html
<!DOCTYPE html>

<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="choose_beast.css"/>
  </head>

  <body>
    <div class="button beast">Cleo</div>
    <div class="button beast">Ajambo</div>
    <div class="button beast">Claus</div>
    <div class="button clear">Clovis</div>

    <script src="choose_beast.js"></script>
  </body>

</html>

choose_beast.css
html, body {
  width: 100px;
}

.button {
  margin: 3% auto;
  padding: 4px;
  text-align: center;
  font-size: 1.5em;
  cursor: pointer;
}

.beast:hover {
  background-color: #CFF2F2;
}

.beast {
 background-color: #E5F2F2;
}

.clear {
 background-color: #FBFBC9;
}

.clear:hover {
 background-color: #EAEAC9;
}

choose_beast.js
/*
Given the name of a beast, get the URL to the corresponding image.
*/
function beastNameToURL(beastName) {
  switch (beastName) {
    case "Frog":
      return browser.extension.getURL("patra.jpg");
    case "Snake":
      return browser.extension.getURL("macc.jpg");
    case "Turtle":
      return browser.extension.getURL("jon.jpg");
  }
}

/*
Listen for clicks in the popup.

If the click is on one of the beasts:
  Inject the "mac.js" content script in the active tab.

  Then get the active tab and send "mac.js" a message
  containing the URL to the chosen beast's image.

If it's on a button which contains class "clear":
  Reload the page.
  Close the popup. This is needed, as the content script malfunctions
after page reloads.
*/

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("beast")) {
    var chosenBeast = e.target.textContent;
    var chosenBeastURL = beastNameToURL(chosenBeast);

    browser.tabs.executeScript(null, {
      file: "/content_scripts/mac.js"
    });

    var gettingActiveTab = browser.tabs.query({active: true,
currentWindow: true});
    gettingActiveTab.then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {beastURL: chosenBeastURL});
    });
  }
  else if (e.target.classList.contains("clear")) {
    browser.tabs.reload();
    window.close();
  }
});


mac.js
/*
mac():
* removes every node in the document.body,
* then inserts the chosen beast
* then removes itself as a listener
*/
function mac(request, sender, sendResponse) {
  removeEverything();
  insertBeast(request.beastURL);
  browser.runtime.onMessage.removeListener(mac);
}

/*
Remove every node under document.body
*/
function removeEverything() {
  while (document.body.firstChild) {
    document.body.firstChild.remove();
  }
}

/*
Given a URL to a beast image, create and style an IMG node pointing to
that image, then insert the node into the document.
*/
function insertBeast(beastURL) {
  var beastImage = document.createElement("img");
  beastImage.setAttribute("src", beastURL);
  beastImage.setAttribute("style", "width: 100vw");
  beastImage.setAttribute("style", "height: 100vh");
  document.body.appendChild(beastImage);
}

/*
Assign mac() as a listener for messages from the extension.
*/
browser.runtime.onMessage.addListener(mac);

