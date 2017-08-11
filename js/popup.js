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

var messageList = document.getElementById("messageList");
var updateButton = document.getElementById("updateButton");
var prefix = "quickchat";
var messages;

/**
 * When the popup loads, get messages from the content script and load the UI.
 * 
 */
window.addEventListener("DOMContentLoaded", function ()
{
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, {mode: "get"}, function (response)
        {
            createUI(response);
        });
    });
});

/**
 * If a key is pressed in the message list, check for differences with the 
 * stored messages. Disable updateButton unless a change is found.
 * Save messages if Enter is pressed.
 */
messageList.addEventListener("keyup", function (evt)
{
    if (evt.which === 13 || evt.keycode === 13)
    {
        setNewMessages();
    } else
    {
        var changed = false;
        for (var key in messages)
        {
            changed = document.getElementById(key).value !== messages[key];

            if (changed)
            {
                break;
            }
        }
        updateButton.disabled = !changed;
    }
});

/**
 * Create a text input for each message, and add a listener to the update button
 * @param {type} msgs
 * @returns {undefined}
 */
function createUI(msgs)
{
    messages = msgs;

    var inputCount = 1;
    for (var key in messages)
    {
        var label = document.createElement("label");
        label.htmlFor = key;
        label.innerHTML = inputCount;

        var input = document.createElement("input");
        input.type = "text";
        input.id = key;
        input.className = prefix;
        input.value = messages[key];

        var div = document.createElement("div");
        div.appendChild(label);
        div.appendChild(input);

        messageList.appendChild(div);

        inputCount++;
    }

    updateButton.addEventListener("click", setNewMessages);
    updateButton.disabled = true;
}

/**
 * Gather the messages from the input fields and send them to content.js
 * Set them in the local message object too.
 * 
 */
function setNewMessages()
{
    var messageObject = {mode: "set"};
    var inputs = document.getElementsByClassName(prefix);

    for (var i = 0; i < inputs.length; i++)
    {
        var key = inputs[i].id;
        var value = inputs[i].value;

        /* object to send to content script */
        messageObject[key] = value;

        /* update local message object separately */
        messages[key] = value;
    }

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, messageObject, function (response)
        {
            updateButton.disabled = true;
        });
    });
}
