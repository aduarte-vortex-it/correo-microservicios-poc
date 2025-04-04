import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { config } from '../../config/index.js';
import logger from '../utils/logger.js';
import { v7 as uuidv7 } from 'uuid';

export class NotificationService {
  private readonly snsClient: SNSClient;

  constructor() {
    logger.info('[NotificationService] Initializing with AWS region:', config.aws.region);
    this.snsClient = new SNSClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      }
    });
  }

  async sendNotification(message: string, subject: string): Promise<void> {
    try {
      logger.info('[NotificationService] Preparing to send notification');
      
      // Verificar si el tema es FIFO (termina en .fifo)
      const isFifoTopic = config.aws.snsTopicArn.endsWith('.fifo');
      logger.info('[NotificationService] Topic is FIFO:', isFifoTopic);
      
      // Crear comando con parámetros adicionales para FIFO si es necesario
      const command = new PublishCommand({
        TopicArn: config.aws.snsTopicArn,
        Message: message,
        Subject: subject,
        // Parámetros requeridos para temas FIFO
        ...(isFifoTopic && {
          MessageGroupId: 'shipment-notifications', // Grupo de mensajes para envíos
          MessageDeduplicationId: uuidv7() // ID único para evitar duplicados
        })
      });

      logger.info('[NotificationService] Sending notification to SNS topic:', config.aws.snsTopicArn);
      await this.snsClient.send(command);
      logger.info('[NotificationService] Notification sent successfully');
    } catch (error) {
      logger.error('[NotificationService] Error sending notification:', error);
      throw error;
    }
  }
} 