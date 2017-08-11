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

chrome.tabs.onUpdated.addListener(function ()
{
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs)
    {
        var activeTab = arrayOfTabs[0];
        console.log(activeTab.url);
        var activeTabId = activeTab.id;
        if (activeTab.url.indexOf("online-go.com/game/") > -1)
        { /* We're on a game page; make popup available */
            chrome.pageAction.show(activeTabId);
        } else
        { /* Some other page; don't make popup available */
            chrome.pageAction.hide(activeTabId);
        }
    });
});
