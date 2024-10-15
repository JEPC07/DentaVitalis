const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendToMain: (channel, data) => {
        const validChannels = ['check-password']; // Canales permitidos
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    
    receiveFromMain: (channel, func) => {
        const validChannels = ['password-result']; // Canales permitidos
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
