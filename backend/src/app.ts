import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { auth } from '@/lib/auth.js';
import { errorHandler } from '@/middlewares/errorMiddleware.js';
import addressRoutes from '@/routes/addressRoutes.js';
import adminRoutes from '@/routes/adminRoutes.js';
import cartRoutes from '@/routes/cartRoutes.js';
import categoryRoutes from '@/routes/categoryRoutes.js';
import orderRoutes from '@/routes/orderRoutes.js';
import productRoutes from '@/routes/productRoutes.js';
import wishlistRoutes from '@/routes/wishlistRoutes.js';

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

app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

export default app;
