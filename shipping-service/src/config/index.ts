import dotenv from 'dotenv';

dotenv.config();

export const config = {
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sqsQueueUrl: process.env.SQS_QUEUE_URL || '',
    snsTopicArn: process.env.SNS_TOPIC_ARN || '',
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID || '',
    cognitoClientId: process.env.COGNITO_CLIENT_ID || ''
  },
  server: {
    port: process.env.PORT || 8082,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
}; 