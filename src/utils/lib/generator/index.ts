import { Model } from 'mongoose';
import { Request, Response } from 'express';
import { validateFilterFields } from '../queryFilters/index.ts';
import { getByIdSchema, querySchema } from './middlewares/index.ts';
import { getFieldsToPopulate } from '../populate/index.ts';

/* eslint-disable no-unused-vars */
type ControllerFunctions = {
    create: (req: Request, res: Response) => Promise<void>;
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    deletePermanently: (req: Request, res: Response) => Promise<void>;
    remove: (req: Request, res: Response) => Promise<void>;
    restore: (req: Request, res: Response) => Promise<void>;
    [key: string]: (req: Request, res: Response) => Promise<void>;
};
/* eslint-enable no-unused-vars */


/**
 * Dynamically generates CRUD controllers for a given Mongoose model.
 * @param {Model<any>} model - The Mongoose model to generate controllers for.
 * @param {string} name - The name of the model (for error messages and logs).
 * @returns {ControllerFunctions} - CRUD controllers for the model.
 */
export function generateControllers<T>(model: Model<T>, name: string): ControllerFunctions {
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
                res.status(400).json({ message: `Failed to create ${name}: ${error?.message}` });
            }
        },

        /**
         * Get all documents, excluding soft-deleted ones by default
         */
        getAll: async (req: Request, res: Response) => {
            try {
                const validatedQuery = querySchema.parse(req.query);

                const { page = 1, limit = 10, filter = {}, sort = {} } = validatedQuery;

                const filterObject = validateFilterFields(filter as string, model.schema);
                const populateFields = getFieldsToPopulate(model.schema);
                
                const docs = await model
                    .find(filterObject)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .sort(sort)
                    .populate(populateFields)
                    .exec();

                const totalDocs = await model.countDocuments(filterObject);

                res.status(200).json({
                    totalDocs,
                    totalPages: Math.ceil(totalDocs / limit),
                    currentPage: page,
                    docs,
                });
            } catch (error) {
                res.status(500).json({ message: `Failed to fetch ${name}: ${error?.message}` });
            }
        },

        /**
         * Get a document by ID, excluding soft-deleted ones by default
         */
        getById: async (req: Request, res: Response) => {
            try {
                const { id } = getByIdSchema.parse(req.params);

                const populateFields = getFieldsToPopulate(model.schema);

                const doc = await model.findOne({
                    _id: id,
                    isDeleted: { $ne: true },
                }).populate(populateFields);

                if (!doc) {
                    res.status(404).json({ message: `${name} not found` });
                } else {
                    res.status(200).json(doc);
                }
            } catch (error) {
                res.status(500).json({ message: `Failed to fetch ${name}: ${error.message}` });
            }
        },

        /**
         * Update a document by ID, excluding soft-deleted ones
         */
        update: async (req: Request, res: Response) => {
            try {
                const { id } = getByIdSchema.parse(req.params);
                const updatedDoc = await model.findOne({ _id: id, isDeleted: { $ne: true } });
                if (!updatedDoc) {
                    res.status(404).json({ message: `${name} not found` });
                } else {   
                    updatedDoc.set(req.body);
                    await updatedDoc.save();
                    res.status(200).json(updatedDoc);
                }

                if (!updatedDoc) {
                    res.status(404).json({ message: `${name} not found` });
                } else {
                    res.status(200).json(updatedDoc);
                }
            } catch (error) {
                res.status(400).json({ message: `Failed to update ${name}: ${error.message}` });
            }
        },

        /**
         * Soft delete a document by ID
         */
        remove: async (req: Request, res: Response) => {
            try {
                const { id } = getByIdSchema.parse(req.params);
                const deletedDoc = await model.findOneAndUpdate(
                    { _id: id, isDeleted: { $ne: true } }, // Exclude already soft-deleted documents
                    { isDeleted: true, deletedAt: new Date() },
                    { new: true }
                );

                if (!deletedDoc) {
                    res.status(404).json({ message: `${name} not found or already deleted` });
                } else {
                    res.status(200).json({ message: `${name} soft deleted successfully` });
                }
            } catch (error) {
                res.status(500).json({ message: `Failed to delete ${name}: ${error.message}` });
            }
        },

        /**
         * Permanently delete a document by ID
         */
        deletePermanently: async (req: Request, res: Response) => {
            try {
                const { id } = getByIdSchema.parse(req.params);
                const permanentlyDeletedDoc = await model.findByIdAndDelete(id);

                if (!permanentlyDeletedDoc) {
                    res.status(404).json({ message: `${name} not found` });
                } else {
                    res.status(200).json({ message: `${name} permanently deleted successfully` });
                }
            } catch (error) {
                res.status(500).json({ message: `Failed to permanently delete ${name}: ${error.message}` });
            }
        },

        /**
         * Restore a soft-deleted document by ID
         */
        restore: async (req: Request, res: Response) => {
            try {
                const { id } = getByIdSchema.parse(req.params);
                const restoredDoc = await model.findOneAndUpdate(
                    { _id: id, isDeleted: true },
                    { isDeleted: false, deletedAt: null },
                    { new: true }
                );

                if (!restoredDoc) {
                    res.status(404).json({ message: `${name} not found or not soft deleted` });
                } else {
                    res.status(200).json({ message: `${name} restored successfully`, restoredDoc });
                }
            } catch (error) {
                res.status(500).json({ message: `Failed to restore ${name}: ${error.message}` });
            }
        },
    };
}
