const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('newsAPI', {
  getAll: () => ipcRenderer.invoke('news:list'),
  add: (payload) => ipcRenderer.invoke('news:add', payload),
  update: (payload) => ipcRenderer.invoke('news:update', payload),
  remove: (id) => ipcRenderer.invoke('news:delete', id),
})
