import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectToDb } from './db/connect.js';
import contactsRouter from './routes/contacts.js';
import { serveSwagger, setupSwagger } from './swagger.js';

const app = express();
const PORT = process.env.PORT || 8080;

// --- Boot log (helps debug missing envs on Render) ---
console.log('🔧 Boot vars:', {
  hasUri: !!process.env.MONGODB_URI,
  uriPrefix: (process.env.MONGODB_URI || '').slice(0, 25) + (process.env.MONGODB_URI ? '...' : ''),
  db: process.env.DB_NAME,
  port: PORT
});

// --- Required env var checks ---
const required = ['MONGODB_URI', 'DB_NAME'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}. Set it in Render → Settings → Environment.`);
    process.exit(1);
  }
}

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// root route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// API routes
app.use('/contacts', contactsRouter);

// Swagger docs
app.use('/api-docs', serveSwagger, setupSwagger);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.expose ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const start = async () => {
  try {
    await connectToDb(process.env.MONGODB_URI, process.env.DB_NAME);
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
