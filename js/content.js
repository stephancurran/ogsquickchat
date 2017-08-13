/**
 *  OGS Quick Chat
 *  
 *  Copyright © 2017 Stephan Curran
 * 
 *  This file is part of OGS Quick Chat.
 * 
 *  OGS Quick Chat is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 
 *  OGS Quick Chat is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 
 *  You should have received a copy of the GNU General Public License
 *  along with OGS Quick Chat.  If not, see <http://www.gnu.org/licenses/>.
 *  
 */

/* global chrome */

var qc_prefix = "quickchatButton"; // prefix used for button IDs; must match var in quickchat.js and prefix in DEFAULTDEFAULT_MESSAGES
var quickchatBarId = "quickchatBar"; // id for QuickChat bar
var quickchat_jsId = "quickchat_js"; // id for quickchat.js script tag
var quickchat_jsPath = "js/quickchat.js";
var quickchatLabelId = "quickchatLabel"; // id for the label div
var quickchatLabel = "Quick Chat"; // label for QuickChat bar
var ogsChatContainer = null; // reference to the OGS chat container
var messages; // current messages

/**
 * Default messages for the extension.
 * Prefix 'quickchatButton_' is referenced in content.js and quickchat.js
 */
var DEFAULT_MESSAGES =
        {
            quickchatButton0: "Hi.",
            quickchatButton1: "Bonjour.",
            quickchatButton2: "Hola.",
            quickchatButton3: "你好.",
            quickchatButton4: "Have fun.",
            quickchatButton5: "Thanks for the game.",
            quickchatButton6: "Sorry...misclick...",
            quickchatButton7: "Thanks.",
            quickchatButton8: "No problem.",
            quickchatButton9: ";)"
        };

/**
 * Listen for DOM changes.
 * Add QuickChat bar when chat container is available.
 * Load messages when QuickChat bar available.
 */
var observer = new MutationObserver(function (mutations)
{
    mutations.forEach(function (mutation)
    {
        var chatContainerAvailable = document.getElementsByClassName("chat-container").length === 1;

        if (ogsChatContainer === null && chatContainerAvailable)
        { /* QuickChat bar not yet added, and chat container now available */
            injectQuickchat();
        } else if (ogsChatContainer !== null && chatContainerAvailable)
        { /* Chat bar already injected, chat container visible: now load messages */
            try
            { /* mutation.addedNodes.item(0) may be null for other mutations */
                if (mutation.addedNodes.item(0).id === quickchatBarId)
                { /* Quick Chat bar available */
                    loadMessages();
                }
            } catch (error) {
            }
        } else if (ogsChatContainer !== null && !chatContainerAvailable)
        { /* QuickChat bar already added, but chat container has dissappeared */
            removeQuickChat();
        }
    });
});
observer.observe(document, {childList: true, subtree: true});

/**
 * Inject QuickChat bar and quickchat.js into the page.
 * 
 */
function injectQuickchat()
{
    var quickChatBar = document.createElement("div"); // container for label and buttons
    quickChatBar.id = quickchatBarId;

    var labelDiv = document.createElement("div"); // label for QuickChat bar
    labelDiv.id = quickchatLabelId;
    labelDiv.textContent = quickchatLabel;

    quickChatBar.appendChild(labelDiv);

    /*
     * Do this backwards; the numbers render in reverse when floated.
     */
    for (var i = Object.keys(DEFAULT_MESSAGES).length - 1; i >= 0; i--)
    {
        var div = document.createElement("div");
        div.id = qc_prefix + i;
        div.className = qc_prefix;
        div.textContent = i + 1;

        quickChatBar.appendChild(div);
    }

    ogsChatContainer = document.getElementsByClassName("chat-container")[0]; // OGS container for chat box
    ogsChatContainer.appendChild(quickChatBar);

    /*
     * Inject the script which accesses the OGS sendChat method.
     */
    var scriptTag = document.createElement("script");
    scriptTag.type = "text/javascript";
    scriptTag.src = chrome.runtime.getURL(quickchat_jsPath);
    scriptTag.id = quickchat_jsId;
    document.body.appendChild(scriptTag);
}

/**
 * Remove obselete references.
 * 
 */
function removeQuickChat()
{
    /* Nullify reference to chat container */
    ogsChatContainer = null;

    /* Remove quickchat.js injection */
    var qcScript = document.getElementById(quickchat_jsId);
    if (qcScript !== null)
    {
        qcScript.parentNode.removeChild(qcScript);
    }
}

/**
 * Load messages from local storage; if not found, use default messages.
 * 
 */
function loadMessages()
{
    var keys = (Object.keys(DEFAULT_MESSAGES));

    chrome.storage.sync.get(keys, function (items)
    {
        if (items === undefined /* Firefox */
                || items[keys[0]] === undefined /* Chrome */)
        { /* User doesn't have saved messages */
            messages = DEFAULT_MESSAGES;
        } else
        { /* Stored messages found; use them */
            messages = items;
        }

        /* Update the DOM with the messages */
        updateDOM(messages);
    });
}

/**
 * Listen for messages from popup.js
 * get - popup requesting the messages (only first time popup is opened)
 * set - popup sending new messages - need to update DOM, and save messages
 */
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse)
{
    if (msg.mode === "get")
    {
        sendResponse(messages);
    } else if (msg.mode === "set")
    {
        delete msg.mode; // we don't want this key in the messages
        messages = msg;
        chrome.storage.sync.set(messages, function () {});
        updateDOM(messages);
    }
});

/**
 * Resizing can cause OGS to remove/replace the chat container, losing the QuickChat bar.
 * This debounce checks if the bar is missing, and removes the dangling references.
 * The MutationObserver will bring them back again.
 */
var resizeTimer;
window.addEventListener("resize", function ()
{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function ()
    {
        if (document.getElementById(quickchatBarId) === null)
        {
            removeQuickChat();
        }
    }, 500);
});

/** 
 * Update the titles of the buttons.
 * @param {type} messages
 */
function updateDOM(messages)
{
    for (var key in messages)
    {
        document.getElementById(key).title = messages[key];
    }
}
