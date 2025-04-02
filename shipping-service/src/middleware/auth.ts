import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: config.aws.cognitoUserPoolId,
  tokenUse: 'access',
  clientId: config.aws.cognitoClientId
});

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const payload = await cognitoVerifier.verify(token);
    req.user = payload;
    next();
  } catch (error) {
    logger.error('Error de autenticación:', { error });
    return res.status(403).json({ error: 'Token inválido' });
  }
}; 