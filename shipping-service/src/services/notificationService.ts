import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const snsClient = new SNSClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

export interface NotificationMessage {
  shipmentId: string;
  status: string;
  message: string;
  timestamp: string;
}

export class NotificationService {
  static async sendNotification(message: NotificationMessage): Promise<void> {
    try {
      const command = new PublishCommand({
        TopicArn: config.aws.snsTopicArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
          'event_type': {
            DataType: 'String',
            StringValue: 'SHIPMENT_STATUS_UPDATE'
          }
        }
      });

      await snsClient.send(command);
      logger.info('Notificación enviada exitosamente:', { message });
    } catch (error) {
      logger.error('Error al enviar notificación:', { error, message });
      throw error;
    }
  }

  static async notifyShipmentCreated(shipmentId: string): Promise<void> {
    await this.sendNotification({
      shipmentId,
      status: 'CREATED',
      message: 'Envío creado exitosamente',
      timestamp: new Date().toISOString()
    });
  }

  static async notifyShipmentProcessed(shipmentId: string): Promise<void> {
    await this.sendNotification({
      shipmentId,
      status: 'PROCESSED',
      message: 'Envío procesado exitosamente',
      timestamp: new Date().toISOString()
    });
  }

  static async notifyShipmentError(shipmentId: string, error: string): Promise<void> {
    await this.sendNotification({
      shipmentId,
      status: 'ERROR',
      message: `Error en el envío: ${error}`,
      timestamp: new Date().toISOString()
    });
  }
} 