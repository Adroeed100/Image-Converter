const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const sharp = require('sharp');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'renderer', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const supportedFormats = ['jpeg', 'png', 'webp', 'tiff', 'avif', 'heif'];

ipcMain.handle('select-image', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'avif', 'heif'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }

    return null;
});

ipcMain.handle('convert-image', async (event, { filePath, format }) => {
    if (!supportedFormats.includes(format)) {
        return { success: false, error: 'Unsupported image format selected.' };
    }

    const { canceled, filePath: savePath } = await dialog.showSaveDialog({
        defaultPath: `converted-image.${format}`,
        filters: [{ name: `${format.toUpperCase()} Image`, extensions: [format] }]
    });

    if (canceled || !savePath) {
        return { success: false, error: 'Save cancelled.' };
    }

    try {
        await sharp(filePath)
            .toFormat(format)
            .toFile(savePath);
        return { success: true, path: savePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});
