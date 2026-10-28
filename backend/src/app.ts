import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { auth } from '@/lib/auth.js';
import { errorHandler } from '@/middlewares/errorMiddleware.js';
import productRoutes from '@/routes/productRoutes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
);

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/products', productRoutes);

app.use(errorHandler);

export default app;
