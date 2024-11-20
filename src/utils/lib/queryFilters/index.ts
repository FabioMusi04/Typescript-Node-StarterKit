import { Schema } from 'mongoose';

/**
 * Builds a Mongoose filter object from the filter query string.
 * @param {any} filterQuery - The raw filter query string (parsed from req.query).
 * @returns {object} - The Mongoose-compatible filter object.
 */
export function buildFilterObject(filterQuery: any): object {
    let filterObject = {};

    if (filterQuery) {
        try {
            const parsedFilter = JSON.parse(filterQuery);
            filterObject = parsedFilter;
        } catch (error) {
            throw new Error('Invalid filter query format');
        }
    }

    return filterObject;
}

/**
 * Validates and sanitizes the filter query by ensuring the field names exist in the model schema.
 * @param {object} filter - The raw filter object provided by the user.
 * @param {Schema} schema - The Mongoose schema to validate against.
 * @returns {object} - A sanitized filter object with only valid fields.
 */
export function validateFilterFields(filter: any, schema: Schema): object {
    const validFields = Object.keys(schema.paths);
    const sanitizedFilter: any = {};

    Object.keys(filter).forEach((key) => {
        const field = schema.paths[key];
        if (field && field.options.q) {
            sanitizedFilter[key] = filter[key];
        } else {
            console.warn(`Field '${key}' is not queryable.`);
        }
    });

    return sanitizedFilter;
}

