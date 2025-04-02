import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { authenticateToken } from './middleware/auth.js';
import { NotificationService } from './services/notificationService.js';

// Load environment variables
dotenv.config();

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

// AWS Client
const sqsClient = new SQSClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'shipping-service'
  });
});

// Protected endpoints
app.use(authenticateToken);

// Process shipments from SQS
async function processShipments(): Promise<void> {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: config.aws.sqsQueueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20
    });

    const response = await sqsClient.send(command);
    
    if (response.Messages) {
      for (const message of response.Messages) {
        const shipment = JSON.parse(message.Body || '{}');
        logger.info('Processing shipment:', { shipmentId: shipment.id, ...shipment });
        
        try {
          // Procesar el envío
          await processShipment(shipment);
          await NotificationService.notifyShipmentProcessed(shipment.id);
        } catch (error) {
          logger.error('Error processing shipment:', { error, shipmentId: shipment.id });
          await NotificationService.notifyShipmentError(shipment.id, error.message);
        }
      }
    }
  } catch (error) {
    logger.error('Error processing shipments:', { error });
  }
}

async function processShipment(shipment: any): Promise<void> {
  // Simular procesamiento
  await new Promise(resolve => setTimeout(resolve, 1000));
  logger.info('Shipment processed:', { shipmentId: shipment.id });
}

// Start processing shipments
setInterval(processShipments, 30000);

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