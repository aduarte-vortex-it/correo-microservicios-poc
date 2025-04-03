import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir la propiedad user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log('[Auth Middleware] Verifying authentication token for path:', req.path);
  try {
    const authHeader = req.headers['authorization'];
    console.log('[Auth Middleware] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.warn('[Auth Middleware] No token provided');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Validar el token JWT
    console.log('[Auth Middleware] Verifying token');
    try {
      const decoded = jwt.verify(token, 'tu-secreto-jwt') as { id: string; email: string };
      console.log('[Auth Middleware] Token valid for user:', decoded.email);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('[Auth Middleware] JWT verification error:', jwtError);
      return res.status(403).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('[Auth Middleware] Authentication error:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
}; 