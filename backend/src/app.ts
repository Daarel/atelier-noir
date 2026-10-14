import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();

// security and middleware
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;
