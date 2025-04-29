const os = require('os');
const path = require('path');
const { contextBridge, ipcRenderer, dialog } = require('electron');

//we expose information that we named "ipcRenderer", then we define that "send" is related to the command as following (ipcRenderer.send).
//I could have writen as the following and it would work exactly the same way but now on the renderer we need to type "domingaoDo.faustao" to execute ipcRenderer.send
// contextBridge.exposeInMainWorld('domingaoDo', {
//     faustao: (channel, data) => ipcRenderer.send(channel, data),
// });

//exposes the information that we named "ipcRenderer", then we define that "send" is related to the command as following (ipcRenderer.send).
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});