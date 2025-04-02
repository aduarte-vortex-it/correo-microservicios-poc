import { Request, Response, NextFunction } from 'express';

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
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // En un entorno de producción, aquí deberías validar el token
    // Por ahora, solo simulamos un usuario
    req.user = {
      id: '1',
      email: 'usuario@ejemplo.com'
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}; 