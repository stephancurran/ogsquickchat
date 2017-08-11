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

/* prefix used for button IDs; must match var in content.js and prefix in DEFAULT_MESSAGES */
var qc_prefix = "quickchatButton";

/**
 * Add a listener to each QuickChat button.
 */
var inputs = document.getElementsByClassName(qc_prefix);
for (var i = 0; i < inputs.length; i++)
{

    inputs[i].addEventListener("click", function ()
    {
        qc_sendChat(this.title);
    });
}

/**
 * Validate the input value; send if not null or empty.
 * @param {type} msg
 */
function qc_sendChat(msg)
{
    if (msg !== null && msg.length > 0)
    {
        /* global_goban is the OGS object */
        window.global_goban.sendChat(msg, "main");
    }
}