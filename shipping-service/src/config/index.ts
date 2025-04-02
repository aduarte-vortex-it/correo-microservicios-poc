import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sqsQueueUrl: string;
    snsTopicArn: string;
  };
  logging: {
    level: string;
  };
}

export const config: Config = {
  port: Number(process.env.PORT) || 8082,
  nodeEnv: process.env.NODE_ENV || 'development',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sqsQueueUrl: process.env.SQS_QUEUE_URL || '',
    snsTopicArn: process.env.SNS_TOPIC_ARN || ''
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}; 