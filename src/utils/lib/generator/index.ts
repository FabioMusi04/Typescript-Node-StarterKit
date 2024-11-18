import { Model } from 'mongoose';
import { Request, Response } from 'express';

type ControllerFunctions = {
    create: (req: Request, res: Response) => Promise<void>;
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    remove: (req: Request, res: Response) => Promise<void>;
};

/**
 * Dynamically generates CRUD controllers for a given Mongoose model.
 * @param {Model<any>} model - The Mongoose model to generate controllers for.
 * @param {string} name - The name of the model (for error messages and logs).
 * @returns {ControllerFunctions} - CRUD controllers for the model.
 */
export function generateControllers(model: Model<any>, name: string): ControllerFunctions {
    return {
        /**
         * Create a new document
         */
        create: async (req: Request, res: Response) => {
            try {
                const newDoc = new model(req.body);
                const savedDoc = await newDoc.save();
                res.status(201).json(savedDoc);
            } catch (error) {
                res.status(400).json({ message: `Failed to create ${name}: ${error.message}` });
            }
        },

        /**
         * Get all documents
         */
        getAll: async (_req: Request, res: Response) => {
            try {
                const docs = await model.find();
                res.status(200).json(docs);
            } catch (error) {
                res.status(500).json({ message: `Failed to fetch ${name}s: ${error.message}` });
            }
        },

        /**
         * Get a document by ID
         */
        getById: async (req: Request, res: Response) => {
            try {
                const doc = await model.findById(req.params.id);
                if (!doc) {
                    res.status(404).json({ message: `${name} not found` });
                }
                res.status(200).json(doc);
            } catch (error) {
                res.status(500).json({ message: `Failed to fetch ${name}: ${error.message}` });
            }
        },

        /**
         * Update a document by ID
         */
        update: async (req: Request, res: Response) => {
            try {
                const updatedDoc = await model.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true,
                });
                if (!updatedDoc) {
                    res.status(404).json({ message: `${name} not found` });
                }
                res.status(200).json(updatedDoc);
            } catch (error) {
                res.status(400).json({ message: `Failed to update ${name}: ${error.message}` });
            }
        },

        /**
         * Delete a document by ID
         */
        remove: async (req: Request, res: Response) => {
            try {
                const deletedDoc = await model.findByIdAndDelete(req.params.id);
                if (!deletedDoc) {
                    res.status(404).json({ message: `${name} not found` });
                }
                res.status(200).json({ message: `${name} deleted successfully` });
            } catch (error) {
                res.status(500).json({ message: `Failed to delete ${name}: ${error.message}` });
            }
        },
    };
}
