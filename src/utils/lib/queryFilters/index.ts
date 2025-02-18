import { Schema } from 'mongoose';
import _ from 'lodash';
import { generalLogger } from '../../../services/logger/winston.ts';

/**
 * Builds a Mongoose filter object from the filter query string.
 * @param {any} filterQuery - The raw filter query string (parsed from req.query).
 * @returns {object} - The Mongoose-compatible filter object.
 */
export function buildFilterObject(filterQuery: string): object {
    let filterObject = {};

    if (filterQuery) {
        try {
            const parsedFilter = JSON.parse(filterQuery);
            filterObject = parsedFilter;
        } catch (error) {
            throw new Error('Invalid filter query format ', error?.message);
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

export function validateFilterFields(filter: string, schema: Schema): Record<string, unknown> {
    const sanitizedFilter: Record<string, unknown> = {};
    const filterObject: Record<string, unknown> = stringToObject(filter);
    
    for (const key in filterObject) {
        if (_.has(schema.paths, key)) {
            const field = schema.paths[key];
            if (field && typeof field === 'object' && 'q' in field.options && field.options.q === true) {
                sanitizedFilter[key] = filterObject[key]
            } else {
                generalLogger.warn(`Field ${key} is not queryable`);
            }
        }
    }
    
    return sanitizedFilter;    
}

function stringToObject(str: string): Record<string, unknown> {
    if (!str || str === "{}") {
        return {};
    }

    if (typeof str === "object") {
        return str as Record<string, unknown>;
    }

    str = str.trim().replace(/^\{/, "").replace(/\}$/, "");

    const pairs = str.split(",");
    const result: Record<string, unknown> = {};

    for (const pair of pairs) {
        const [key, value] = pair.split("=").map((item) => item.trim());

        if (key && value) {
            if (value.includes(":")) {
                const [operator, operatorValue] = value.split(":").map((item) => item.trim());
                if (Date.parse(operatorValue)) {
                    result[key] = {
                        [operator]: new Date(operatorValue),
                    };
                } else {
                    result[key] = {
                        [operator.replace('{', '')]: operatorValue.replace('}', ''),
                    };
                }
            } else {
                result[key] = isNaN(Number(value)) ? value : Number(value);
            }
        }
    }

    return result;
}

