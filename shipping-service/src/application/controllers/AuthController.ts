import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    console.log('[AuthController] Login attempt with email:', req.body.email);
    try {
      const { email, password } = req.body;

      // En un entorno de producción, aquí deberías validar las credenciales
      // Por ahora, simulamos una validación básica
      if (email === 'test@ejemplo.com' && password === 'test123') {
        console.log('[AuthController] Login successful for user:', email);
        const token = jwt.sign(
          { id: '1', email },
          'tu-secreto-jwt', // En producción, usa una variable de entorno
          { expiresIn: '1h' }
        );

        console.log('[AuthController] JWT token generated');
        res.json({ token });
      } else {
        console.warn('[AuthController] Invalid credentials for user:', email);
        res.status(401).json({ message: 'Credenciales inválidas' });
      }
    } catch (error) {
      console.error('[AuthController] Authentication error:', error);
      res.status(500).json({ message: 'Error en la autenticación' });
    }
  }
} 