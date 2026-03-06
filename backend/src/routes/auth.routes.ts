import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));
router.put('/change-password', authenticate, (req, res, next) => authController.changePassword(req, res, next));

export default router;
