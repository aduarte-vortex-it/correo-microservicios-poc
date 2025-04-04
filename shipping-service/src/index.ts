import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import logger from './infrastructure/utils/logger.js';
import { authenticateToken } from './infrastructure/middleware/auth.js';
import { NotificationService } from './infrastructure/services/NotificationService.js';
import shipmentRoutes from './application/routes/shipmentRoutes.js';
import authRoutes from './application/routes/authRoutes.js';

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

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas protegidas
app.use('/api/shipments', authenticateToken, shipmentRoutes);

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
    if (response.Messages && response.Messages.length > 0) {
      logger.info(`Procesando ${response.Messages.length} mensajes de la cola SQS`);
      
      for (const message of response.Messages) {
        try {
          if (!message.Body) {
            logger.warn('Mensaje recibido sin cuerpo');
            continue;
          }
          
          const parsedBody = JSON.parse(message.Body);
          logger.info('Mensaje SQS recibido:', parsedBody);
          
          // Extraer información del mensaje
          const shipmentId = parsedBody.id || 'desconocido';
          const action = parsedBody.action || 'PROCESS';
          const status = parsedBody.status || 'N/A';
          
          // Generar mensaje informativo
          let notificationMessage = '';
          let notificationSubject = '';
          
          switch (action) {
            case 'DELETE':
              notificationMessage = `Envío eliminado: ${shipmentId}`;
              notificationSubject = 'Eliminación de Envío';
              break;
            case 'UPDATE_STATUS':
              notificationMessage = `Envío actualizado: ${shipmentId}, nuevo estado: ${status}`;
              notificationSubject = 'Actualización de Estado';
              break;
            default:
              notificationMessage = `Envío procesado: ${shipmentId}`;
              notificationSubject = 'Procesamiento de Envío';
          }
          
          // Enviar notificación
          await notificationService.sendNotification(
            notificationMessage,
            notificationSubject
          );
          
          logger.info(notificationMessage);
          
          // Eliminar el mensaje de la cola
          if (message.ReceiptHandle) {
            await sqsClient.send(new DeleteMessageCommand({
              QueueUrl: config.aws.sqsQueueUrl,
              ReceiptHandle: message.ReceiptHandle
            }));
            logger.info(`Mensaje eliminado de la cola: ${message.MessageId}`);
          }
        } catch (error) {
          logger.error('Error procesando mensaje SQS:', error);
        }
      }
    } else {
      logger.debug('No hay mensajes nuevos en la cola SQS');
    }
  } catch (error) {
    logger.error('Error recibiendo mensajes de SQS:', error);
  }
}

// Iniciar el procesamiento de mensajes
setInterval(processShipments, 30000);

const port = config.port;
app.listen(port, () => {
  logger.info(`Servidor escuchando en el puerto ${port}`);
}); 