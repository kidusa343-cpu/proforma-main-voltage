const { app, BrowserWindow, ipcMain , session } = require('electron');
const path = require('path');
const http = require('http');
const next = require('next');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();
// const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = 'your-secret-key-12345';
const { createProforma, getAllProformas } = require(path.join(__dirname, './backend/controllers/proformaController'));
const { createUser, findUser } = require(path.join(__dirname, './backend/models/userModel'));
const { startBackupScheduler } = require(path.join(__dirname, './backup'));
require(path.join(__dirname, './backend/models/proformaModel'));
require(path.join(__dirname, './backend/models/itemModel'));
require(path.join(__dirname, './backend/models/userModel'));
const db = require(path.join(__dirname, './config/db'));
let mainWindow;
// Adjust module resolution to prioritize frontend/node_modules
console.log('Setting up Module._resolveFilename override...');
const Module = require('module');
const originalResolve = Module._resolveFilename;
const appRoot = __dirname.replace(/[\\/]resources[\\/]app$/, ''); // Strip /resources/app to get the app root (dist\win-unpacked)
Module._resolveFilename = function (request, parent, isMain) {
  console.log(`Module._resolveFilename called for request: ${request}, parent: ${parent?.filename}`);
  if (request === 'react' || request === 'react-dom') {
    // Hardcoded absolute path to dist\temp\frontend\node_modules for testing
    const tempFrontendNodeModules = 'D:\\prf1\\Proforma-main\\desktop\\dist\\temp\\frontend\\node_modules\\' + request;
    const packagedFrontendNodeModules = path.join(__dirname, 'frontend', 'node_modules', request); // resources\app\frontend\node_modules
    const rootFrontendNodeModules = path.join(appRoot, 'frontend', 'node_modules', request); // frontend\node_modules (packaged app root)
    const rootNodeModules = path.join(__dirname, 'node_modules', request); // Fallback

    console.log(`Attempting to resolve ${request} from temp frontend: ${tempFrontendNodeModules}`);
    try {
      const resolvedPath = require.resolve(tempFrontendNodeModules);
      console.log(`Resolved ${request} to temp frontend: ${resolvedPath}`);
      return resolvedPath;
    } catch (e) {
      console.log(`Temp frontend resolution failed, trying packaged frontend: ${packagedFrontendNodeModules}`);
      try {
        const resolvedPath = require.resolve(packagedFrontendNodeModules, { paths: [path.join(__dirname, 'frontend')] });
        console.log(`Resolved ${request} to packaged frontend: ${resolvedPath}`);
        return resolvedPath;
      } catch (e2) {
        console.log(`Packaged frontend resolution failed, trying root frontend: ${rootFrontendNodeModules}`);
        try {
          const resolvedPath = require.resolve(rootFrontendNodeModules, { paths: [appRoot] });
          console.log(`Resolved ${request} to root frontend: ${resolvedPath}`);
          return resolvedPath;
        } catch (e3) {
          console.log(`Root frontend resolution failed, trying root: ${rootNodeModules}`);
          try {
            const resolvedPath = require.resolve(rootNodeModules);
            console.log(`Resolved ${request} to root: ${resolvedPath}`);
            return resolvedPath;
          } catch (e4) {
            console.error(`Failed to resolve ${request} in temp frontend, packaged frontend, root frontend, and root: ${e4.message}`);
            throw e4;
          }
        }
      }
    }
  }
  return originalResolve(request, parent, isMain);
};
console.log('Module._resolveFilename override set up successfully');

// Set working directory after override
console.log('Setting working directory to frontend...');
process.chdir(path.join(__dirname, 'frontend'));

// Determine environment
const production = process.env.PRODUCTION === 'true' || process.env.PRODUCTION === undefined; // Fallback to true if undefined for testing
console.log('PRODUCTION:', process.env.PRODUCTION);
console.log('production:', production);
const dev = !production;
const nextApp = next({ dev, dir: path.join(__dirname, 'frontend') });
const handle = nextApp.getRequestHandler();

async function startNextServer() {
  try {
    await nextApp.prepare();
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    const port = 3000;
    server.listen(port, (err) => {
      if (err) {
        console.error('Failed to start Next.js server:', err);
        throw err;
      }
      console.log(`Next.js server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error in startNextServer:', error);
    throw error; // Rethrow to catch in app.whenReady
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1100,
    minHeight: 800,
    title: 'VOLTAGE',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets', 'icons', 'win' , 'icon.ico'),
  });
  mainWindow.maximize();
  mainWindow.setMenu(null);
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000').catch((err) => {
      console.error('Failed to load Next.js app:', err);
    });
  }, 2000);


  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Listing database tables...');
    db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
      if (err) {
        console.error('Error listing tables:', err);
        reject(err);
        return;
      }
      console.log('Tables in database:', tables.map(t => t.name));
      // Verify proformas table exists
      if (!tables.some(table => table.name === 'proformas')) {
        reject(new Error('proformas table does not exist'));
        return;
      }
      resolve();
    });
  });
}
app.whenReady().then(async () => {
  try {
    console.log('Starting Next.js server...');
    await startNextServer();
    console.log('Creating window...');
    createWindow();

    // Debug: Confirm environment variable state
    console.log('PRODUCTION (inside app.whenReady):', process.env.PRODUCTION);

    // Initialize database and start backup scheduler
    await initializeDatabase();
    console.log('Database initialized, starting backup scheduler');
    startBackupScheduler();
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  });

async function generateReferenceNumber() {
  const prefix = "ref-";
  const query = `
    SELECT referenceNumber
    FROM proformas
    WHERE referenceNumber LIKE 'ref-%';
  `;

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error querying reference numbers:", err);
        reject(err);
      } else {
        // Extract and sort the numeric parts of the reference numbers
        const sequenceNumbers = rows.map(row => {
          const sequencePart = row.referenceNumber.split("-").pop(); // Get the part after the last hyphen
          return parseInt(sequencePart, 10); // Parse as base-10 integer
        }).filter(num => !isNaN(num)); // Filter out invalid numbers

        // Find the largest sequence number
        const lastSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : 0;

        // Increment the sequence
        const nextSequence = lastSequence + 1;
        const referenceNumber = `${prefix}${nextSequence}`; // No padding
        console.log(`Generated reference number: ${referenceNumber}`);
        resolve(referenceNumber);
      }
    });
  });
}

// IPC handler to generate reference number
ipcMain.handle("generate-reference-number", async () => {
  return await generateReferenceNumber();
});

  async function generateProformaNumber() {
    const prefix = "PRF-";
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits
    const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
    const datePart = `${year}/${month}/${day}`;
  
    const query = `
      SELECT proformaNumber
      FROM proformas
      WHERE proformaNumber LIKE ?;
    `;
    const params = [`${prefix}${datePart}-%`];
  
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.error("Error querying proforma numbers:", err);
          reject(err);
        } else {
          // Extract and sort the numeric parts of the proforma numbers
          const sequenceNumbers = rows.map(row => {
            const sequencePart = row.proformaNumber.split("-").pop(); // Get the part after the last hyphen
            return parseInt(sequencePart, 10); // Parse as base-10 integer
          }).filter(num => !isNaN(num)); // Filter out invalid numbers
  
          // Find the largest sequence number
          const lastSequence = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : 0;
  
          // Increment the sequence
          const nextSequence = lastSequence + 1;
          const proformaNumber = `${prefix}${datePart}-${nextSequence}`; // Format: PRF-YYYY/MM/DD-N
          console.log(`Generated proforma number: ${proformaNumber}`);
          resolve(proformaNumber);
        }
      });
    });
  }

  ipcMain.handle("generate-proforma-number", async () => {
    return await  generateProformaNumber();
  });

  ipcMain.handle('create-proforma', async (event, proformaData) => {
    try {
      // Check for authentication token
      const cookies = await session.defaultSession.cookies.get({ name: 'authToken' });
      if (cookies.length === 0) {
        throw new Error('Authentication token is required');
      }
      const token = cookies[0].value;
  
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('main.js: Decoded token:', decoded);
  
      // Find the user
      const user = await findUser(decoded.usernameOrEmail);
      if (!user) {
        throw new Error('User not found');
      }
  
      // Generate proforma number if not provided
      if (!proformaData.proformaNumber) {
        proformaData.proformaNumber = await generateProformaNumber();
      }
  
      // Generate reference number if not provided
      if (!proformaData.referenceNumber) {
        proformaData.referenceNumber = await generateReferenceNumber();
      }
  
      // Add dateCreated if not provided
      if (!proformaData.dateCreated) {
        proformaData.dateCreated = new Date().toISOString();
      }
  
      // Create the proforma
      const newProforma = await createProforma(proformaData, user.id);
      return newProforma;
    } catch (error) {
      console.error('Error creating proforma:', error);
      throw error;
    }
  });

  ipcMain.handle('get-proformas', async (event) => {
    try {
      const cookies = await session.defaultSession.cookies.get({ name: 'authToken' });
      if (cookies.length === 0) {
        throw new Error('Authentication token is required');
      }
      const token = cookies[0].value;
  
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('main.js: Decoded token:', decoded);
  
      const user = await findUser(decoded.usernameOrEmail);
      if (!user) {
        throw new Error('User not found');
      }
  
      const proformas = await getAllProformas(user.id);
      return proformas;
    } catch (error) {
      console.error('Error getting proformas:', error);
      throw error;
    }
  });
   
    ipcMain.handle('get-proforma-by-id', async (event, id) => {
        try {
            const proforma = await getProformaById(id);
            return proforma;
        } catch (error) {
            console.error('Error getting proforma by ID:', error);
            throw error;
        }
    });

    ipcMain.handle('update-proforma', async (event, id, proformaData) => {
        try {
            const updatedProforma = await updateProforma(id, proformaData);
            return updatedProforma;
        } catch (error) {
            console.error('Error updating proforma:', error);
            throw error;
        }
    });

    ipcMain.handle('delete-proforma', async (event, id) => {
        try {
            const result = await deleteProforma(id);
            return result;
        } catch (error) {
            console.error('Error deleting proforma:', error);
            throw error;
        }
    });

    ipcMain.handle('signup', async (event, userData) => {
      try {
        const { usernameOrEmail, password } = userData;
        if (!usernameOrEmail || !password) {
          throw new Error('signup: usernameOrEmail and password are required');
        }
        const newUser = await createUser(usernameOrEmail, password);
        return { success: true, user: newUser };
      } catch (error) {
        console.error('Error signing up:', error);
        return { success: false, message: error.message };
      }
    });

    ipcMain.handle('login', async (event, userData) => {
        try {
          const { usernameOrEmail, password } = userData;
          if (!usernameOrEmail || !password) {
            throw new Error('login: usernameOrEmail and password are required');
          }
          console.log('main.js: IPC login called with:', userData);
          const user = await findUser(usernameOrEmail);
          console.log('main.js: Found user:', user);
      
          if (!user) {
            return { success: false, message: 'Invalid credentials' };
          }
      
          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log('main.js: Password match:', passwordMatch);
      
          if (!passwordMatch) {
            return { success: false, message: 'Invalid credentials' };
          }
      
          const token = jwt.sign(
            { id: user.id, usernameOrEmail: user.usernameOrEmail },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
          );
          console.log('main.js: Generated token:', token);

          await session.defaultSession.cookies.set({
            url: 'http://localhost:3000',
            name: 'authToken',
            value: token,
            httpOnly: true, // Prevents JavaScript access
            secure: dev ? false : true, // Use secure cookies in production
            path: '/',
            expirationDate: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
          });
          console.log('main.js: Set HTTP-only cookie: authToken')
          return {
            success: true,
            user: { id: user.id, usernameOrEmail: user.usernameOrEmail },
            token, // Include the token in the response
          };
          
        } catch (error) {
          console.error('main.js: Error logging in:', error);
          return { success: false, message: error.message };
        }
      });



      ipcMain.handle('get-auth-token', async (event) => {
        try {
          const cookies = await session.defaultSession.cookies.get({ name: 'authToken' });
          if (cookies.length > 0) {
            return cookies[0].value;
          }
          console.log("LOG IN");
        } catch (error) {
          console.error('main.js: Error getting auth token:', error);
          throw error;
        }
      });
      
      ipcMain.handle('clear-auth-token', async (event) => {
        try {
          await session.defaultSession.cookies.remove('http://localhost:3000', 'authToken');
          console.log('main.js: Cleared authToken cookie');
          return { success: true };
        } catch (error) {
          console.error('main.js: Error clearing auth token:', error);
          throw error;
        }
      });
    

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('will-quit', async (event) => {
  try {
    // Prevent quitting until cookies are cleared
    event.preventDefault();
    await session.defaultSession.clearStorageData();
    console.log('main.js: Cleared all session data on app quit');
    app.exit(); // Proceed with quitting
  } catch (error) {
    console.error('main.js: Error clearing session data on quit:', error);
    app.exit(); // Quit even if there's an error
  }
});
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
