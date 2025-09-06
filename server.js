import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectToDb } from './db/connect.js';
import contactsRouter from './routes/contacts.js';
import { serveSwagger, setupSwagger } from './swagger.js';

const app = express();
const PORT = process.env.PORT || 8080;

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// health/root
app.get('/', (req, res) => {
  res.send('Hello World');
});

// api routes
app.use('/contacts', contactsRouter);

// swagger docs
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
  await connectToDb(process.env.MONGODB_URI, process.env.DB_NAME);
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
};

start();
