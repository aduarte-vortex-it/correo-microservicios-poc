import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import config from '../../config/index.js';

// Extender la interfaz Request para incluir la propiedad user
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
      };
    }
  }
}

const verifier = CognitoJwtVerifier.create({
  userPoolId: config.aws.cognito.userPoolId,
  tokenUse: 'access',
  clientId: config.aws.cognito.clientId
});

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const payload = await verifier.verify(token);
    req.user = {
      sub: payload.sub,
      email: payload.email
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}; 