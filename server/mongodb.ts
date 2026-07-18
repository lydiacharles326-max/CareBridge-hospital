import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Dual-mode Database Helper (Real MongoDB + Robust Local File Fallback)
let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isMockDb = false;

const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
const localDbPath = isVercel
  ? path.join('/tmp', 'local_db.json')
  : path.join(process.cwd(), 'dist', 'local_db.json');

console.log(`📂 Clinical sandbox filesystem active at: ${localDbPath}`);

// Ensure the directory exists
function ensureLocalDbFile() {
  const dir = path.dirname(localDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ users: [], appointments: [] }, null, 2));
  }
}

// Read from JSON DB
function readLocalDb() {
  try {
    ensureLocalDbFile();
    const content = fs.readFileSync(localDbPath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Error reading local file database:', e);
    return { users: [], appointments: [] };
  }
}

// Write to JSON DB
function writeLocalDb(data: any) {
  try {
    ensureLocalDbFile();
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing local file database:', e);
  }
}

let lastConnectAttempt = 0;
let connectionFailedRecently = false;
const RETRY_COOLDOWN_MS = 15000; // 15 seconds

export async function getDb() {
  if (dbInstance) {
    return { db: dbInstance, isMock: isMockDb };
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (!isMockDb) {
      console.warn('⚠️ MONGODB_URI not provided. Falling back to a file-based JSON database.');
      isMockDb = true;
    }
    return { db: null, isMock: true };
  }

  const now = Date.now();
  if (connectionFailedRecently && (now - lastConnectAttempt) < RETRY_COOLDOWN_MS) {
    // Return mock database immediately without waiting for timeout to keep the app blazing fast
    isMockDb = true;
    return { db: null, isMock: true };
  }

  try {
    lastConnectAttempt = now;
    if (!client) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 2500, // Reduced to 2.5s for snappy failure detection on serverless
        connectTimeoutMS: 2500,
      });
    }
    await client.connect();
    dbInstance = client.db();
    isMockDb = false;
    connectionFailedRecently = false;
    console.log('🔌 Successfully connected to MongoDB database!');
    return { db: dbInstance, isMock: false };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB. Falling back to a file-based JSON database.', error);
    console.warn('💡 TIP: If this is running on Vercel, make sure you whitelisted "Allow Access From Anywhere" (0.0.0.0/0) in your MongoDB Atlas Network Access console.');
    client = null;
    dbInstance = null;
    isMockDb = true;
    connectionFailedRecently = true;
    return { db: null, isMock: true };
  }
}

// Unified Database CRUD Services
export async function getUsersCollection() {
  const { db, isMock } = await getDb();
  if (!isMock && db) {
    return {
      find: async (query: any = {}) => {
        try {
          return await db.collection('users').find(query).toArray();
        } catch (err) {
          console.error('⚠️ MongoDB query error (users.find), falling back to local file db:', err);
          const data = readLocalDb();
          return data.users.filter((user: any) => {
            for (const key in query) {
              if (user[key] !== query[key]) return false;
            }
            return true;
          });
        }
      },
      findOne: async (query: any) => {
        try {
          return await db.collection('users').findOne(query);
        } catch (err) {
          console.error('⚠️ MongoDB query error (users.findOne), falling back to local file db:', err);
          const data = readLocalDb();
          return data.users.find((user: any) => {
            for (const key in query) {
              if (user[key] !== query[key]) return false;
            }
            return true;
          }) || null;
        }
      },
      insertOne: async (doc: any) => {
        try {
          const result = await db.collection('users').insertOne(doc);
          return { acknowledged: result.acknowledged, insertedId: result.insertedId };
        } catch (err) {
          console.error('⚠️ MongoDB query error (users.insertOne), falling back to local file db:', err);
          const data = readLocalDb();
          data.users.push(doc);
          writeLocalDb(data);
          return { acknowledged: true, insertedId: doc.id };
        }
      },
      updateOne: async (query: any, update: any) => {
        try {
          const result = await db.collection('users').updateOne(query, update);
          return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
        } catch (err) {
          console.error('⚠️ MongoDB query error (users.updateOne), falling back to local file db:', err);
          const data = readLocalDb();
          let matchedCount = 0;
          let modifiedCount = 0;
          const setFields = update.$set || {};

          data.users = data.users.map((user: any) => {
            let matches = true;
            for (const key in query) {
              if (user[key] !== query[key]) {
                matches = false;
                break;
              }
            }
            if (matches) {
              matchedCount++;
              modifiedCount++;
              return { ...user, ...setFields };
            }
            return user;
          });

          writeLocalDb(data);
          return { matchedCount, modifiedCount };
        }
      },
      deleteMany: async (query: any) => {
        try {
          const result = await db.collection('users').deleteMany(query);
          return { acknowledged: result.acknowledged, deletedCount: result.deletedCount };
        } catch (err) {
          console.error('⚠️ MongoDB query error (users.deleteMany), falling back to local file db:', err);
          const data = readLocalDb();
          const initialLength = data.users.length;
          data.users = data.users.filter((u: any) => {
            let matches = true;
            for (const key in query) {
              const keys = key.split('.');
              let val = u;
              for (const k of keys) {
                val = val ? val[k] : undefined;
              }
              if (val !== query[key]) {
                matches = false;
                break;
              }
            }
            return !matches;
          });
          writeLocalDb(data);
          return { acknowledged: true, deletedCount: initialLength - data.users.length };
        }
      },
      deleteOne: async (query: any) => {
        try {
          const result = await db.collection('users').deleteOne(query);
          return { acknowledged: result.acknowledged, deletedCount: result.deletedCount };
        } catch (err) {
          console.error('⚠️ MongoDB query error (users.deleteOne), falling back to local file db:', err);
          const data = readLocalDb();
          const initialLength = data.users.length;
          const index = data.users.findIndex((u: any) => {
            let matches = true;
            for (const key in query) {
              const keys = key.split('.');
              let val = u;
              for (const k of keys) {
                val = val ? val[k] : undefined;
              }
              if (val !== query[key]) {
                matches = false;
                break;
              }
            }
            return matches;
          });
          if (index !== -1) {
            data.users.splice(index, 1);
            writeLocalDb(data);
          }
          return { acknowledged: true, deletedCount: initialLength - data.users.length };
        }
      },
      isMock: false
    };
  }

  // File fallback simulation
  return {
    find: async (query: any = {}) => {
      const data = readLocalDb();
      return data.users.filter((user: any) => {
        for (const key in query) {
          if (user[key] !== query[key]) return false;
        }
        return true;
      });
    },
    findOne: async (query: any) => {
      const data = readLocalDb();
      return data.users.find((user: any) => {
        for (const key in query) {
          if (user[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    insertOne: async (doc: any) => {
      const data = readLocalDb();
      data.users.push(doc);
      writeLocalDb(data);
      return { acknowledged: true, insertedId: doc.id };
    },
    updateOne: async (query: any, update: any) => {
      const data = readLocalDb();
      let matchedCount = 0;
      let modifiedCount = 0;
      const setFields = update.$set || {};

      data.users = data.users.map((user: any) => {
        let matches = true;
        for (const key in query) {
          if (user[key] !== query[key]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          matchedCount++;
          modifiedCount++;
          return { ...user, ...setFields };
        }
        return user;
      });

      writeLocalDb(data);
      return { matchedCount, modifiedCount };
    },
    deleteMany: async (query: any) => {
      const data = readLocalDb();
      const initialLength = data.users.length;
      data.users = data.users.filter((u: any) => {
        let matches = true;
        for (const key in query) {
          const keys = key.split('.');
          let val = u;
          for (const k of keys) {
            val = val ? val[k] : undefined;
          }
          if (val !== query[key]) {
            matches = false;
            break;
          }
        }
        return !matches;
      });
      writeLocalDb(data);
      return { acknowledged: true, deletedCount: initialLength - data.users.length };
    },
    deleteOne: async (query: any) => {
      const data = readLocalDb();
      const initialLength = data.users.length;
      const index = data.users.findIndex((u: any) => {
        let matches = true;
        for (const key in query) {
          const keys = key.split('.');
          let val = u;
          for (const k of keys) {
            val = val ? val[k] : undefined;
          }
          if (val !== query[key]) {
            matches = false;
            break;
          }
        }
        return matches;
      });
      if (index !== -1) {
        data.users.splice(index, 1);
        writeLocalDb(data);
      }
      return { acknowledged: true, deletedCount: initialLength - data.users.length };
    },
    isMock: true
  };
}

export async function getAppointmentsCollection() {
  const { db, isMock } = await getDb();
  if (!isMock && db) {
    return {
      find: async (query: any = {}) => {
        try {
          return await db.collection('appointments').find(query).sort({ createdAt: -1 }).toArray();
        } catch (err) {
          console.error('⚠️ MongoDB query error (appointments.find), falling back to local file db:', err);
          const data = readLocalDb();
          let list = data.appointments.filter((appt: any) => {
            for (const key in query) {
              if (appt[key] !== query[key]) return false;
            }
            return true;
          });
          list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return list;
        }
      },
      findOne: async (query: any) => {
        try {
          return await db.collection('appointments').findOne(query);
        } catch (err) {
          console.error('⚠️ MongoDB query error (appointments.findOne), falling back to local file db:', err);
          const data = readLocalDb();
          return data.appointments.find((appt: any) => {
            for (const key in query) {
              if (appt[key] !== query[key]) return false;
            }
            return true;
          }) || null;
        }
      },
      insertOne: async (doc: any) => {
        try {
          const result = await db.collection('appointments').insertOne(doc);
          return { acknowledged: result.acknowledged, insertedId: result.insertedId };
        } catch (err) {
          console.error('⚠️ MongoDB query error (appointments.insertOne), falling back to local file db:', err);
          const data = readLocalDb();
          data.appointments.unshift(doc);
          writeLocalDb(data);
          return { acknowledged: true, insertedId: doc.id };
        }
      },
      updateOne: async (query: any, update: any) => {
        try {
          const result = await db.collection('appointments').updateOne(query, update);
          return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
        } catch (err) {
          console.error('⚠️ MongoDB query error (appointments.updateOne), falling back to local file db:', err);
          const data = readLocalDb();
          let matchedCount = 0;
          let modifiedCount = 0;
          const setFields = update.$set || {};

          data.appointments = data.appointments.map((appt: any) => {
            let matches = true;
            for (const key in query) {
              if (appt[key] !== query[key]) {
                matches = false;
                break;
              }
            }
            if (matches) {
              matchedCount++;
              modifiedCount++;
              return { ...appt, ...setFields };
            }
            return appt;
          });

          writeLocalDb(data);
          return { matchedCount, modifiedCount };
        }
      },
      deleteOne: async (query: any) => {
        try {
          const result = await db.collection('appointments').deleteOne(query);
          return { deletedCount: result.deletedCount };
        } catch (err) {
          console.error('⚠️ MongoDB query error (appointments.deleteOne), falling back to local file db:', err);
          const data = readLocalDb();
          const initialLength = data.appointments.length;
          data.appointments = data.appointments.filter((appt: any) => {
            let matches = true;
            for (const key in query) {
              if (appt[key] !== query[key]) {
                matches = false;
                break;
              }
            }
            return !matches;
          });
          writeLocalDb(data);
          return { deletedCount: initialLength - data.appointments.length };
        }
      },
      isMock: false
    };
  }

  // File fallback simulation
  return {
    find: async (query: any = {}) => {
      const data = readLocalDb();
      let list = data.appointments.filter((appt: any) => {
        for (const key in query) {
          if (appt[key] !== query[key]) return false;
        }
        return true;
      });
      // Sort desc
      list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    findOne: async (query: any) => {
      const data = readLocalDb();
      return data.appointments.find((appt: any) => {
        for (const key in query) {
          if (appt[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    insertOne: async (doc: any) => {
      const data = readLocalDb();
      data.appointments.unshift(doc);
      writeLocalDb(data);
      return { acknowledged: true, insertedId: doc.id };
    },
    updateOne: async (query: any, update: any) => {
      const data = readLocalDb();
      let matchedCount = 0;
      let modifiedCount = 0;
      const setFields = update.$set || {};

      data.appointments = data.appointments.map((appt: any) => {
        let matches = true;
        for (const key in query) {
          if (appt[key] !== query[key]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          matchedCount++;
          modifiedCount++;
          return { ...appt, ...setFields };
        }
        return appt;
      });

      writeLocalDb(data);
      return { matchedCount, modifiedCount };
    },
    deleteOne: async (query: any) => {
      const data = readLocalDb();
      const initialLength = data.appointments.length;
      data.appointments = data.appointments.filter((appt: any) => {
        let matches = true;
        for (const key in query) {
          if (appt[key] !== query[key]) {
            matches = false;
            break;
          }
        }
        return !matches;
      });
      writeLocalDb(data);
      return { deletedCount: initialLength - data.appointments.length };
    },
    isMock: true
  };
}
