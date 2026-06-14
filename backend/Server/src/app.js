import express from 'express';
import cors from 'cors';

import sdkRoutes from './features/sdk/routes.js';
import dashboardRoutes from './features/dashboard/routes.js';
import mlEngineRoutes from './features/ml-engine/routes.js';
import catalogRoutes from './features/catalog-sync/routes.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/sdk', sdkRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/internal/ml', mlEngineRoutes);
app.use('/api/catalog', catalogRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

app.use(errorHandler);

export default app;
