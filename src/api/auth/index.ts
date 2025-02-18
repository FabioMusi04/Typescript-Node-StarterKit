import { Router } from 'express';
import { authGoogle, authSuccess, login, register } from './controller.ts';
import { loginSchema, registerSchema } from './middlewares/index.ts';
import { validateBody } from '../../services/validator/body/index.ts';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Authenticate with Google
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication.
 */
router.get('/google', authGoogle);

/**
 * @swagger
 * /auth/google/success:
 *   get:
 *     tags: [Auth]
 *     summary: Google Authentication Success
 *     responses:
 *       200:
 *         description: Successfully authenticated with Google.
 */
router.get('/google/success', authSuccess);

export default router;
