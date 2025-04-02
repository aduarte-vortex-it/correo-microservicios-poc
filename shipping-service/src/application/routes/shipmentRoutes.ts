import { Router } from 'express';
import { ShipmentController } from '../controllers/ShipmentController.js';
import { authenticateToken } from '../../infrastructure/middleware/auth.js';
import { ShipmentService } from '../../domain/services/ShipmentService.js';
import { ShipmentRepository } from '../../infrastructure/repositories/ShipmentRepository.js';

const shipmentRepository = new ShipmentRepository();
const shipmentService = new ShipmentService(shipmentRepository);
const shipmentController = new ShipmentController(shipmentService);

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Rutas de envíos
router.post('/', (req, res) => shipmentController.createShipment(req, res));
router.get('/:id', (req, res) => shipmentController.getShipment(req, res));
router.get('/user/:userId', (req, res) => shipmentController.getUserShipments(req, res));
router.patch('/:id/status', (req, res) => shipmentController.updateShipmentStatus(req, res));
router.delete('/:id', (req, res) => shipmentController.deleteShipment(req, res));

export default router; 