'use strict';

import path from 'path';
import { app, Tray, Menu, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

// Declarations
let win, tray;
let firstLoad = true;

// Functions
function createTray() {
	try {
		// Initilization
		tray = new Tray(path.join(__static, 'favicon.png'));
		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Open',
				toolTip: 'Open Money Manager',
				click() {
					win.show();
					tray.destroy();
				},
			},
			{
				label: 'Exit',
				toolTip: 'Exit Money Manager',
				click() {
					app.exit();
				},
			},
		]);

		// Tray variables
		tray.setToolTip('Money Manager');
		tray.setContextMenu(contextMenu);

		// Tray actions
		tray.on('double-click', () => {
			win.show();
			tray.destroy();
		});

		if (firstLoad) tray.displayBalloon({ iconType: 'info', title: 'Money Manager', content: 'App minimized to tray' });
	} catch (error) {
		console.error(error);
	}
}

function minimizeToTray(e) {
	// Prevent default action
	e.preventDefault();

	// Create tray icon
	createTray();

	// Hide window
	win.hide();
}

async function createMainWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		backgroundColor: '#2e2c29',
		show: false,

		title: 'Money Manager',
		minWidth: 1080,
		minHeight: 720,
		icon: path.join(__static, 'favicon.png'),

		webPreferences: {
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
		},
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		win.loadURL('app://./index.html');
	}

	// Window actions
	win.maximize();
	win.on('close', minimizeToTray);
	if (!isDevelopment) Menu.setApplicationMenu(null);

	// Show window when content is loaded
	win.webContents.on('did-stop-loading', () => win.show());
	firstLoad = false;
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	// Create window
	createMainWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit') {
				app.quit();
			}
		});
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		});
	}
}
