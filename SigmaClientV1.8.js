// ==UserScript==
// @name         Sigma Client v1.6 - GUI Customizable Edition
// @namespace    http://tampermonkey.net/
// @version      1.6.1
// @description  Hacks for scenexe2.io (full GUI customization panel embedded). Only GUI changed. Keep all original features intact.
// @match        *://*.scenexe2.io/*
// @grant        GM_addStyle
// ==/UserScript==

// PLEASE NOTE SOME THINGS MIGHT NOT WORK, THIS IS A WORK IN PROGRESS!

(function() {
    'use strict';
    const DEFAULT_SETTINGS = {
        headerText: 'Sigma Client V1.8',
        bgColor: '#000000',
        bgAlpha: 0.8,
        textColor: '#ffffff',
        borderColor: '#ff8c00',
        borderWidth: 2,
        borderRadius: 5,
        padding: 15,
        minWidth: 300,
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        buttonColor: '#ff8c00',
        buttonHoverColor: '#ffa500',
        position: 'center', 
        theme: 'dark' 
    };


    function loadSettings() {
        try {
            const raw = localStorage.getItem('sigma_gui_settings_v1');
            if (!raw) return {...DEFAULT_SETTINGS};
            const parsed = JSON.parse(raw);
            return Object.assign({}, DEFAULT_SETTINGS, parsed);
        } catch (e) {
            console.error('Failed to load sigma settings:', e);
            return {...DEFAULT_SETTINGS};
        }
    }

    function saveSettings(settings) {
        localStorage.setItem('sigma_gui_settings_v1', JSON.stringify(settings));
    }

    function resetSettings() {
        localStorage.removeItem('sigma_gui_settings_v1');
        settings = {...DEFAULT_SETTINGS};
        applySettings();
        populateControls();
        showStatus('Settings reset to defaults', 2000);
    }


    function applyThemePreset(name) {
        switch (name) {
            case 'dark':
                settings.bgColor = '#000000';
                settings.bgAlpha = 0.8;
                settings.textColor = '#ffffff';
                settings.borderColor = '#ff8c00';
                settings.buttonColor = '#ff8c00';
                settings.buttonHoverColor = '#ffa500';
                settings.fontFamily = 'Arial, sans-serif';
                break;
            case 'light':
                settings.bgColor = '#f4f4f4';
                settings.bgAlpha = 0.95;
                settings.textColor = '#111111';
                settings.borderColor = '#333333';
                settings.buttonColor = '#333333';
                settings.buttonHoverColor = '#555555';
                settings.fontFamily = 'Helvetica, Arial, sans-serif';
                break;
            case 'neon':
                settings.bgColor = '#041017';
                settings.bgAlpha = 0.6;
                settings.textColor = '#E6FFFB';
                settings.borderColor = '#39FF14';
                settings.buttonColor = '#ff00ff';
                settings.buttonHoverColor = '#ff6cff';
                settings.fontFamily = 'Verdana, Geneva, sans-serif';
                break;
            case 'minimal':
                settings.bgColor = '#111111';
                settings.bgAlpha = 0.6;
                settings.textColor = '#dcdcdc';
                settings.borderColor = 'transparent';
                settings.buttonColor = '#666666';
                settings.buttonHoverColor = '#888888';
                settings.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto';
                break;
            case 'glass':
                settings.bgColor = '#ffffff';
                settings.bgAlpha = 0.12;
                settings.textColor = '#ffffff';
                settings.borderColor = 'rgba(255,255,255,0.15)';
                settings.buttonColor = 'rgba(255,255,255,0.12)';
                settings.buttonHoverColor = 'rgba(255,255,255,0.22)';
                settings.fontFamily = '"Segoe UI", Roboto, Helvetica, Arial';
                break;
            default:
                break;
        }
        saveSettings(settings);
        applySettings();
        populateControls();
        showStatus(`Applied theme: ${name}`, 1200);
    }


    let settings = loadSettings();


    GM_addStyle(`
        .sigma-gui {
            position: fixed;
            transform: translate(-50%, -50%);
            z-index: 9999;
            display: none;
            box-sizing: border-box;
            user-select: none;
            -webkit-user-select: none;
        }
        .sigma-header {
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-sizing: border-box;
        }
        .sigma-close {
            cursor: pointer;
            user-select: none;
        }
        .sigma-button {
            border-radius: 3px;
            cursor: pointer;
            transition: background 0.15s, transform 0.08s;
            border: 1px solid transparent;
        }
        .sigma-button:active { transform: translateY(1px); }
        .sigma-section { margin-bottom: 8px; }
        .sigma-customize {
            margin-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.06);
            padding-top: 10px;
            display: none;
            max-height: 320px;
            overflow-y: auto;
        }
        .sigma-row { display:flex; align-items:center; gap:8px; margin:6px 0; flex-wrap:wrap; }
        .sigma-row label { min-width: 110px; font-size: 13px; }
        .sigma-input { flex: 1 1 auto; min-width: 120px; }
        .sigma-small { font-size: 12px; padding:6px; border-radius:4px; }
        .sigma-resizer {
            width: 14px; height: 14px; position: absolute; right: 6px; bottom: 6px; cursor: se-resize; opacity: 0.6;
        }
        .sigma-handle { width: 12px; height: 12px; background: rgba(255,255,255,0.08); border-radius:2px; }
        .status-popup {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 18px;
            border-radius: 5px;
            display: none;
            z-index: 10000;
            font-family: Arial, sans-serif;
        }
        .ping-display, .fps-display {
            position: fixed;
            background: rgba(0,0,0,0.6);
            padding: 6px 10px;
            border-radius: 4px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 10000;
        }
        .ping-display { top: 10px; right: 10px; }
        .fps-display { top: 40px; right: 10px; }
        /* aim + tracer classes are preserved */
        .aim-helper-line { position: absolute; height: 2px; background-color: orange; z-index: 1000; display: none; }
        .gun { position: absolute; background-color: red; width: 30px; height: 30px; z-index: 1000; }
        .tracer-line { position: absolute; height: 2px; background-color: orange; z-index: 1000; }
    `);

    const gui = document.createElement('div');
    gui.className = 'sigma-gui';
    gui.setAttribute('role', 'dialog');
    gui.innerHTML = `
        <div class="sigma-header" id="sigmaHeader">
            <div id="sigmaTitle" style="flex:1; text-align:center; font-weight:bold;"></div>
            <div class="sigma-close" id="sigmaClose" title="Close">X</div>
        </div>
        <div class="sigma-body" id="sigmaBody" style="box-sizing:border-box;">
            <div class="sigma-section" id="sigmaButtons">
                <button class="sigma-button sigma-small" id="tracersButton">Tracers</button>
                <button class="sigma-button sigma-small" id="aimHelperButton">Aim Helper</button>
                <button class="sigma-button sigma-small" id="noDarkButton">NoDark</button>
                <button class="sigma-button sigma-small" id="pingButton">Show Ping</button>
                <button class="sigma-button sigma-small" id="fpsButton">Show FPS</button>
                <button class="sigma-button sigma-small" id="transparencyButton">Adjust Transparency</button>
                <button class="sigma-button sigma-small" id="playerCountsButton">Server Player Counts</button>
                <button class="sigma-button sigma-small" id="portalTimerButton">Rare Shape Notifications</button>
                <button class="sigma-button sigma-small" id="rareShapesButton">Abyss Server Portal Timer</button>
            </div>

            <div class="sigma-section">
                <button class="sigma-button sigma-small" id="toggleCustomize">Customize GUI</button>
                <button class="sigma-button sigma-small" id="exportSettings">Export</button>
                <button class="sigma-button sigma-small" id="importSettings">Import</button>
                <button class="sigma-button sigma-small" id="resetSettings">Reset</button>
            </div>

            <div class="sigma-customize" id="customizePanel" aria-hidden="true">
                <!-- Customization controls go here -->
                <div class="sigma-row">
                    <label>Header Text</label>
                    <input class="sigma-input sigma-small" id="inputHeaderText" type="text" />
                </div>

                <div class="sigma-row">
                    <label>Theme Presets</label>
                    <select id="presetTheme" class="sigma-small sigma-input">
                        <option value="">— Choose —</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="neon">Neon</option>
                        <option value="minimal">Minimal</option>
                        <option value="glass">Transparent Glass</option>
                    </select>
                    <button class="sigma-button sigma-small" id="applyPresetBtn">Apply</button>
                </div>

                <div class="sigma-row">
                    <label>Background</label>
                    <input id="bgColor" type="color" class="sigma-small" />
                    <label style="width:auto">Alpha</label>
                    <input id="bgAlpha" type="range" min="0" max="1" step="0.01" class="sigma-small" />
                    <span id="bgAlphaVal" style="min-width:36px; text-align:center;"></span>
                </div>

                <div class="sigma-row">
                    <label>Text Color</label>
                    <input id="textColor" type="color" class="sigma-small" />
                    <label>Border Color</label>
                    <input id="borderColor" type="color" class="sigma-small" />
                </div>

                <div class="sigma-row">
                    <label>Border Width</label>
                    <input id="borderWidth" type="range" min="0" max="8" step="1" class="sigma-small" />
                    <span id="borderWidthVal" style="min-width:24px; text-align:center;"></span>
                    <label style="width:auto">Radius</label>
                    <input id="borderRadius" type="range" min="0" max="40" step="1" class="sigma-small" />
                    <span id="borderRadiusVal" style="min-width:24px; text-align:center;"></span>
                </div>

                <div class="sigma-row">
                    <label>Padding</label>
                    <input id="padding" type="range" min="4" max="40" step="1" class="sigma-small" />
                    <span id="paddingVal" style="min-width:28px; text-align:center;"></span>
                    <label style="width:auto">Min Width</label>
                    <input id="minWidth" type="number" min="200" max="1200" class="sigma-small" />
                </div>

                <div class="sigma-row">
                    <label>Font Family</label>
                    <select id="fontFamily" class="sigma-small sigma-input">
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                        <option value="Verdana, Geneva, sans-serif">Verdana</option>
                        <option value='"Segoe UI", Roboto, "Helvetica Neue", Arial'>Segoe UI</option>
                        <option value='"Courier New", Courier, monospace'>Courier New</option>
                        <option value="system-ui, -apple-system, 'Segoe UI', Roboto">System UI</option>
                    </select>
                    <label style="width:auto">Font Size</label>
                    <select id="fontSize" class="sigma-small">
                        <option value="12">12px</option>
                        <option value="13">13px</option>
                        <option value="14">14px</option>
                        <option value="15">15px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                    </select>
                </div>

                <div class="sigma-row">
                    <label>Button Color</label>
                    <input id="buttonColor" type="color" class="sigma-small" />
                    <label>Hover Color</label>
                    <input id="buttonHoverColor" type="color" class="sigma-small" />
                </div>

                <div class="sigma-row">
                    <label>Position</label>
                    <select id="positionSelect" class="sigma-small sigma-input">
                        <option value="center">Center</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                    </select>
                    <label style="width:auto">Theme</label>
                    <input id="currentTheme" class="sigma-small" readonly />
                </div>

                <div class="sigma-row">
                    <label>Quick Actions</label>
                    <button class="sigma-button sigma-small" id="applyLive">Apply Live</button>
                    <button class="sigma-button sigma-small" id="saveBtn">Save</button>
                </div>
            </div>
        </div>

        <div class="sigma-resizer" id="sigmaResizer" title="Drag to resize">
            <div class="sigma-handle"></div>
        </div>
    `;

    document.body.appendChild(gui);


    const statusPopup = document.createElement('div');
    statusPopup.className = 'status-popup';
    document.body.appendChild(statusPopup);

    const pingDisplay = document.createElement('div');
    pingDisplay.className = 'ping-display';
    pingDisplay.style.display = 'none';
    document.body.appendChild(pingDisplay);

    const fpsDisplay = document.createElement('div');
    fpsDisplay.className = 'fps-display';
    fpsDisplay.style.display = 'none';
    document.body.appendChild(fpsDisplay);


    let tracersEnabled = false;
    let aimHelperEnabled = false;
    let aimHelperLine = null;
    let gunElement = null;
    let noDarkEnabled = false;
    let tracers = [];
    let pingVisible = false;
    let fpsVisible = false;
    let transparency = settings.bgAlpha;


    function showStatus(message, duration = 2000) {
        statusPopup.textContent = message;
        statusPopup.style.display = 'block';
        statusPopup.style.background = `rgba(0,0,0,0.75)`;
        statusPopup.style.color = 'white';
        setTimeout(() => { statusPopup.style.display = 'none'; }, duration);
    }


    function applySettings() {

        const title = document.getElementById('sigmaTitle');
        title.textContent = settings.headerText || DEFAULT_SETTINGS.headerText;


        const currentTheme = document.getElementById('currentTheme');
        currentTheme.value = settings.theme || '';


        gui.style.background = `rgba(${hexToRgb(settings.bgColor)}, ${settings.bgAlpha})`;
        gui.style.color = settings.textColor;
        gui.style.border = `${settings.borderWidth}px solid ${settings.borderColor || 'transparent'}`;
        gui.style.borderRadius = `${settings.borderRadius}px`;
        gui.style.padding = `${settings.padding}px`;
        gui.style.minWidth = `${settings.minWidth}px`;
        gui.style.fontFamily = settings.fontFamily;
        gui.style.fontSize = `${settings.fontSize}px`;
        gui.style.boxShadow = (settings.theme === 'neon') ? '0 6px 30px rgba(255,0,255,0.08), 0 0 10px rgba(57,255,20,0.05)' : '0 6px 18px rgba(0,0,0,0.3)';


        const buttons = gui.querySelectorAll('.sigma-button');
        buttons.forEach(btn => {
            btn.style.background = settings.buttonColor;
            btn.style.color = deriveContrastColor(settings.buttonColor);
            btn.style.border = `1px solid ${settings.borderColor}`;
        });


        addButtonHoverStyles(settings.buttonHoverColor);

        placeGui(settings.position);

        const resizer = document.getElementById('sigmaResizer');
        resizer.style.display = settings.theme === 'minimal' ? 'none' : 'block';
    }


    let hoverStyleEl = null;
    function addButtonHoverStyles(hoverColor) {
        if (hoverStyleEl) hoverStyleEl.remove();
        hoverStyleEl = document.createElement('style');
        hoverStyleEl.textContent = `
            .sigma-button:hover { background: ${hoverColor} !important; }
        `;
        document.head.appendChild(hoverStyleEl);
    }

    function placeGui(pos) {

        gui.style.top = ''; gui.style.left = ''; gui.style.right = ''; gui.style.bottom = '';
        gui.style.transform = '';

        switch (pos) {
            case 'top-left':
                gui.style.top = '12px';
                gui.style.left = '12px';
                gui.style.transform = '';
                break;
            case 'top-right':
                gui.style.top = '12px';
                gui.style.right = '12px';
                gui.style.transform = '';
                break;
            case 'bottom-left':
                gui.style.bottom = '12px';
                gui.style.left = '12px';
                gui.style.transform = '';
                break;
            case 'bottom-right':
                gui.style.bottom = '12px';
                gui.style.right = '12px';
                gui.style.transform = '';
                break;
            default: // center
                gui.style.top = '50%';
                gui.style.left = '50%';
                gui.style.transform = 'translate(-50%, -50%)';
                break;
        }
    }


    function hexToRgb(hex) {

        const h = hex.replace('#', '');
        if (h.length === 3) {
            const r = parseInt(h[0] + h[0], 16);
            const g = parseInt(h[1] + h[1], 16);
            const b = parseInt(h[2] + h[2], 16);
            return `${r}, ${g}, ${b}`;
        } else {
            const r = parseInt(h.substring(0,2), 16);
            const g = parseInt(h.substring(2,4), 16);
            const b = parseInt(h.substring(4,6), 16);
            return `${r}, ${g}, ${b}`;
        }
    }

    function deriveContrastColor(hex) {

        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0,2), 16);
        const g = parseInt(h.substring(2,4), 16);
        const b = parseInt(h.substring(4,6), 16);
        const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
        return luminance > 0.55 ? '#000000' : '#ffffff';
    }


    function populateControls() {
        document.getElementById('inputHeaderText').value = settings.headerText || DEFAULT_SETTINGS.headerText;
        document.getElementById('bgColor').value = settings.bgColor || DEFAULT_SETTINGS.bgColor;
        document.getElementById('bgAlpha').value = (settings.bgAlpha !== undefined) ? settings.bgAlpha : DEFAULT_SETTINGS.bgAlpha;
        document.getElementById('bgAlphaVal').textContent = (Math.round((settings.bgAlpha||0)*100)).toString() + '%';
        document.getElementById('textColor').value = settings.textColor || DEFAULT_SETTINGS.textColor;
        document.getElementById('borderColor').value = settings.borderColor || DEFAULT_SETTINGS.borderColor;
        document.getElementById('borderWidth').value = settings.borderWidth || DEFAULT_SETTINGS.borderWidth;
        document.getElementById('borderWidthVal').textContent = settings.borderWidth;
        document.getElementById('borderRadius').value = settings.borderRadius || DEFAULT_SETTINGS.borderRadius;
        document.getElementById('borderRadiusVal').textContent = settings.borderRadius;
        document.getElementById('padding').value = settings.padding || DEFAULT_SETTINGS.padding;
        document.getElementById('paddingVal').textContent = settings.padding;
        document.getElementById('minWidth').value = settings.minWidth || DEFAULT_SETTINGS.minWidth;
        document.getElementById('fontFamily').value = settings.fontFamily || DEFAULT_SETTINGS.fontFamily;
        document.getElementById('fontSize').value = settings.fontSize || DEFAULT_SETTINGS.fontSize;
        document.getElementById('buttonColor').value = settings.buttonColor || DEFAULT_SETTINGS.buttonColor;
        document.getElementById('buttonHoverColor').value = settings.buttonHoverColor || DEFAULT_SETTINGS.buttonHoverColor;
        document.getElementById('positionSelect').value = settings.position || DEFAULT_SETTINGS.position;
        document.getElementById('presetTheme').value = '';
        document.getElementById('currentTheme').value = settings.theme || DEFAULT_SETTINGS.theme;
    }


    function wireCustomize() {

        document.getElementById('toggleCustomize').addEventListener('click', () => {
            const panel = document.getElementById('customizePanel');
            const hidden = panel.style.display === 'none' || panel.style.display === '';
            panel.style.display = hidden ? 'block' : 'none';
        });


        document.getElementById('inputHeaderText').addEventListener('input', (e) => {
            settings.headerText = e.target.value;
            applySettings();
        });


        document.getElementById('applyPresetBtn').addEventListener('click', () => {
            const val = document.getElementById('presetTheme').value;
            if (val) {
                settings.theme = val;
                applyThemePreset(val);
                saveSettings(settings);
            }
        });


        document.getElementById('bgColor').addEventListener('input', (e) => {
            settings.bgColor = e.target.value;
            applySettings();
        });
        document.getElementById('bgAlpha').addEventListener('input', (e) => {
            settings.bgAlpha = parseFloat(e.target.value);
            document.getElementById('bgAlphaVal').textContent = Math.round(settings.bgAlpha * 100) + '%';
            applySettings();
        });
        document.getElementById('textColor').addEventListener('input', (e) => {
            settings.textColor = e.target.value;
            applySettings();
        });
        document.getElementById('borderColor').addEventListener('input', (e) => {
            settings.borderColor = e.target.value;
            applySettings();
        });
        document.getElementById('borderWidth').addEventListener('input', (e) => {
            settings.borderWidth = parseInt(e.target.value, 10);
            document.getElementById('borderWidthVal').textContent = settings.borderWidth;
            applySettings();
        });
        document.getElementById('borderRadius').addEventListener('input', (e) => {
            settings.borderRadius = parseInt(e.target.value, 10);
            document.getElementById('borderRadiusVal').textContent = settings.borderRadius;
            applySettings();
        });
        document.getElementById('padding').addEventListener('input', (e) => {
            settings.padding = parseInt(e.target.value, 10);
            document.getElementById('paddingVal').textContent = settings.padding;
            applySettings();
        });
        document.getElementById('minWidth').addEventListener('input', (e) => {
            const v = parseInt(e.target.value, 10);
            settings.minWidth = isNaN(v) ? DEFAULT_SETTINGS.minWidth : v;
            applySettings();
        });

        document.getElementById('fontFamily').addEventListener('change', (e) => {
            settings.fontFamily = e.target.value;
            applySettings();
        });
        document.getElementById('fontSize').addEventListener('change', (e) => {
            settings.fontSize = parseInt(e.target.value, 10);
            applySettings();
        });

        document.getElementById('buttonColor').addEventListener('input', (e) => {
            settings.buttonColor = e.target.value;
            applySettings();
        });
        document.getElementById('buttonHoverColor').addEventListener('input', (e) => {
            settings.buttonHoverColor = e.target.value;
            applySettings();
        });

        document.getElementById('positionSelect').addEventListener('change', (e) => {
            settings.position = e.target.value;
            applySettings();
        });

        document.getElementById('applyLive').addEventListener('click', () => {
            saveSettings(settings);
            showStatus('Live applied and saved', 1200);
        });
        document.getElementById('saveBtn').addEventListener('click', () => {
            saveSettings(settings);
            showStatus('Settings saved', 1200);
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            resetSettings();
        });

        document.getElementById('exportSettings').addEventListener('click', () => {
            const data = JSON.stringify(settings, null, 2);

            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sigma_gui_settings.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            showStatus('Exported settings JSON', 1600);
        });

        document.getElementById('importSettings').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.onchange = async (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    settings = Object.assign({}, DEFAULT_SETTINGS, parsed);
                    saveSettings(settings);
                    applySettings();
                    populateControls();
                    showStatus('Imported settings', 1400);
                } catch (err) {
                    showStatus('Import failed: invalid JSON', 1800);
                }
            };
            input.click();
        });
    }


    function makeDraggable() {
        const header = document.getElementById('sigmaHeader');
        let isDown = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', (e) => {

            isDown = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = gui.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            gui.style.transform = '';
            document.body.style.userSelect = 'none';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            gui.style.left = `${startLeft + dx}px`;
            gui.style.top = `${startTop + dy}px`;

            settings.position = 'custom';
            document.getElementById('positionSelect').value = 'center'; 
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                document.body.style.userSelect = '';

                try {
                    settings.customLeft = gui.style.left;
                    settings.customTop = gui.style.top;
                    saveSettings(settings);
                } catch(e) {}
            }
        });
    }


    function makeResizable() {
        const resizer = document.getElementById('sigmaResizer');
        let isResizing = false;
        let startW, startH, startX, startY;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startW = gui.offsetWidth;
            startH = gui.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault();
            document.body.style.userSelect = 'none';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newW = Math.max(200, startW + dx);
            const newH = Math.max(120, startH + dy);
            gui.style.width = `${newW}px`;
            gui.style.height = `${newH}px`;

            settings.minWidth = newW;
            document.getElementById('minWidth').value = settings.minWidth;
        });

        window.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
                saveSettings(settings);
            }
        });
    }


    function getVisiblePlayers() {

        return [
            { id: 1, x: 100, y: 200 },
            { id: 2, x: 300, y: 400 }
        ];
    }
    function getPlayerPosition(player) {
        return { x: player.x, y: player.y };
    }
    function getPlayerById(id) {
        return { id: id, x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };
    }
    function getPlayerGunPosition() {
        return {
            x: window.innerWidth / 2 - 15,
            y: window.innerHeight / 2 - 15
        };
    }

    document.getElementById('tracersButton').addEventListener('click', function() {
        tracersEnabled = !tracersEnabled;
        showStatus(`Tracers: ${tracersEnabled ? 'Enabled' : 'Disabled'}`);
        this.style.background = tracersEnabled ? settings.buttonHoverColor : settings.buttonColor;
        if (tracersEnabled) startTrackingPlayers();
        else removeTracers();
    });

    function startTrackingPlayers() {

        removeTracers();
        const visiblePlayers = getVisiblePlayers();
        visiblePlayers.forEach(player => {
            const tracerLine = document.createElement('div');
            tracerLine.className = 'tracer-line';
            tracerLine.style.backgroundColor = settings.buttonHoverColor || 'orange';
            tracerLine.style.position = 'absolute';
            tracerLine.style.height = '2px';
            tracerLine.style.transformOrigin = '0 0';
            document.body.appendChild(tracerLine);
            tracers.push({
                playerId: player.id,
                element: tracerLine,
                updatePosition: () => updateTracerPosition(player, tracerLine)
            });
        });
        requestAnimationFrame(updateTracers);
    }

    function removeTracers() {
        tracers.forEach(t => t.element.remove());
        tracers = [];
    }

    function updateTracers() {
        tracers.forEach(tracer => {
            const player = getPlayerById(tracer.playerId);
            if (player) tracer.updatePosition();
        });
        if (tracersEnabled) requestAnimationFrame(updateTracers);
    }

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


    document.getElementById('aimHelperButton').addEventListener('click', function() {
        aimHelperEnabled = !aimHelperEnabled;
        showStatus(`Aim Helper: ${aimHelperEnabled ? 'Enabled' : 'Disabled'}`);
        this.style.background = aimHelperEnabled ? settings.buttonHoverColor : settings.buttonColor;
        if (aimHelperEnabled) createAimHelperLine();
        else {
            if (aimHelperLine) aimHelperLine.style.display = 'none';
            if (gunElement) gunElement.style.display = 'none';
            document.removeEventListener('mousemove', updateAimHelperLine);
        }
    });

    function createAimHelperLine() {
        if (!aimHelperLine) {
            aimHelperLine = document.createElement('div');
            aimHelperLine.className = 'aim-helper-line';
            document.body.appendChild(aimHelperLine);
        }
        aimHelperLine.style.display = 'block';
        aimHelperLine.style.backgroundColor = settings.buttonHoverColor || 'orange';
        document.addEventListener('mousemove', updateAimHelperLine);
        updateAimHelperLine({ clientX: window.innerWidth, clientY: window.innerHeight });
    }

    function updateAimHelperLine(event) {
        if (aimHelperLine && gunElement) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const gunPosition = getPlayerGunPosition();

            if (gunElement) {
                gunElement.style.left = `${gunPosition.x}px`;
                gunElement.style.top = `${gunPosition.y}px`;
            }

            aimHelperLine.style.left = `${gunPosition.x + (gunElement ? gunElement.offsetWidth / 2 : 15)}px`;
            aimHelperLine.style.top = `${gunPosition.y + (gunElement ? gunElement.offsetHeight / 2 : 15)}px`;

            const deltaX = mouseX - gunPosition.x;
            const deltaY = mouseY - gunPosition.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            aimHelperLine.style.width = `${distance}px`;
            aimHelperLine.style.transform = `rotate(${angle}deg)`;
        }
    }


    document.getElementById('noDarkButton').addEventListener('click', function() {
        noDarkEnabled = !noDarkEnabled;
        showStatus(`NoDark: ${noDarkEnabled ? 'Enabled' : 'Disabled'}`);
        if (noDarkEnabled) {
            document.body.style.backgroundColor = "#fff";
            document.body.style.color = "#000";
        } else {
            document.body.style.backgroundColor = "";
            document.body.style.color = "";
        }
        this.style.background = noDarkEnabled ? settings.buttonHoverColor : settings.buttonColor;
    });

    document.getElementById('pingButton').addEventListener('click', function() {
        pingVisible = !pingVisible;
        showStatus(`Ping: ${pingVisible ? 'Visible' : 'Hidden'}`);
        pingDisplay.style.display = pingVisible ? 'block' : 'none';
        this.style.background = pingVisible ? settings.buttonHoverColor : settings.buttonColor;
        if (pingVisible) updatePing();
    });

    document.getElementById('fpsButton').addEventListener('click', function() {
        fpsVisible = !fpsVisible;
        showStatus(`FPS: ${fpsVisible ? 'Visible' : 'Hidden'}`);
        fpsDisplay.style.display = fpsVisible ? 'block' : 'none';
        this.style.background = fpsVisible ? settings.buttonHoverColor : settings.buttonColor;
        if (fpsVisible) updateFPS();
    });


    document.getElementById('transparencyButton').addEventListener('click', function() {
        settings.bgAlpha = (settings.bgAlpha === 0.8) ? 0.5 : 0.8;
        document.getElementById('bgAlpha').value = settings.bgAlpha;
        document.getElementById('bgAlphaVal').textContent = Math.round(settings.bgAlpha*100) + '%';
        applySettings();
        saveSettings(settings);
        showStatus(`Transparency: ${Math.round(settings.bgAlpha*100)}%`);
    });


    document.getElementById('playerCountsButton').addEventListener('click', function() {
        showStatus('Fetching Server Player Counts...');
        fetch('https://expandedwater.online:3000/api/messages/1117612925666996254')
            .then(response => response.json())
            .then(data => showStatus(`Server Player Counts: ${JSON.stringify(data)}`))
            .catch(error => showStatus(`Error fetching data: ${error}`));
    });

    document.getElementById('portalTimerButton').addEventListener('click', function() {
        showStatus('Fetching Abyss Server Portal Timer...');
        fetch('https://expandedwater.online:3000/api/messages/1187917859742027786')
            .then(response => response.json())
            .then(data => showStatus(`Abyss Server Portal Timer: ${JSON.stringify(data)}`))
            .catch(error => showStatus(`Error fetching data: ${error}`));
    });

    document.getElementById('rareShapesButton').addEventListener('click', function() {
        showStatus('Fetching Rare Shape Notifications...');
        fetch('https://expandedwater.online:3000/api/messages/1221635977987100874')
            .then(response => response.json())
            .then(data => showStatus(`Rare Shape Notifications: ${JSON.stringify(data)}`))
            .catch(error => showStatus(`Error fetching data: ${error}`));
    });


    gui.addEventListener('click', function(e) { e.stopPropagation(); });


    document.addEventListener('click', function(e) {
        if (gui.style.display === 'block' && !gui.contains(e.target)) {
            gui.style.display = 'none';
        }
    });


    function createGunElement() {
        if (!gunElement) {
            gunElement = document.createElement('div');
            gunElement.className = 'gun';
            gunElement.style.backgroundColor = 'red';
            gunElement.style.display = 'block';
            document.body.appendChild(gunElement);
        }
    }
    createGunElement();

    function updatePing() {
        if (pingVisible) {
            const ping = Math.floor(Math.random() * 100);
            pingDisplay.textContent = `Ping: ${ping}ms`;
            setTimeout(updatePing, 1000);
        }
    }
    function updateFPS() {
        if (fpsVisible) {
            const fps = Math.floor(Math.random() * 60) + 1;
            fpsDisplay.textContent = `FPS: ${fps}`;
            requestAnimationFrame(updateFPS);
        }
    }


    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'z') {
            gui.style.display = gui.style.display === 'block' ? 'none' : 'block';
        }
    });


    document.getElementById('sigmaClose').addEventListener('click', function() {
        gui.style.display = 'none';
    });

 
    populateControls();
    wireCustomize();
    makeDraggable();
    makeResizable();
    applySettings();


    if (settings.customLeft && settings.customTop) {
        gui.style.left = settings.customLeft;
        gui.style.top = settings.customTop;
        gui.style.transform = ''; 
    }


    gui.style.display = 'block';


    window.SigmaClient = window.SigmaClient || {};
    window.SigmaClient.openCustomize = function() {
        const panel = document.getElementById('customizePanel');
        panel.style.display = 'block';
        gui.style.display = 'block';
    };


    window.addEventListener('beforeunload', () => {
        saveSettings(settings);
    });

})();
