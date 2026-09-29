const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    createProforma: (proformaData) => ipcRenderer.invoke('create-proforma', proformaData),
    getAllProformas: () => ipcRenderer.invoke('get-proformas'),
    getProformaById: (id) => ipcRenderer.invoke('get-proforma-by-id', id),
    updateProforma: (id, proformaData) => ipcRenderer.invoke('update-proforma', id, proformaData),
    deleteProforma: (id) => ipcRenderer.invoke('delete-proforma', id),
    signup: (userData) => ipcRenderer.invoke('signup', userData),
    login: (userData) => ipcRenderer.invoke('login', userData),
    getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
  clearAuthToken: () => ipcRenderer.invoke('clear-auth-token'),
  generateProformaNumber: () => ipcRenderer.invoke("generate-proforma-number"),
});