import { Model, Schema, SchemaOptions, SchemaDefinition, SchemaDefinitionType, ResolveSchemaOptions, DefaultSchemaOptions } from 'mongoose';
import _ from 'lodash';

interface Configuration<> {
    // eslint-disable-next-line no-unused-vars
    plugins?: Array<(schema: Schema) => void>;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
    pre?: Record<string, Array<(this: any, next: () => void) => void | Promise<void>>>;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
    post?: Record<string, Array<(doc: any, next: () => void) => void | Promise<void>>>;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
    methods?: Record<string, (this: any, ...args: any[]) => any>;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
    statics?: Record<string, (this: any, ...args: any[]) => any>;
    indexes?: Array<{ fields: Record<string, 1 | -1>; options?: Record<string, unknown> }>;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ConfigurableSchema<T = unknown, TModel extends Model<any, any, any, any, any, any> = Model<any, any, any, any, any, any>, TInstanceMethods = unknown> extends Schema<T, TModel, TInstanceMethods> {
    constructor(
        definition?: SchemaDefinition<SchemaDefinitionType<T>>,
        options?: SchemaOptions<T> & { configuration?: Configuration }
    ) {
        const { configuration, ...schemaOptions } = options || {};
        super(definition, schemaOptions as ResolveSchemaOptions<DefaultSchemaOptions>);

        if (configuration) {
            this.applyConfiguration(configuration);
        }
    }

    private applyConfiguration(configuration: Configuration) {
        // Apply plugins
        if (_.isArray(configuration.plugins)) {
            configuration.plugins.forEach((plugin) => this.plugin(plugin));
        }

        // Apply pre-hooks
        if (_.isObject(configuration.pre)) {
            _.forEach(configuration.pre, (handlers, hook) => {
                if (_.isArray(handlers)) {
                    handlers.forEach((handler) => this.pre(hook as RegExp | 'createCollection', handler));
                }
            });
        }

        // Apply post-hooks
        if (_.isObject(configuration.post)) {
            _.forEach(configuration.post, (handlers, hook) => {
                if (_.isArray(handlers)) {
                    handlers.forEach((handler) => this.post(hook as RegExp | 'createCollection', handler));
                }
            });
        }

        // Apply methods
        if (_.isObject(configuration.methods)) {
            _.forEach(configuration.methods, (methodFunction, methodName) => {
                this.method(methodName, methodFunction);
            });
        }

        // Apply statics
        if (_.isObject(configuration.statics)) {
            _.forEach(configuration.statics, (staticFunction, staticName) => {
                this.static(staticName, staticFunction);
            });
        }

        // Apply indexes
        if (_.isArray(configuration.indexes)) {
            configuration.indexes.forEach(({ fields, options }) => {
                this.index(fields, options);
            });
        }
    }
}
