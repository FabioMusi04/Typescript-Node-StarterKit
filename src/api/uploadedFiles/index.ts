import { actions } from "./controller.ts";
import { Router } from "express";
import { authenticate } from "../../services/auth/auth.ts";
import { UsersRoleEnum } from "../../utils/enum.ts";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: UploadedFiles
 *   description: API endpoints for managing uploaded files
 */

/**
 * @swagger
 * /uploadedFiles:
 *   get:
 *     summary: Retrieve a list of uploaded files
 *     tags: [UploadedFiles]
 *     responses:
 *       200:
 *         description: A list of uploaded files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UploadedFile'
 */
router.get('/', authenticate(false, [UsersRoleEnum.ADMIN]), actions.getAll);

/**
 * @swagger
 * /uploadedFiles/{id}:
 *   get:
 *     summary: Retrieve a single uploaded file by ID
 *     tags: [UploadedFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The uploaded file ID
 *     responses:
 *       200:
 *         description: A single uploaded file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadedFile'
 *       404:
 *         description: Uploaded file not found
 */
router.get('/:id', authenticate(false, [UsersRoleEnum.ADMIN]), actions.getById);

/**
 * @swagger
 * /uploadedFiles:
 *   post:
 *     summary: Upload a new file
 *     tags: [UploadedFiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadedFile'
 *     responses:
 *       201:
 *         description: The uploaded file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadedFile'
 *       400:
 *         description: Bad request
 */
router.post('/', authenticate(false, [UsersRoleEnum.ADMIN]), actions.create);

/**
 * @swagger
 * /uploadedFiles/{id}:
 *   put:
 *     summary: Update an existing uploaded file
 *     tags: [UploadedFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The uploaded file ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadedFile'
 *     responses:
 *       200:
 *         description: The updated uploaded file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadedFile'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Uploaded file not found
 */
router.put('/:id', authenticate(false, [UsersRoleEnum.ADMIN]), actions.update);

/**
 * @swagger
 * /uploadedFiles/{id}:
 *   delete:
 *     summary: Permanently delete an uploaded file
 *     tags: [UploadedFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The uploaded file ID
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Uploaded file not found
 */
router.delete('/:id', authenticate(false, [UsersRoleEnum.ADMIN]), actions.deletePermanently);

export default router;