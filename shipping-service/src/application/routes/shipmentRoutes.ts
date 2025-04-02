import { Router } from 'express';
import { ShipmentController } from '../controllers/ShipmentController';
import { authenticateToken } from '../../infrastructure/middleware/auth.js';

export function createShipmentRouter(controller: ShipmentController): Router {
  const router = Router();

  // Aplicar autenticación a todas las rutas
  router.use(authenticateToken);

  // Rutas de envíos
  router.post('/', (req, res) => controller.createShipment(req, res));
  router.get('/:id', (req, res) => controller.getShipment(req, res));
  router.get('/user/:userId', (req, res) => controller.getUserShipments(req, res));
  router.patch('/:id/status', (req, res) => controller.updateShipmentStatus(req, res));
  router.delete('/:id', (req, res) => controller.deleteShipment(req, res));

  return router;
} 