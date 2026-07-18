import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getDb, getUsersCollection, getAppointmentsCollection } from './server/mongodb.js';

// Global Console Interceptor for Vercel Log Visibility
const logsBuffer: string[] = [];
const maxLogs = 1000;

function addLog(type: 'INFO' | 'WARN' | 'ERROR', ...args: any[]) {
  const timestamp = new Date().toISOString();
  const msg = args.map(arg => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  const line = `[${timestamp}] [${type}] ${msg}`;
  logsBuffer.push(line);
  if (logsBuffer.length > maxLogs) {
    logsBuffer.shift();
  }
}

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args: any[]) => {
  addLog('INFO', ...args);
  originalLog(...args);
};

console.warn = (...args: any[]) => {
  addLog('WARN', ...args);
  originalWarn(...args);
};

console.error = (...args: any[]) => {
  addLog('ERROR', ...args);
  originalError(...args);
};

console.log('🚀 Real-Time Console Interceptor activated in CareBridge backend!');

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to determine accurate application base URL
function getAppUrl(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
}

// Helper to seed default users and purge legacy mock staff
async function seedDefaultUsers() {
  try {
    const usersColl = await getUsersCollection();

    // Actively delete legacy mock staff/patient accounts from the database to avoid ID collision
    const mockIds = ['usr-doctor', 'usr-nurse', 'usr-pharmacist', 'usr-lab', 'usr-receptionist', 'usr-patient', 'usr-admin', 'usr-doctor-chinedu', 'usr-doctor-elena', 'usr-doctor-marcus', 'usr-doctor-sarah', 'usr-doctor-emade'];
    console.log('🧹 Purging legacy mock ids to prepare modern database schemas...');
    for (const mockId of mockIds) {
      await usersColl.deleteMany({ 'user.id': mockId });
    }

    // Actively remove non-Nigerian doctors to re-seed them as Black Nigerians
    console.log('🧹 Purging old non-Nigerian doctor profiles to respect user request...');
    await usersColl.deleteMany({ 'user.email': 'doctor.elena@carebridge.com' });
    await usersColl.deleteMany({ 'user.email': 'doctor.marcus@carebridge.com' });
    await usersColl.deleteMany({ 'user.email': 'doctor.sarah@carebridge.com' });

    const existing = await usersColl.find();
    const existingEmails = new Set(existing.map((u: any) => u.user.email?.toLowerCase().trim()));

    const defaultUsers = [
      // 1. Admin
      {
        user: {
          id: 'usr-admin-james',
          name: 'James Anini',
          email: 'admin@carebridge.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      // 2. Doctors (All Black Nigerians as requested, including Dr. Emade Sunday)
      {
        user: {
          id: 'usr-doctor-chinedu',
          name: 'Dr. Chinedu Okafor',
          email: 'doctor.chinedu@carebridge.com',
          role: 'doctor',
          department: 'Cardiology',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      {
        user: {
          id: 'usr-doctor-emade',
          name: 'Dr. Emade Sunday',
          email: 'doctor.emade@carebridge.com',
          role: 'doctor',
          department: 'Pediatrics',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      {
        user: {
          id: 'usr-doctor-marcus',
          name: 'Dr. Babatunde Balogun',
          email: 'doctor.marcus@carebridge.com',
          role: 'doctor',
          department: 'Neurology',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      {
        user: {
          id: 'usr-doctor-sarah',
          name: 'Dr. Funmilayo Adebayo',
          email: 'doctor.sarah@carebridge.com',
          role: 'doctor',
          department: 'Obstetrics & Gynecology',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      // 3. Nurses
      {
        user: {
          id: 'usr-nurse-clara',
          name: 'Nurse Clara Barton',
          email: 'nurse.clara@carebridge.com',
          role: 'nurse',
          department: 'Primary Care',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      {
        user: {
          id: 'usr-nurse-jane',
          name: 'Nurse Jane Doe',
          email: 'nurse.jane@carebridge.com',
          role: 'nurse',
          department: 'Emergency Care',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      // 4. Pharmacists
      {
        user: {
          id: 'usr-pharmacist-george',
          name: 'Pharmacist George',
          email: 'pharmacist@carebridge.com',
          role: 'pharmacist',
          department: 'Clinical Pharmacy',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      // 5. Lab Technicians
      {
        user: {
          id: 'usr-lab-sarah',
          name: 'Lab Tech Sarah',
          email: 'lab@carebridge.com',
          role: 'lab',
          department: 'Pathology & Labs',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      // 6. Receptionists
      {
        user: {
          id: 'usr-receptionist-blessing',
          name: 'Receptionist Blessing',
          email: 'receptionist@carebridge.com',
          role: 'receptionist',
          department: 'Front Desk & Triage',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      // 7. Patients
      {
        user: {
          id: 'usr-patient-john',
          name: 'John Doe',
          email: 'patient@carebridge.com',
          role: 'patient',
          phone: '+234 801 234 5678',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      },
      {
        user: {
          id: 'usr-patient-jane',
          name: 'Jane Smith',
          email: 'patient.jane@carebridge.com',
          role: 'patient',
          phone: '+234 802 345 6789',
          createdAt: new Date().toISOString()
        },
        password: 'password123'
      }
    ];

    console.log('🌱 Checking database to seed missing standard clinical accounts...');
    let seededCount = 0;
    for (const item of defaultUsers) {
      const emailNorm = item.user.email.toLowerCase().trim();
      if (!existingEmails.has(emailNorm)) {
        await usersColl.insertOne(item);
        seededCount++;
      }
    }
    
    if (seededCount > 0) {
      console.log(`✅ Seeding complete. Successfully registered ${seededCount} clinical accounts to database.`);
    } else {
      console.log('👍 All default clinical accounts already exist in the database.');
    }
  } catch (error) {
    console.error('Error seeding default users:', error);
  }
}

// 🔌 API Endpoint: DB Status Check
app.get('/api/db-status', async (req, res) => {
  const { isMock } = await getDb();
  res.json({
    status: 'connected',
    provider: isMock ? 'Local JSON DB File' : 'MongoDB Atlas Cloud',
    mongodbUriConfigured: !!process.env.MONGODB_URI,
    googleClientConfigured: !!process.env.GOOGLE_CLIENT_ID
  });
});

// 📊 API Endpoints: Developer Logs Monitor for Vercel
app.get('/api/logs', (req, res) => {
  res.json({ logs: logsBuffer });
});

app.post('/api/logs/test', (req, res) => {
  console.log('🧪 Diagnostic Ping: Backend server is active on Vercel Node.js runtime.');
  res.json({ success: true, message: 'Diagnostic log inserted.' });
});

app.post('/api/logs/clear', (req, res) => {
  logsBuffer.length = 0;
  console.log('🧹 Vercel logs buffer cleared by executive system administrator.');
  res.json({ success: true, message: 'Logs buffer cleared.' });
});

// 🔑 API Endpoints: AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const usersColl = await getUsersCollection();
    const found = await usersColl.findOne({ 'user.email': email.toLowerCase().trim() });

    if (!found) {
      return res.status(404).json({ error: 'Account does not exist. Please double-check your credentials.' });
    }

    if (found.isGoogleUser) {
      return res.status(400).json({ error: 'This account was registered using Google. Please log in using Google instead.' });
    }

    if (found.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    res.json({ user: found.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Authentication failed.' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Please provide all registration details.' });
    }

    const usersColl = await getUsersCollection();
    const existing = await usersColl.findOne({ 'user.email': email.toLowerCase().trim() });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = {
      id: `usr-pat-${Math.floor(100000 + Math.random() * 900000)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'patient',
      phone: phone.trim(),
      createdAt: new Date().toISOString()
    };

    await usersColl.insertOne({
      user: newUser,
      password
    });

    res.status(201).json({ user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// 🌐 GOOGLE SIGN-IN OAUTH LOGIC
app.get('/api/auth/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${getAppUrl(req)}/auth/callback`;

  if (!clientId) {
    // If not configured, we redirect to a beautiful interactive mock auth prompt on our server!
    console.log('Google Sign-In is not configured. Directing to simulated setup login flow.');
    return res.json({
      url: `/api/auth/google/mock-prompt`,
      isMock: true
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'consent',
    access_type: 'offline'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, isMock: false });
});

// Mock interactive prompt for when Google Credentials are NOT set up yet
app.get('/api/auth/google/mock-prompt', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Google Sign-In Simulator (CareBridge)</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background-color: #F8FBFC; }
      </style>
    </head>
    <body class="flex items-center justify-center min-h-screen p-6">
      <div class="bg-white rounded-3xl shadow-2xl border border-gray-150 p-8 max-w-md w-full space-y-6">
        <div class="text-center space-y-2">
          <div class="mx-auto h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <svg class="h-6 w-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.8 0-7-2.6-8.2-6.2l-3.9 3C3.5 21.3 7.4 24 12 24z" />
              <path fill="#FBBC05" d="M5.6 14.4c-.2-.6-.4-1.3-.4-2.4s.2-1.8.4-2.4l-3.9-3C.6 8.5 0 10.2 0 12s.6 3.5 1.7 5.4l3.9-3z" />
              <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.4 15 0 12 0 7.4 0 3.5 2.7 1.7 6.6l3.9 3c1-3 3.8-4.6 6.4-4.6z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800">Google Sign-In (Simulation Mode)</h2>
          <p class="text-xs text-gray-500">Google OAuth is currently in <b>Sandbox Simulation Mode</b> because client environment credentials are not declared in AI Studio secrets yet.</p>
        </div>

        <div class="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-xs text-blue-800 space-y-1">
          <p class="font-bold">💡 How to configure real Google Sign-In:</p>
          <p>Add these environment variables via the Settings panel:</p>
          <ul class="list-disc list-inside space-y-0.5 pl-1 font-mono text-[10px]">
            <li>GOOGLE_CLIENT_ID</li>
            <li>GOOGLE_CLIENT_SECRET</li>
          </ul>
        </div>

        <form action="/api/auth/google/mock-login" method="POST" class="space-y-4">
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-500 uppercase block">Full Name</label>
            <input type="text" name="name" required value="James Anini" class="w-full text-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-bold text-gray-500 uppercase block">Google Email Address</label>
            <input type="email" name="email" required value="james.anini@gmail.com" class="w-full text-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md">
            Simulate Google OAuth Authorization
          </button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Process simulated Google Login
app.post('/api/auth/google/mock-login', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).send('Required profile fields missing.');
    }

    const usersColl = await getUsersCollection();
    const trimmedEmail = (email as string).toLowerCase().trim();
    let found = await usersColl.findOne({ 'user.email': trimmedEmail });

    let user;
    if (!found) {
      user = {
        id: `usr-gpat-${Math.floor(100000 + Math.random() * 900000)}`,
        name: (name as string).trim(),
        email: trimmedEmail,
        role: 'patient',
        createdAt: new Date().toISOString()
      };
      await usersColl.insertOne({
        user,
        isGoogleUser: true
      });
    } else {
      user = found.user;
    }

    res.send(`
      <html>
        <body>
          <script>
            try {
              localStorage.setItem('carebridge_google_login_success', JSON.stringify(${JSON.stringify(user)}));
            } catch (e) {
              console.error('Failed to write to localStorage:', e);
            }

            if (window.opener) {
              try {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
              } catch (e) {
                console.error('Failed to postMessage:', e);
              }
              window.close();
            } else {
              setTimeout(() => {
                window.close();
              }, 1200);
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`Simulation callback error: ${err.message}`);
  }
});

// Real callback endpoint
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('OAuth callback error: Missing authorization code.');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${getAppUrl(req)}/auth/callback`;

    // 1. Exchange OAuth code for Google Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('❌ Google Token Exchange failed:', errText);
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Google Sign-In Issue - CareBridge</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background-color: #F8FBFC; }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen p-6">
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-150 p-8 max-w-lg w-full space-y-6">
            <div class="text-center space-y-2">
              <div class="mx-auto h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-2">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-800">Google Sign-In Setup Issue</h2>
              <p class="text-xs text-gray-500">Your application successfully reached Google, but Google rejected the credentials because of an invalid/expired client secret.</p>
            </div>

            <div class="bg-red-50 border border-red-100 p-4 rounded-2xl text-xs text-red-800 space-y-2">
              <p class="font-bold">❌ Error Returned by Google Token Server:</p>
              <pre class="bg-red-100/50 p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">${errText}</pre>
            </div>

            <div class="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs text-gray-600 space-y-2">
              <p class="font-bold text-gray-800">💡 How to correct this:</p>
              <p>Go to your AI Studio settings (or .env file) and verify that <code>GOOGLE_CLIENT_SECRET</code> and <code>GOOGLE_CLIENT_ID</code> match your credentials in the Google Cloud Console exactly.</p>
            </div>

            <div class="border-t border-gray-100 pt-5 space-y-4">
              <div class="text-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instant Testing Bypass</span>
                <p class="text-[11px] text-gray-400 mt-1">Avoid credential setup and sign in immediately with our pre-configured simulator as <strong>James Anini</strong>.</p>
              </div>

              <form action="/api/auth/google/mock-login" method="POST" class="space-y-3">
                <input type="hidden" name="name" value="James Anini" />
                <input type="hidden" name="email" value="james.anini@gmail.com" />
                <button type="submit" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  <svg class="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
                    <path fill="currentColor" d="M12 24c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.8 0-7-2.6-8.2-6.2l-3.9 3C3.5 21.3 7.4 24 12 24z" />
                    <path fill="currentColor" d="M5.6 14.4c-.2-.6-.4-1.3-.4-2.4s.2-1.8.4-2.4l-3.9-3C.6 8.5 0 10.2 0 12s.6 3.5 1.7 5.4l3.9-3z" />
                    <path fill="currentColor" d="M12 5.04c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.4 15 0 12 0 7.4 0 3.5 2.7 1.7 6.6l3.9 3c1-3 3.8-4.6 6.4-4.6z" />
                  </svg>
                  Bypass with Simulator & Sign In
                </button>
              </form>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    const { access_token } = await tokenResponse.json();

    // 2. Fetch Google User Profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) {
      return res.status(400).send('Failed to fetch user profile info from Google.');
    }

    const profile = await profileResponse.json();
    const { name, email } = profile;

    if (!email) {
      return res.status(400).send('Google Profile did not contain a valid email address.');
    }

    // 3. Upsert user in database
    const usersColl = await getUsersCollection();
    const trimmedEmail = email.toLowerCase().trim();
    let found = await usersColl.findOne({ 'user.email': trimmedEmail });

    let user;
    if (!found) {
      user = {
        id: `usr-gpat-${Math.floor(100000 + Math.random() * 900000)}`,
        name: name || 'Google User',
        email: trimmedEmail,
        role: 'patient',
        createdAt: new Date().toISOString()
      };
      await usersColl.insertOne({
        user,
        isGoogleUser: true
      });
    } else {
      user = found.user;
    }

    // 4. Send success message to window opener and close callback popup
    res.send(`
      <html>
        <body>
          <script>
            try {
              localStorage.setItem('carebridge_google_login_success', JSON.stringify(${JSON.stringify(user)}));
            } catch (e) {
              console.error('Failed to write to localStorage:', e);
            }

            if (window.opener) {
              try {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
              } catch (e) {
                console.error('Failed to postMessage:', e);
              }
              window.close();
            } else {
              setTimeout(() => {
                window.close();
              }, 1200);
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);

  } catch (error: any) {
    res.status(500).send(`OAuth callback processing crashed: ${error.message}`);
  }
});

// 📅 API Endpoints: APPOINTMENTS
app.get('/api/appointments', async (req, res) => {
  try {
    const { email, role } = req.query;
    const apptsColl = await getAppointmentsCollection();

    let query: any = {};
    if (email) {
      const emailStr = (email as string).toLowerCase().trim();
      // If it is a patient, filter only their own appointments
      if (role === 'patient') {
        query.email = emailStr;
      } else if (role === 'doctor') {
        // Find appointments for this specific doctor.
        // Let's decode doctor name in UI or match doctor name.
        // For doctors, we'll let the frontend filter or we match the doctor name if supplied, or return all for simpler dashboard filtering.
      }
    }

    const appointments = await apptsColl.find(query);
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch appointments.' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = req.body;
    if (!appointment.fullName || !appointment.email || !appointment.phone || !appointment.department || !appointment.doctor || !appointment.date) {
      return res.status(400).json({ error: 'Missing required appointment fields.' });
    }

    const newAppt = {
      id: appointment.id || `CB-${Math.floor(10000 + Math.random() * 90000)}`,
      fullName: appointment.fullName.trim(),
      email: appointment.email.toLowerCase().trim(),
      phone: appointment.phone.trim(),
      department: appointment.department,
      doctor: appointment.doctor,
      date: appointment.date,
      message: appointment.message ? appointment.message.trim() : '',
      status: appointment.status || 'pending',
      createdAt: appointment.createdAt || new Date().toISOString(),
      vitals: appointment.vitals || undefined,
      prescription: appointment.prescription || undefined,
      labRequest: appointment.labRequest || undefined
    };

    const apptsColl = await getAppointmentsCollection();
    await apptsColl.insertOne(newAppt);

    res.status(201).json(newAppt);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to schedule appointment.' });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const apptsColl = await getAppointmentsCollection();

    const existing = await apptsColl.findOne({ id });
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    // Direct field mapping of clinical properties
    const setFields: any = {};
    if (updates.status) setFields.status = updates.status;
    if (updates.date) setFields.date = updates.date;
    if (updates.vitals) setFields.vitals = updates.vitals;
    if (updates.prescription) setFields.prescription = updates.prescription;
    if (updates.labRequest) setFields.labRequest = updates.labRequest;

    await apptsColl.updateOne({ id }, { $set: setFields });

    const updated = { ...existing, ...setFields };
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update appointment.' });
  }
});

// Admin creation of staff accounts
app.post('/api/users/staff', async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Required fields missing for staff account.' });
    }

    const usersColl = await getUsersCollection();
    const existing = await usersColl.findOne({ 'user.email': email.toLowerCase().trim() });

    if (existing) {
      return res.status(400).json({ error: 'A user with this email address already exists.' });
    }

    const newStaff = {
      id: `usr-staff-${role}-${Math.floor(100000 + Math.random() * 900000)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      department,
      createdAt: new Date().toISOString()
    };

    await usersColl.insertOne({
      user: newStaff,
      password: 'password123'
    });

    res.status(201).json({ user: newStaff });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create staff account.' });
  }
});

// 👥 API Endpoint: Update user/staff details
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required fields.' });
    }

    const usersColl = await getUsersCollection();
    const existingDoc = await usersColl.findOne({ 'user.id': id });
    if (!existingDoc) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Check email uniqueness if it has changed
    const newEmailNorm = email.toLowerCase().trim();
    if (newEmailNorm !== existingDoc.user.email) {
      const emailConflict = await usersColl.findOne({ 'user.email': newEmailNorm });
      if (emailConflict && emailConflict.user.id !== id) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }
    }

    const updatedUser = {
      ...existingDoc.user,
      name: name.trim(),
      email: newEmailNorm,
      ...(role && { role }),
      department: department ? department.trim() : undefined
    };

    await usersColl.updateOne({ 'user.id': id }, { $set: { user: updatedUser } });
    res.json({ user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user account.' });
  }
});

// 👥 API Endpoint: Retrieve all registered users/staff (public profile data only)
app.get('/api/users', async (req, res) => {
  try {
    const usersColl = await getUsersCollection();
    const list = await usersColl.find();
    const usersList = list.map((doc: any) => doc.user).filter(Boolean);
    res.json(usersList);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch registered users.' });
  }
});

// Vite Middleware integration or Static Assets serving
async function startServer() {
  await seedDefaultUsers();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CareBridge Full-Stack Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
