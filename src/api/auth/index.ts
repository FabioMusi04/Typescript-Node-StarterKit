import { Router } from 'express';
import { login, register } from './controller.ts';
import { authenticate } from '../../services/auth/auth.ts';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', authenticate(), (req, res) => {
    res.json(req.user);
});

export default router;