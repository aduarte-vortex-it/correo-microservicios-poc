import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { config } from '../../config/index.js';
import logger from '../utils/logger.js';

export class NotificationService {
  private readonly snsClient: SNSClient;

  constructor() {
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
      const command = new PublishCommand({
        TopicArn: config.aws.snsTopicArn,
        Message: message,
        Subject: subject
      });

      await this.snsClient.send(command);
      logger.info('Notificación enviada exitosamente');
    } catch (error) {
      logger.error('Error al enviar notificación:', error);
      throw error;
    }
  }
} 