const electron = require('electron')
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron

// SET ENV
process.env.NODE_ENV = 'production'

let mainWindow
let addWindow

// Listen for app to be ready
app.on('ready', () => {
  mainWindow = new BrowserWindow()
  // Load main html
  // passes file://dirname/index.html to loadURL
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Quit app when closed
  mainWindow.on('closed', () => {
    app.quit()
  })

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  // insert menu
  Menu.setApplicationMenu(mainMenu)
})

// Handle createAddWindow
function createAddWindow () {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  })
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }))
  // Garbage collection handle
  addWindow.on('close', () => {
    addWindow = null
  })
}

// Catch item:add
ipcMain.on('item:add', (e, item) => {
  // Send to main window
  mainWindow.webContents.send('item:add', item)
  addWindow.close()
})

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        accelerator: 'CmdOrCtrl+P',
        click () {
          createAddWindow()
        }
      },
      {
        label: 'Clear Items',
        accelerator: 'CmdOrCtrl+L',
        click () {
          mainWindow.webContents.send('item:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click () {
          app.quit()
        }
      }
    ]
  }
]

// If mac, add empty object to menu
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({})
}

// Add dev tools item if NOT in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click (item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
