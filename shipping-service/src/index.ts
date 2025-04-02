import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { logger } from './infrastructure/utils/logger.js';
import { ShipmentService } from './domain/services/ShipmentService.js';
import { ShipmentRepository } from './infrastructure/repositories/ShipmentRepository.js';
import { ShipmentController } from './application/controllers/ShipmentController.js';
import { createShipmentRouter } from './application/routes/shipmentRoutes.js';
import { NotificationService } from './infrastructure/services/NotificationService.js';

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'shipping-service'
  });
});

// Initialize dependencies
const shipmentRepository = new ShipmentRepository();
const shipmentService = new ShipmentService(shipmentRepository);
const shipmentController = new ShipmentController(shipmentService);

// Routes
app.use('/api/shipments', createShipmentRouter(shipmentController));

// Start server
const port = config.server.port;
app.listen(port, () => {
  logger.info(`Shipping service running on port ${port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
}); 