// ==UserScript==
// @name         Sigma Client v1
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  GUI for scenexe2.io
// @match        *://*.scenexe2.io/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Add CSS styles
    GM_addStyle(`
        .sigma-gui {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ff8c00;
            border-radius: 5px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 9999;
            min-width: 300px;
            display: none;
        }

        .sigma-header {
            text-align: center;
            font-size: 20px;
            margin-bottom: 15px;
            color: #ffa500;
            font-weight: bold;
        }

        .sigma-button {
            background: #ff8c00;
            border: 1px solid #ffa500;
            color: white;
            padding: 8px 15px;
            margin: 5px;
            border-radius: 3px;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s;
        }

        .sigma-button:hover {
            background: #ffa500;
        }

        .sigma-close {
            position: absolute;
            right: 10px;
            top: 10px;
            cursor: pointer;
            color: #ff8c00;
            font-weight: bold;
        }

        .status-popup {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ff8c00;
            padding: 10px 20px;
            color: white;
            border-radius: 5px;
            display: none;
            z-index: 10000;
        }
    `);

    // Create GUI
    const gui = document.createElement('div');
    gui.className = 'sigma-gui';
    gui.innerHTML = `
        <div class="sigma-header">Sigma Client v1</div>
        <span class="sigma-close">X</span>
        <button class="sigma-button" id="practiceMode">Practice Mode</button>
        <button class="sigma-button" id="function2">Function 2</button>
        <button class="sigma-button" id="function3">Function 3</button>
    `;
    document.body.appendChild(gui);

    // Create status popup
    const statusPopup = document.createElement('div');
    statusPopup.className = 'status-popup';
    document.body.appendChild(statusPopup);

    // Show status message
    function showStatus(message, duration = 2000) {
        statusPopup.textContent = message;
        statusPopup.style.display = 'block';
        setTimeout(() => {
            statusPopup.style.display = 'none';
        }, duration);
    }

    let practiceEnabled = false;

    // Event Listeners
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'v') {
            gui.style.display = gui.style.display === 'none' ? 'block' : 'none';
        }
    });

    document.querySelector('.sigma-close').addEventListener('click', function() {
        gui.style.display = 'none';
    });

    // Practice Mode Button
    document.getElementById('practiceMode').addEventListener('click', function() {
        practiceEnabled = !practiceEnabled;
        showStatus(`Practice Mode: ${practiceEnabled ? 'Enabled' : 'Disabled'}`);
        this.style.background = practiceEnabled ? '#ffa500' : '#ff8c00';
        // Add your practice mode functionality here
    });

    // Other function buttons
    document.getElementById('function2').addEventListener('click', function() {
        console.log('Function 2 executed');
        // Add your function 2 code here
    });

    document.getElementById('function3').addEventListener('click', function() {
        console.log('Function 3 executed');
        // Add your function 3 code here
    });

    // Prevent GUI from closing when clicking inside it
    gui.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Close GUI when clicking outside
    document.addEventListener('click', function(e) {
        if (gui.style.display === 'block' && !gui.contains(e.target)) {
            gui.style.display = 'none';
        }
    });
})();
