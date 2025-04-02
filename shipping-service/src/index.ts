import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { SQSClient, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import logger from './infrastructure/utils/logger.js';
import { authenticateToken } from './infrastructure/middleware/auth.js';
import { NotificationService } from './infrastructure/services/NotificationService.js';
import shipmentRoutes from './application/routes/shipmentRoutes.js';

dotenv.config();

const app = express();
const notificationService = new NotificationService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Rutas protegidas
app.use('/api/shipments', shipmentRoutes);

// Procesamiento de mensajes SQS
const sqsClient = new SQSClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

async function processShipments() {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: config.aws.sqsQueueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20
    });

    const response = await sqsClient.send(command);
    if (response.Messages) {
      for (const message of response.Messages) {
        try {
          const shipment = JSON.parse(message.Body || '{}');
          await notificationService.sendNotification(
            `Envío procesado: ${shipment.id}`,
            'Procesamiento de Envío'
          );
          logger.info(`Envío procesado: ${shipment.id}`);
        } catch (error) {
          logger.error('Error procesando mensaje:', error);
        }
      }
    }
  } catch (error) {
    logger.error('Error recibiendo mensajes:', error);
  }
}

// Iniciar el procesamiento de mensajes
setInterval(processShipments, 30000);

const port = config.port;
app.listen(port, () => {
  logger.info(`Servidor escuchando en el puerto ${port}`);
}); 