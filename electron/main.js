const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

const isDev = !app.isPackaged

const NEWS_FILE_PATH = path.join(__dirname, 'news.json')

function ensureNewsFileExists() {
  try {
    if (!fs.existsSync(NEWS_FILE_PATH)) {
      fs.writeFileSync(NEWS_FILE_PATH, '[]', 'utf-8')
    }
  } catch {
  }
}

function readNewsFromFile() {
  ensureNewsFileExists()
  try {
    const raw = fs.readFileSync(NEWS_FILE_PATH, 'utf-8')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeNewsToFile(items) {
  try {
    const serialized = JSON.stringify(items || [], null, 2)
    fs.writeFileSync(NEWS_FILE_PATH, serialized, 'utf-8')
  } catch {
  }
}

function registerNewsIpcHandlers() {
  ipcMain.handle('news:list', async () => {
    return readNewsFromFile()
  })

  ipcMain.handle('news:add', async (event, payload) => {
    const items = readNewsFromFile()
    const now = new Date().toISOString()

    const title = (payload && typeof payload.title === 'string' ? payload.title : '').trim()
    const content = (payload && typeof payload.content === 'string' ? payload.content : '').trim()
    const author = (payload && typeof payload.author === 'string' ? payload.author : '').trim()

    const id = `NEWS-${Date.now()}`

    const newItem = {
      id,
      title,
      content,
      author,
      date: now,
    }

    const updated = [...items, newItem]
    writeNewsToFile(updated)
    return newItem
  })

  ipcMain.handle('news:update', async (event, payload) => {
    const items = readNewsFromFile()
    const id = payload && payload.id != null ? String(payload.id) : null
    if (!id) return null

    const title = (payload && typeof payload.title === 'string' ? payload.title : '').trim()
    const content = (payload && typeof payload.content === 'string' ? payload.content : '').trim()
    const author = (payload && typeof payload.author === 'string' ? payload.author : '').trim()

    const updated = items.map((item) => {
      if (String(item.id) !== id) return item
      return {
        ...item,
        title,
        content,
        author,
      }
    })

    writeNewsToFile(updated)
    return updated.find((item) => String(item.id) === id) || null
  })

  ipcMain.handle('news:delete', async (event, id) => {
    const items = readNewsFromFile()
    const targetId = id != null ? String(id) : null
    if (!targetId) {
      return { success: false }
    }

    const filtered = items.filter((item) => String(item.id) !== targetId)
    writeNewsToFile(filtered)
    return { success: true }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 840,
    minWidth: 1200,
    minHeight: 720,
    backgroundColor: '#0f172a',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  ensureNewsFileExists()
  registerNewsIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
