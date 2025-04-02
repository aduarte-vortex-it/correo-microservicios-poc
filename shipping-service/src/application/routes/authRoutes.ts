import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const authController = new AuthController();
const router = Router();

router.post('/token', (req, res) => authController.login(req, res));

export default router; 