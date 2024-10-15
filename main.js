const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Desactiva Node.js en el contexto de la página
            contextIsolation: true,  // Aísla el contexto para mayor seguridad
            enableRemoteModule: false // Desactiva el módulo remoto por seguridad
        }
    });

    mainWindow.loadFile('index.html');

    // Abre las herramientas de desarrollo si lo deseas
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Manejo de eventos IPC para la autenticación
ipcMain.on('check-password', (event, password) => {
    const correctPassword = 'vitalis1'; // Cambia esto según tu lógica
    const isValid = (password === correctPassword);
    event.sender.send('password-result', isValid);
});