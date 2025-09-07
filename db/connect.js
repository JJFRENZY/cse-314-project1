// db/connect.js
import { MongoClient, ServerApiVersion } from 'mongodb';

let client;
let db;

export const connectToDb = async (uri, dbName) => {
  if (!uri) throw new Error('MONGODB_URI is not defined');
  if (!dbName) throw new Error('DB_NAME is not defined');
  if (db) return db;

  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    serverSelectionTimeoutMS: 10000, // fail in ~10s instead of hanging forever
    connectTimeoutMS: 10000
  });

  console.log('🔌 Connecting to MongoDB…');
  await client.connect(); // will throw if can’t connect
  db = client.db(dbName);
  console.log(`✅ Connected to MongoDB: ${db.databaseName}`);
  return db;
};

export const getDb = () => {
  if (!db) throw new Error('Database not initialized. Call connectToDb first.');
  return db;
};
