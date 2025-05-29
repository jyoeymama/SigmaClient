// ==UserScript==
// @name         Sigma Client v2.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Advanced hacks for scenexe2.io with many new features
// @match        *://*.scenexe2.io/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // Configuration - can be changed by users
    const config = {
        version: "2.0",
        defaultHotkey: "z",
        defaultTransparency: 0.8,
        defaultTheme: "dark",
        features: {
            tracers: true,
            aimHelper: true,
            noDark: true,
            pingDisplay: true,
            fpsDisplay: true,
            playerCounts: true,
            portalTimer: true,
            rareShapes: true,
            autoUpdater: true,
            esp: true,
            minimap: true,
            autoHeal: false,
            autoAim: false,
            speedHack: false
        }
    };

    // Load saved settings or use defaults
    function loadSettings() {
        const savedHotkey = GM_getValue('hotkey', config.defaultHotkey);
        const savedTransparency = GM_getValue('transparency', config.defaultTransparency);
        const savedTheme = GM_getValue('theme', config.defaultTheme);
        const savedFeatures = GM_getValue('features', config.features);

        return {
            hotkey: savedHotkey,
            transparency: savedTransparency,
            theme: savedTheme,
            features: savedFeatures
        };
    }

    // Save settings
    function saveSettings(settings) {
        GM_setValue('hotkey', settings.hotkey);
        GM_setValue('transparency', settings.transparency);
        GM_setValue('theme', settings.theme);
        GM_setValue('features', settings.features);
    }

    // Current settings
    const settings = loadSettings();

    // Add context menu commands
    GM_registerMenuCommand("Sigma Client Settings", openSettingsPanel);
    GM_registerMenuCommand("Toggle Sigma Client", toggleGUI);
    GM_registerMenuCommand("Reset All Settings", resetSettings);

    // Themes
    const themes = {
        dark: {
            bg: "rgba(0, 0, 0, {transparency})",
            border: "#ff8c00",
            text: "white",
            accent: "#ffa500",
            buttonBg: "#ff8c00",
            buttonHover: "#ffa500"
        },
        light: {
            bg: "rgba(255, 255, 255, {transparency})",
            border: "#0078d7",
            text: "black",
            accent: "#0078d7",
            buttonBg: "#0078d7",
            buttonHover: "#005a9e"
        },
        cyber: {
            bg: "rgba(10, 10, 20, {transparency})",
            border: "#0ff",
            text: "#0ff",
            accent: "#f0f",
            buttonBg: "#0ff",
            buttonHover: "#f0f"
        }
    };

    // Current theme
    const currentTheme = themes[settings.theme] || themes.dark;

    // Add CSS styles with theme support
    GM_addStyle(`
        .sigma-gui {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${currentTheme.bg.replace('{transparency}', settings.transparency)};
            border: 2px solid ${currentTheme.border};
            border-radius: 5px;
            padding: 15px;
            color: ${currentTheme.text};
            font-family: 'Segoe UI', Arial, sans-serif;
            z-index: 9999;
            min-width: 350px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            display: none;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
        }

        .sigma-header {
            text-align: center;
            font-size: 22px;
            margin-bottom: 15px;
            color: ${currentTheme.accent};
            font-weight: bold;
            text-shadow: 0 0 5px ${currentTheme.accent};
        }

        .sigma-button {
            background: ${currentTheme.buttonBg};
            border: 1px solid ${currentTheme.border};
            color: white;
            padding: 8px 15px;
            margin: 5px;
            border-radius: 3px;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s;
            font-weight: bold;
        }

        .sigma-button:hover {
            background: ${currentTheme.buttonHover};
            transform: translateY(-2px);
        }

        .sigma-close {
            position: absolute;
            right: 10px;
            top: 10px;
            cursor: pointer;
            color: ${currentTheme.accent};
            font-weight: bold;
            font-size: 18px;
            transition: all 0.2s;
        }

        .sigma-close:hover {
            color: ${currentTheme.buttonHover};
            transform: scale(1.2);
        }

        .status-popup {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${currentTheme.bg.replace('{transparency}', '0.9')};
            border: 2px solid ${currentTheme.border};
            padding: 10px 20px;
            color: ${currentTheme.text};
            border-radius: 5px;
            display: none;
            z-index: 10000;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .ping-display, .fps-display {
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${currentTheme.bg.replace('{transparency}', '0.9')};
            border: 1px solid ${currentTheme.border};
            padding: 5px 10px;
            color: ${currentTheme.text};
            border-radius: 3px;
            z-index: 10000;
            font-family: monospace;
        }

        .fps-display {
            top: 40px;
        }

        /* Aim Helper line */
        .aim-helper-line {
            position: absolute;
            height: 2px;
            background-color: ${currentTheme.accent};
            z-index: 1000;
            display: none;
            transform-origin: left center;
        }

        /* Gun position styling */
        .gun {
            position: absolute;
            background-color: ${currentTheme.accent};
            width: 30px;
            height: 30px;
            z-index: 1000;
            border-radius: 50%;
            display: none;
            mix-blend-mode: screen;
        }

        /* Tracer styling */
        .tracer-line {
            position: absolute;
            height: 2px;
            background-color: ${currentTheme.accent};
            z-index: 1000;
            transform-origin: left center;
            opacity: 0.7;
        }

        /* ESP Box */
        .esp-box {
            position: absolute;
            border: 2px solid ${currentTheme.accent};
            z-index: 999;
            pointer-events: none;
            display: none;
        }

        /* ESP Name */
        .esp-name {
            position: absolute;
            color: ${currentTheme.text};
            background: ${currentTheme.bg.replace('{transparency}', '0.7')};
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 12px;
            z-index: 999;
            pointer-events: none;
            display: none;
            white-space: nowrap;
        }

        /* Minimap */
        .minimap {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 200px;
            height: 200px;
            background: ${currentTheme.bg.replace('{transparency}', '0.7')};
            border: 2px solid ${currentTheme.border};
            border-radius: 5px;
            z-index: 10000;
            display: none;
        }

        .minimap-player {
            position: absolute;
            width: 6px;
            height: 6px;
            background: ${currentTheme.accent};
            border-radius: 50%;
            z-index: 10001;
        }

        .minimap-entity {
            position: absolute;
            width: 4px;
            height: 4px;
            background: red;
            border-radius: 50%;
            z-index: 10001;
        }

        /* Settings panel */
        .settings-panel {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${currentTheme.bg.replace('{transparency}', settings.transparency)};
            border: 2px solid ${currentTheme.border};
            border-radius: 5px;
            padding: 15px;
            color: ${currentTheme.text};
            z-index: 10001;
            width: 400px;
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }

        .settings-header {
            text-align: center;
            font-size: 20px;
            margin-bottom: 15px;
            color: ${currentTheme.accent};
        }

        .settings-group {
            margin-bottom: 15px;
            border-bottom: 1px solid ${currentTheme.border};
            padding-bottom: 10px;
        }

        .settings-label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .settings-input {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid ${currentTheme.border};
            background: ${currentTheme.bg.replace('{transparency}', '0.5')};
            color: ${currentTheme.text};
            border-radius: 3px;
        }

        .settings-select {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid ${currentTheme.border};
            background: ${currentTheme.bg.replace('{transparency}', '0.5')};
            color: ${currentTheme.text};
            border-radius: 3px;
        }

        .settings-checkbox {
            margin-right: 10px;
        }

        .settings-button {
            background: ${currentTheme.buttonBg};
            border: none;
            color: white;
            padding: 8px 15px;
            margin: 5px;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .settings-button:hover {
            background: ${currentTheme.buttonHover};
        }

        /* Notification system */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            color: white;
            background: ${currentTheme.bg.replace('{transparency}', '0.9')};
            border-left: 5px solid ${currentTheme.accent};
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            z-index: 10010;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: ${currentTheme.accent};
        }

        /* Tab system */
        .sigma-tabs {
            display: flex;
            margin-bottom: 15px;
            border-bottom: 1px solid ${currentTheme.border};
        }

        .sigma-tab {
            padding: 8px 15px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .sigma-tab.active {
            border-bottom: 2px solid ${currentTheme.accent};
            color: ${currentTheme.accent};
        }

        .sigma-tab-content {
            display: none;
        }

        .sigma-tab-content.active {
            display: block;
        }

        /* Slider */
        .sigma-slider {
            width: 100%;
            margin: 10px 0;
        }

        .sigma-slider-value {
            text-align: center;
            font-size: 12px;
            color: ${currentTheme.accent};
        }
    `);

    // Create main GUI
    const gui = document.createElement('div');
    gui.className = 'sigma-gui';
    gui.innerHTML = `
        <div class="sigma-header">Sigma Client v${config.version}</div>
        <span class="sigma-close" title="Close">✕</span>
        
        <div class="sigma-tabs">
            <div class="sigma-tab active" data-tab="main">Main</div>
            <div class="sigma-tab" data-tab="visual">Visual</div>
            <div class="sigma-tab" data-tab="combat">Combat</div>
            <div class="sigma-tab" data-tab="info">Info</div>
        </div>
        
        <div class="sigma-tab-content active" data-tab-content="main">
            <button class="sigma-button" id="toggleAllButton">Toggle All Features</button>
            <button class="sigma-button" id="settingsButton">Settings</button>
            <button class="sigma-button" id="updateButton">Check for Updates</button>
            <button class="sigma-button" id="helpButton">Help & About</button>
        </div>
        
        <div class="sigma-tab-content" data-tab-content="visual">
            <button class="sigma-button" id="tracersButton">Tracers: Off</button>
            <button class="sigma-button" id="espButton">ESP: Off</button>
            <button class="sigma-button" id="minimapButton">Minimap: Off</button>
            <button class="sigma-button" id="noDarkButton">NoDark: Off</button>
            <button class="sigma-button" id="transparencyButton">Adjust Transparency</button>
            <div class="sigma-slider-value" id="transparencyValue">${Math.round(settings.transparency * 100)}%</div>
            <input type="range" min="10" max="100" value="${Math.round(settings.transparency * 100)}" class="sigma-slider" id="transparencySlider">
        </div>
        
        <div class="sigma-tab-content" data-tab-content="combat">
            <button class="sigma-button" id="aimHelperButton">Aim Helper: Off</button>
            <button class="sigma-button" id="autoAimButton">Auto Aim: Off</button>
            <button class="sigma-button" id="autoHealButton">Auto Heal: Off</button>
            <button class="sigma-button" id="speedHackButton">Speed Hack: Off</button>
        </div>
        
        <div class="sigma-tab-content" data-tab-content="info">
            <button class="sigma-button" id="pingButton">Show Ping: Off</button>
            <button class="sigma-button" id="fpsButton">Show FPS: Off</button>
            <button class="sigma-button" id="playerCountsButton">Server Player Counts</button>
            <button class="sigma-button" id="portalTimerButton">Abyss Portal Timer</button>
            <button class="sigma-button" id="rareShapesButton">Rare Shape Notifications</button>
        </div>
    `;
    document.body.appendChild(gui);

    // Create settings panel
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'settings-panel';
    settingsPanel.innerHTML = `
        <div class="settings-header">Sigma Client Settings</div>
        
        <div class="settings-group">
            <label class="settings-label">Hotkey</label>
            <input type="text" class="settings-input" id="hotkeyInput" value="${settings.hotkey}" maxlength="1">
        </div>
        
        <div class="settings-group">
            <label class="settings-label">Theme</label>
            <select class="settings-select" id="themeSelect">
                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="cyber" ${settings.theme === 'cyber' ? 'selected' : ''}>Cyber</option>
            </select>
        </div>
        
        <div class="settings-group">
            <label class="settings-label">Features</label>
            <div>
                <input type="checkbox" class="settings-checkbox" id="tracersCheckbox" ${settings.features.tracers ? 'checked' : ''}>
                <label for="tracersCheckbox">Tracers</label>
            </div>
            <div>
                <input type="checkbox" class="settings-checkbox" id="espCheckbox" ${settings.features.esp ? 'checked' : ''}>
                <label for="espCheckbox">ESP</label>
            </div>
            <div>
                <input type="checkbox" class="settings-checkbox" id="minimapCheckbox" ${settings.features.minimap ? 'checked' : ''}>
                <label for="minimapCheckbox">Minimap</label>
            </div>
            <div>
                <input type="checkbox" class="settings-checkbox" id="aimHelperCheckbox" ${settings.features.aimHelper ? 'checked' : ''}>
                <label for="aimHelperCheckbox">Aim Helper</label>
            </div>
            <div>
                <input type="checkbox" class="settings-checkbox" id="autoAimCheckbox" ${settings.features.autoAim ? 'checked' : ''}>
                <label for="autoAimCheckbox">Auto Aim</label>
            </div>
            <div>
                <input type="checkbox" class="settings-checkbox" id="autoHealCheckbox" ${settings.features.autoHeal ? 'checked' : ''}>
                <label for="autoHealCheckbox">Auto Heal</label>
            </div>
            <div>
                <input type="checkbox" class="settings-checkbox" id="speedHackCheckbox" ${settings.features.speedHack ? 'checked' : ''}>
                <label for="speedHackCheckbox">Speed Hack</label>
            </div>
        </div>
        
        <button class="settings-button" id="saveSettingsButton">Save Settings</button>
        <button class="settings-button" id="closeSettingsButton">Close</button>
    `;
    document.body.appendChild(settingsPanel);

    // Create status popup
    const statusPopup = document.createElement('div');
    statusPopup.className = 'status-popup';
    document.body.appendChild(statusPopup);

    // Create ping display
    const pingDisplay = document.createElement('div');
    pingDisplay.className = 'ping-display';
    pingDisplay.style.display = 'none';
    document.body.appendChild(pingDisplay);

    // Create FPS display
    const fpsDisplay = document.createElement('div');
    fpsDisplay.className = 'fps-display';
    fpsDisplay.style.display = 'none';
    document.body.appendChild(fpsDisplay);

    // Create minimap
    const minimap = document.createElement('div');
    minimap.className = 'minimap';
    minimap.style.display = 'none';
    document.body.appendChild(minimap);

    // State variables
    let state = {
        tracersEnabled: false,
        aimHelperEnabled: false,
        espEnabled: false,
        minimapEnabled: false,
        noDarkEnabled: false,
        pingVisible: false,
        fpsVisible: false,
        autoAimEnabled: false,
        autoHealEnabled: false,
        speedHackEnabled: false,
        allFeaturesEnabled: false,
        lastPing: 0,
        lastFPS: 0,
        lastUpdateCheck: 0,
        aimHelperLine: null,
        gunElement: null,
        tracers: [],
        espBoxes: [],
        espNames: [],
        minimapEntities: [],
        minimapPlayer: null,
        lastFrameTime: performance.now(),
        frameCount: 0,
        lastFpsUpdate: 0
    };

    // Initialize elements
    function initElements() {
        // Create aim helper line if it doesn't exist
        if (!state.aimHelperLine) {
            state.aimHelperLine = document.createElement('div');
            state.aimHelperLine.className = 'aim-helper-line';
            document.body.appendChild(state.aimHelperLine);
        }

        // Create gun element if it doesn't exist
        if (!state.gunElement) {
            state.gunElement = document.createElement('div');
            state.gunElement.className = 'gun';
            document.body.appendChild(state.gunElement);
        }

        // Create minimap player indicator
        if (!state.minimapPlayer) {
            state.minimapPlayer = document.createElement('div');
            state.minimapPlayer.className = 'minimap-player';
            minimap.appendChild(state.minimapPlayer);
            
            // Position at center of minimap
            state.minimapPlayer.style.left = '97px';
            state.minimapPlayer.style.top = '97px';
        }
    }

    // Initialize the elements
    initElements();

    // Show notification
    function showNotification(title, message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Hide after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Show status message
    function showStatus(message, duration = 2000) {
        statusPopup.textContent = message;
        statusPopup.style.display = 'block';
        setTimeout(() => {
            statusPopup.style.display = 'none';
        }, duration);
    }

    // Toggle GUI visibility
    function toggleGUI() {
        gui.style.display = gui.style.display === 'none' ? 'block' : 'none';
    }

    // Tab switching
    document.querySelectorAll('.sigma-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.sigma-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.sigma-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show corresponding tab content
            const tabName = this.getAttribute('data-tab');
            document.querySelector(`.sigma-tab-content[data-tab-content="${tabName}"]`).classList.add('active');
        });
    });

    // Event Listeners
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === settings.hotkey.toLowerCase()) {
            toggleGUI();
        }
    });

    document.querySelector('.sigma-close').addEventListener('click', toggleGUI);

    // Settings button
    document.getElementById('settingsButton').addEventListener('click', openSettingsPanel);

    function openSettingsPanel() {
        settingsPanel.style.display = 'block';
        gui.style.display = 'none';
    }

    // Close settings button
    document.getElementById('closeSettingsButton').addEventListener('click', function() {
        settingsPanel.style.display = 'none';
        gui.style.display = 'block';
    });

    // Save settings button
    document.getElementById('saveSettingsButton').addEventListener('click', function() {
        const newHotkey = document.getElementById('hotkeyInput').value.toLowerCase();
        const newTheme = document.getElementById('themeSelect').value;
        
        // Update features
        settings.features.tracers = document.getElementById('tracersCheckbox').checked;
        settings.features.esp = document.getElementById('espCheckbox').checked;
        settings.features.minimap = document.getElementById('minimapCheckbox').checked;
        settings.features.aimHelper = document.getElementById('aimHelperCheckbox').checked;
        settings.features.autoAim = document.getElementById('autoAimCheckbox').checked;
        settings.features.autoHeal = document.getElementById('autoHealCheckbox').checked;
        settings.features.speedHack = document.getElementById('speedHackCheckbox').checked;
        
        // Save settings
        settings.hotkey = newHotkey;
        settings.theme = newTheme;
        saveSettings(settings);
        
        // Apply theme changes
        applyTheme();
        
        showNotification('Settings Saved', 'Your settings have been saved successfully.');
        settingsPanel.style.display = 'none';
        gui.style.display = 'block';
    });

    // Apply theme changes
    function applyTheme() {
        const theme = themes[settings.theme] || themes.dark;
        
        // Update GUI elements with new theme
        gui.style.backgroundColor = theme.bg.replace('{transparency}', settings.transparency);
        gui.style.borderColor = theme.border;
        gui.style.color = theme.text;
        
        document.querySelector('.sigma-header').style.color = theme.accent;
        document.querySelectorAll('.sigma-button').forEach(button => {
            button.style.backgroundColor = theme.buttonBg;
            button.style.borderColor = theme.border;
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = theme.buttonHover;
            });
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = theme.buttonBg;
            });
        });
        
        // Update other elements
        statusPopup.style.backgroundColor = theme.bg.replace('{transparency}', '0.9');
        statusPopup.style.borderColor = theme.border;
        statusPopup.style.color = theme.text;
        
        pingDisplay.style.backgroundColor = theme.bg.replace('{transparency}', '0.9');
        pingDisplay.style.borderColor = theme.border;
        pingDisplay.style.color = theme.text;
        
        fpsDisplay.style.backgroundColor = theme.bg.replace('{transparency}', '0.9');
        fpsDisplay.style.borderColor = theme.border;
        fpsDisplay.style.color = theme.text;
        
        if (state.aimHelperLine) {
            state.aimHelperLine.style.backgroundColor = theme.accent;
        }
        
        if (state.gunElement) {
            state.gunElement.style.backgroundColor = theme.accent;
        }
        
        // Update tracers
        state.tracers.forEach(tracer => {
            tracer.element.style.backgroundColor = theme.accent;
        });
    }

    // Reset all settings
    function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            GM_setValue('hotkey', config.defaultHotkey);
            GM_setValue('transparency', config.defaultTransparency);
            GM_setValue('theme', config.defaultTheme);
            GM_setValue('features', config.features);
            
            // Reload settings
            Object.assign(settings, loadSettings());
            
            // Update UI
            document.getElementById('hotkeyInput').value = settings.hotkey;
            document.getElementById('themeSelect').value = settings.theme;
            document.getElementById('transparencySlider').value = Math.round(settings.transparency * 100);
            document.getElementById('transparencyValue').textContent = `${Math.round(settings.transparency * 100)}%`;
            
            // Update feature checkboxes
            document.getElementById('tracersCheckbox').checked = settings.features.tracers;
            document.getElementById('espCheckbox').checked = settings.features.esp;
            document.getElementById('minimapCheckbox').checked = settings.features.minimap;
            document.getElementById('aimHelperCheckbox').checked = settings.features.aimHelper;
            document.getElementById('autoAimCheckbox').checked = settings.features.autoAim;
            document.getElementById('autoHealCheckbox').checked = settings.features.autoHeal;
            document.getElementById('speedHackCheckbox').checked = settings.features.speedHack;
            
            // Apply theme
            applyTheme();
            
            showNotification('Settings Reset', 'All settings have been reset to default.');
        }
    }

    // Toggle all features
    document.getElementById('toggleAllButton').addEventListener('click', function() {
        state.allFeaturesEnabled = !state.allFeaturesEnabled;
        
        // Toggle all features based on the allFeaturesEnabled state
        if (state.allFeaturesEnabled) {
            // Enable all features
            if (settings.features.tracers) toggleTracers(true);
            if (settings.features.esp) toggleESP(true);
            if (settings.features.minimap) toggleMinimap(true);
            if (settings.features.aimHelper) toggleAimHelper(true);
            if (settings.features.autoAim) toggleAutoAim(true);
            if (settings.features.autoHeal) toggleAutoHeal(true);
            if (settings.features.speedHack) toggleSpeedHack(true);
            
            showStatus('All features enabled');
        } else {
            // Disable all features
            toggleTracers(false);
            toggleESP(false);
            toggleMinimap(false);
            toggleAimHelper(false);
            toggleAutoAim(false);
            toggleAutoHeal(false);
            toggleSpeedHack(false);
            
            showStatus('All features disabled');
        }
        
        this.textContent = state.allFeaturesEnabled ? 'Disable All Features' : 'Enable All Features';
    });

    // Tracers Button
    document.getElementById('tracersButton').addEventListener('click', function() {
        toggleTracers(!state.tracersEnabled);
    });

    function toggleTracers(enable) {
        state.tracersEnabled = enable;
        document.getElementById('tracersButton').textContent = `Tracers: ${enable ? 'On' : 'Off'}`;
        document.getElementById('tracersButton').style.background = enable ? currentTheme.buttonHover : currentTheme.buttonBg;
        
        if (enable) {
            startTrackingPlayers();
        } else {
            removeTracers();
        }
    }

    // ESP Button
    document.getElementById('espButton').addEventListener('click', function() {
        toggleESP(!state.espEnabled);
    });

    function toggleESP(enable) {
        state.espEnabled = enable;
        document.getElementById('espButton').textContent = `ESP: ${enable ? 'On' : 'Off'}`;
        document.getElementById('espButton').style.background = enable ? currentTheme.buttonHover : currentTheme.buttonBg;
        
        if (enable) {
            startESP();
        } else {
            removeESP();
        }
    }

    // Minimap Button
    document.getElementById('minimapButton').addEventListener('click', function() {
        toggleMinimap(!state.minimapEnabled);
    });

    function toggleMinimap(enable) {
        state.minimapEnabled = enable;
        document.getElementById('minimapButton').textContent = `Minimap: ${enable ? 'On' : 'Off'}`;
        document.getElementById('minimapButton').style.background = enable ? currentTheme.buttonHover : currentTheme.buttonBg;
        minimap.style.display = enable ? 'block' : 'none';
        
        if (enable) {
            startMinimap();
        } else {
            stopMinimap();
        }
    }

    // Aim Helper Button
    document.getElementById('aimHelperButton').addEventListener('click', function() {
        toggleAimHelper(!state.aimHelperEnabled);
    });

    function toggleAimHelper(enable) {
        state.aimHelperEnabled = enable;
        document.getElementById('aimHelperButton').textContent = `Aim Helper: ${enable ? 'On' : 'Off'}`;
        document.getElementById('aimHelperButton').style.background = enable ? currentTheme.buttonHover : currentTheme.buttonBg;
        
        if (enable) {
            createAimHelperLine();
            state.gunElement.style.display = 'block';
        } else {
            if (state.aimHelperLine) {
                state.aimHelperLine.style.display = 'none';
            }
            if (state.gunElement) {
                state.gunElement.style.display = 'none';
            }
            document.removeEventListener('mousemove', updateAimHelperLine);
        }
    }

    // Auto Aim Button
    document.getElementById('autoAimButton').addEventListener('click', function() {
        toggleAutoAim(!state.autoAimEnabled);
    });

    function toggleAutoAim(enable) {
        state.autoAimEnabled = enable;
        document.getElementById('autoAimButton').textContent = `Auto Aim: ${enable ? 'On' : 'Off'}`;
        document.getElementById('autoAimButton').style.background = enable ? currentTheme.buttonHover : currentTheme.buttonBg;
        
        if (enable) {
            startAutoAim();
            showNotification('Auto Aim', 'Auto Aim feature activated. Closest target will be automatically tracked.');
        } else {
            stopAutoAim();
        }
    }

    // Auto Heal Button
    document.getElementById('autoHealButton').addEventListener('click', function() {
        toggleAutoHeal(!state.autoHealEnabled);
    });

    function toggleAutoHeal(enable) {
        state.autoHealEnabled = enable;
        document.getElementById('autoHealButton').textContent = `Auto Heal: ${enable ? 'On' : 'Off'}`;
        document.getElementById('autoHealButton').style.background = enable ? currentTheme.buttonHover : currentTheme.buttonBg;
        
        if (enable) {
            startAutoHeal();
            showNotification('Auto Heal', 'Auto Heal feature activated. Health will be automatically managed.');
        } else {
            stopAutoHeal();
        }
    }

    // Speed Hack Button
    document.getElementById('speedHackButton').addEventListener('click', function() {
        toggleSpeedHack(!state.speedHackEnabled);
    });

    function toggleSpeedHack(enable) {
        state.speedHackEnabled = enable;
        document.getElementById('speedHackButton').textContent = `Speed Hack: ${enable ? 'On' : 'Off'}`;
        document.getElementById('speedHackButton').style.background = enable ? currentTheme.buttonHover : currentTheme.buttonBg;
        
        if (enable) {
            startSpeedHack();
            showNotification('Speed Hack', 'Speed Hack feature activated. Movement speed increased.');
        } else {
            stopSpeedHack();
        }
    }

    // NoDark Button
    document.getElementById('noDarkButton').addEventListener('click', function() {
        state.noDarkEnabled = !state.noDarkEnabled;
        document.getElementById('noDarkButton').textContent = `NoDark: ${state.noDarkEnabled ? 'On' : 'Off'}`;
        document.getElementById('noDarkButton').style.background = state.noDarkEnabled ? currentTheme.buttonHover : currentTheme.buttonBg;
        
        if (state.noDarkEnabled) {
            document.body.style.backgroundColor = "#fff";
            document.body.style.color = "#000";
        } else {
            document.body.style.backgroundColor = "";
            document.body.style.color = "";
        }
    });

    // Show Ping Button
    document.getElementById('pingButton').addEventListener('click', function() {
        state.pingVisible = !state.pingVisible;
        document.getElementById('pingButton').textContent = `Show Ping: ${state.pingVisible ? 'On' : 'Off'}`;
        document.getElementById('pingButton').style.background = state.pingVisible ? currentTheme.buttonHover : currentTheme.buttonBg;
        pingDisplay.style.display = state.pingVisible ? 'block' : 'none';
        
        if (state.pingVisible) {
            updatePing();
        }
    });

    // Show FPS Button
    document.getElementById('fpsButton').addEventListener('click', function() {
        state.fpsVisible = !state.fpsVisible;
        document.getElementById('fpsButton').textContent = `Show FPS: ${state.fpsVisible ? 'On' : 'Off'}`;
        document.getElementById('fpsButton').style.background = state.fpsVisible ? currentTheme.buttonHover : currentTheme.buttonBg;
        fpsDisplay.style.display = state.fpsVisible ? 'block' : 'none';
        
        if (state.fpsVisible) {
            updateFPS();
        }
    });

    // Transparency Slider
    document.getElementById('transparencySlider').addEventListener('input', function() {
        const value = this.value;
        document.getElementById('transparencyValue').textContent = `${value}%`;
        settings.transparency = value / 100;
        gui.style.backgroundColor = currentTheme.bg.replace('{transparency}', settings.transparency);
        GM_setValue('transparency', settings.transparency);
    });

    // Server Player Counts Button
    document.getElementById('playerCountsButton').addEventListener('click', function() {
        showStatus('Fetching Server Player Counts...');
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://expandedwater.online:3000/api/messages/1117612925666996254",
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    showStatus(`Server Player Counts: ${JSON.stringify(data)}`);
                } catch (e) {
                    showStatus('Error parsing player counts data');
                }
            },
            onerror: function() {
                showStatus('Error fetching player counts');
            }
        });
    });

    // Abyss Server Portal Timer Button
    document.getElementById('portalTimerButton').addEventListener('click', function() {
        showStatus('Fetching Abyss Server Portal Timer...');
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://expandedwater.online:3000/api/messages/1187917859742027786",
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    showStatus(`Abyss Server Portal Timer: ${JSON.stringify(data)}`);
                } catch (e) {
                    showStatus('Error parsing portal timer data');
                }
            },
            onerror: function() {
                showStatus('Error fetching portal timer');
            }
        });
    });

    // Rare Shape Notifications Button
    document.getElementById('rareShapesButton').addEventListener('click', function() {
        showStatus('Fetching Rare Shape Notifications...');
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://expandedwater.online:3000/api/messages/1221635977987100874",
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    showStatus(`Rare Shape Notifications: ${JSON.stringify(data)}`);
                } catch (e) {
                    showStatus('Error parsing rare shapes data');
                }
            },
            onerror: function() {
                showStatus('Error fetching rare shapes');
            }
        });
    });

    // Update button
    document.getElementById('updateButton').addEventListener('click', function() {
        checkForUpdates(true);
    });

    // Help button
    document.getElementById('helpButton').addEventListener('click', function() {
        showNotification('Sigma Client Help', `
            <strong>Hotkey:</strong> ${settings.hotkey.toUpperCase()} to toggle GUI<br>
            <strong>Version:</strong> ${config.version}<br>
            <strong>Features:</strong> Tracers, ESP, Minimap, Aim Helper, and more!<br>
            <strong>Note:</strong> Some features may require game-specific implementations.
        `, 5000);
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
        if (settingsPanel.style.display === 'block' && !settingsPanel.contains(e.target)) {
            settingsPanel.style.display = 'none';
            gui.style.display = 'block';
        }
    });

    // Start tracking players and create tracers
    function startTrackingPlayers() {
        // Get visible players on screen
        const visiblePlayers = getVisiblePlayers();

        visiblePlayers.forEach(player => {
            const tracerLine = document.createElement('div');
            tracerLine.className = 'tracer-line';
            document.body.appendChild(tracerLine);

            // Store tracer line for later updates
            state.tracers.push({
                playerId: player.id,
                element: tracerLine,
                updatePosition: () => updateTracerPosition(player, tracerLine)
            });
        });

        // Update tracers position every frame
        if (state.tracersEnabled) {
            requestAnimationFrame(updateTracers);
        }
    }

    // Remove all tracer lines
    function removeTracers() {
        state.tracers.forEach(tracer => {
            tracer.element.remove();
        });
        state.tracers = [];
    }

    // Update tracers position
    function updateTracers() {
        state.tracers.forEach(tracer => {
            const player = getPlayerById(tracer.playerId);
            if (player) {
                tracer.updatePosition();
            }
        });

        if (state.tracersEnabled) {
            requestAnimationFrame(updateTracers);
        }
    }

    // Update the tracer line to point towards the player's position
    function updateTracerPosition(player, tracerLine) {
        const gunPosition = getPlayerGunPosition();
        const playerPosition = getPlayerPosition(player);

        const deltaX = playerPosition.x - gunPosition.x;
        const deltaY = playerPosition.y - gunPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        tracerLine.style.width = `${distance}px`;
        tracerLine.style.transform = `rotate(${angle}deg)`;
        tracerLine.style.left = `${gunPosition.x}px`;
        tracerLine.style.top = `${gunPosition.y}px`;
    }

    // Start ESP
    function startESP() {
        const visiblePlayers = getVisiblePlayers();
        
        visiblePlayers.forEach(player => {
            // Create ESP box
            const espBox = document.createElement('div');
            espBox.className = 'esp-box';
            document.body.appendChild(espBox);
            
            // Create ESP name tag
            const espName = document.createElement('div');
            espName.className = 'esp-name';
            espName.textContent = player.name || `Player ${player.id}`;
            document.body.appendChild(espName);
            
            // Store ESP elements
            state.espBoxes.push({
                playerId: player.id,
                element: espBox,
                updatePosition: () => updateESPPosition(player, espBox, espName)
            });
            
            state.espNames.push({
                playerId: player.id,
                element: espName
            });
        });
        
        // Update ESP positions
        if (state.espEnabled) {
            requestAnimationFrame(updateESP);
        }
    }

    // Remove ESP
    function removeESP() {
        state.espBoxes.forEach(esp => {
            esp.element.remove();
        });
        state.espNames.forEach(esp => {
            esp.element.remove();
        });
        state.espBoxes = [];
        state.espNames = [];
    }

    // Update ESP positions
    function updateESP() {
        state.espBoxes.forEach(esp => {
            const player = getPlayerById(esp.playerId);
            if (player) {
                esp.updatePosition();
            }
        });

        if (state.espEnabled) {
            requestAnimationFrame(updateESP);
        }
    }

    // Update ESP box and name position
    function updateESPPosition(player, espBox, espName) {
        const playerPosition = getPlayerPosition(player);
        const playerSize = getPlayerSize(player);
        
        // Update ESP box
        espBox.style.left = `${playerPosition.x - playerSize.width/2}px`;
        espBox.style.top = `${playerPosition.y - playerSize.height/2}px`;
        espBox.style.width = `${playerSize.width}px`;
        espBox.style.height = `${playerSize.height}px`;
        espBox.style.display = 'block';
        
        // Update ESP name
        espName.style.left = `${playerPosition.x - playerSize.width/2}px`;
        espName.style.top = `${playerPosition.y - playerSize.height/2 - 20}px`;
        espName.style.display = 'block';
    }

    // Start minimap
    function startMinimap() {
        updateMinimap();
    }

    // Stop minimap
    function stopMinimap() {
        // Remove all entities from minimap
        state.minimapEntities.forEach(entity => {
            entity.element.remove();
        });
        state.minimapEntities = [];
    }

    // Update minimap
    function updateMinimap() {
        // Clear existing entities
        state.minimapEntities.forEach(entity => {
            entity.element.remove();
        });
        state.minimapEntities = [];
        
        // Get player and entities
        const player = getLocalPlayer();
        const entities = getEntities();
        
        // Add entities to minimap
        entities.forEach(entity => {
            const entityElement = document.createElement('div');
            entityElement.className = 'minimap-entity';
            
            // Calculate position relative to player (simplified)
            const relX = (entity.x - player.x) / 10 + 100;
            const relY = (entity.y - player.y) / 10 + 100;
            
            entityElement.style.left = `${Math.max(0, Math.min(200, relX))}px`;
            entityElement.style.top = `${Math.max(0, Math.min(200, relY))}px`;
            
            minimap.appendChild(entityElement);
            state.minimapEntities.push({
                id: entity.id,
                element: entityElement
            });
        });
        
        // Update player position (center)
        state.minimapPlayer.style.left = '97px';
        state.minimapPlayer.style.top = '97px';
        
        if (state.minimapEnabled) {
            requestAnimationFrame(updateMinimap);
        }
    }

    // Start auto aim
    function startAutoAim() {
        // Find closest player and aim at them
        const closestPlayer = findClosestPlayer();
        if (closestPlayer) {
            // Simulate aiming at the closest player
            const playerPosition = getPlayerPosition(closestPlayer);
            const gunPosition = getPlayerGunPosition();
            
            const deltaX = playerPosition.x - gunPosition.x;
            const deltaY = playerPosition.y - gunPosition.y;
            const angle = Math.atan2(deltaY, deltaX);
            
            // In a real implementation, you would set the player's aim angle here
            // For this example, we'll just log it
            console.log(`Auto Aiming at player ${closestPlayer.id} with angle ${angle}`);
        }
        
        if (state.autoAimEnabled) {
            setTimeout(startAutoAim, 100); // Check every 100ms
        }
    }

    // Stop auto aim
    function stopAutoAim() {
        // Nothing needed here in this example
    }

    // Start auto heal
    function startAutoHeal() {
        const player = getLocalPlayer();
        if (player.health < player.maxHealth * 0.7) {
            // Simulate healing
            console.log("Auto Healing activated");
            // In a real implementation, you would trigger the heal action here
        }
        
        if (state.autoHealEnabled) {
            setTimeout(startAutoHeal, 1000); // Check every second
        }
    }

    // Stop auto heal
    function stopAutoHeal() {
        // Nothing needed here in this example
    }

    // Start speed hack
    function startSpeedHack() {
        const player = getLocalPlayer();
        // Simulate speed boost
        player.speed *= 1.5;
        console.log("Speed Hack activated - Movement speed increased");
    }

    // Stop speed hack
    function stopSpeedHack() {
        const player = getLocalPlayer();
        // Reset speed
        player.speed /= 1.5;
        console.log("Speed Hack deactivated - Movement speed normal");
    }

    // Create and position the Aim Helper line
    function createAimHelperLine() {
        if (!state.aimHelperLine) {
            state.aimHelperLine = document.createElement('div');
            state.aimHelperLine.className = 'aim-helper-line';
            document.body.appendChild(state.aimHelperLine);
        }

        state.aimHelperLine.style.display = 'block';
        document.addEventListener('mousemove', updateAimHelperLine);
    }

    // Update the line to follow the mouse from the gun's position
    function updateAimHelperLine(event) {
        if (state.aimHelperLine && state.gunElement) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const gunPosition = getPlayerGunPosition();

            state.gunElement.style.left = `${gunPosition.x}px`;
            state.gunElement.style.top = `${gunPosition.y}px`;

            state.aimHelperLine.style.left = `${gunPosition.x + state.gunElement.offsetWidth / 2}px`;
            state.aimHelperLine.style.top = `${gunPosition.y + state.gunElement.offsetHeight / 2}px`;

            const deltaX = mouseX - gunPosition.x;
            const deltaY = mouseY - gunPosition.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

            state.aimHelperLine.style.width = `${distance}px`;
            state.aimHelperLine.style.transform = `rotate(${angle}deg)`;
        }
    }

    // Update Ping
    function updatePing() {
        if (state.pingVisible) {
            // Simulate ping - in a real implementation, you would measure actual ping
            state.lastPing = Math.floor(Math.random() * 50) + 20;
            pingDisplay.textContent = `Ping: ${state.lastPing}ms`;
            setTimeout(updatePing, 1000);
        }
    }

    // Update FPS
    function updateFPS() {
        if (state.fpsVisible) {
            const now = performance.now();
            state.frameCount++;
            
            if (now >= state.lastFpsUpdate + 1000) {
                state.lastFPS = Math.round((state.frameCount * 1000) / (now - state.lastFpsUpdate));
                state.frameCount = 0;
                state.lastFpsUpdate = now;
                
                fpsDisplay.textContent = `FPS: ${state.lastFPS}`;
            }
            
            requestAnimationFrame(updateFPS);
        }
    }

    // Check for updates
    function checkForUpdates(manualCheck = false) {
        const now = Date.now();
        if (!manualCheck && now - state.lastUpdateCheck < 3600000) { // 1 hour
            return;
        }
        
        state.lastUpdateCheck = now;
        showStatus('Checking for updates...');
        
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://github.com/jyoeymama/SigmaClient",
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    const latestVersion = data.tag_name.replace('v', '');
                    
                    if (compareVersions(latestVersion, config.version) {
                        showNotification('Update Available', `Version ${latestVersion} is available! Current version: ${config.version}`, 5000);
                    } else if (manualCheck) {
                        showNotification('No Updates', `You have the latest version (${config.version})`, 3000);
                    }
                } catch (e) {
                    if (manualCheck) {
                        showNotification('Update Check Failed', 'Could not check for updates', 3000);
                    }
                }
            },
            onerror: function() {
                if (manualCheck) {
                    showNotification('Update Check Failed', 'Could not connect to update server', 3000);
                }
            }
        });
    }

    // Compare versions
    function compareVersions(newVersion, currentVersion) {
        const newParts = newVersion.split('.').map(Number);
        const currentParts = currentVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
            const newPart = newParts[i] || 0;
            const currentPart = currentParts[i] || 0;
            
            if (newPart > currentPart) return true;
            if (newPart < currentPart) return false;
        }
        
        return false;
    }

    // Dummy function to get visible players (replace with actual game implementation)
    function getVisiblePlayers() {
        // This is a placeholder - in a real implementation, you would access the game's player list
        return [
            { id: 1, x: 100, y: 200, name: "Player1", health: 100, maxHealth: 100 },
            { id: 2, x: 300, y: 400, name: "Player2", health: 75, maxHealth: 100 }
        ];
    }

    // Dummy function to get player position (replace with actual game implementation)
    function getPlayerPosition(player) {
        return { x: player.x, y: player.y };
    }

    // Dummy function to get player size (replace with actual game implementation)
    function getPlayerSize(player) {
        return { width: 50, height: 50 }; // Assuming players are 50x50 pixels
    }

    // Dummy function to get player by ID (replace with actual game implementation)
    function getPlayerById(id) {
        return { id: id, x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };
    }

    // Dummy function to get local player (replace with actual game implementation)
    function getLocalPlayer() {
        return { 
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2,
            health: 80,
            maxHealth: 100,
            speed: 5
        };
    }

    // Dummy function to get entities (replace with actual game implementation)
    function getEntities() {
        return [
            { id: 1, x: window.innerWidth / 2 + 100, y: window.innerHeight / 2 + 100 },
            { id: 2, x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 50 }
        ];
    }

    // Dummy function to find closest player (replace with actual game implementation)
    function findClosestPlayer() {
        const players = getVisiblePlayers();
        if (players.length === 0) return null;
        
        // Just return the first player for this example
        return players[0];
    }

    // Function to get the player's gun position (replace with actual game implementation)
    function getPlayerGunPosition() {
        return {
            x: window.innerWidth / 2 - 15,
            y: window.innerHeight / 2 - 15
        };
    }

    // Initialize features based on settings
    function initializeFeatures() {
        if (settings.features.tracers) {
            document.getElementById('tracersButton').click();
        }
        if (settings.features.esp) {
            document.getElementById('espButton').click();
        }
        if (settings.features.minimap) {
            document.getElementById('minimapButton').click();
        }
        if (settings.features.aimHelper) {
            document.getElementById('aimHelperButton').click();
        }
        if (settings.features.autoAim) {
            document.getElementById('autoAimButton').click();
        }
        if (settings.features.autoHeal) {
            document.getElementById('autoHealButton').click();
        }
        if (settings.features.speedHack) {
            document.getElementById('speedHackButton').click();
        }
    }

    // Check for updates periodically
    setInterval(checkForUpdates, 3600000); // Check every hour
    checkForUpdates();

    // Initialize features
    initializeFeatures();

    // Show welcome message
    setTimeout(() => {
        showNotification('Sigma Client Loaded', `Press ${settings.hotkey.toUpperCase()} to open the menu`, 3000);
    }, 1000);
})();
