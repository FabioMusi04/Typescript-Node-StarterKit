import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import converter from 'openapi-to-postmanv2'
import { generalLogger } from '../logger/winston.ts';
import { readdirSync, statSync } from 'fs';
import Config from '../../config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename) + "/../../api";
const schema: [string, string][] = [];

// read file model.ts in each folder
for (const folder of readdirSync(__dirname)) {
  if (statSync(path.join(__dirname, folder)).isDirectory()) {
    const modelPath = path.join(__dirname, folder, 'model.ts');
    if (fs.existsSync(modelPath)) {
      const modelURL = pathToFileURL(modelPath).href;
      const modelModule = await import(modelURL);
      if (modelModule.swaggerSchema) {
        schema.push([modelModule.swaggerSchema.title, modelModule.swaggerSchema]);
      }
    }
  }
}

const swaggerDefinition = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Documentation",
      version: "1.0.0",
      description: "Documentation for your API",
    },
    servers: [
      {
        url: Config.ip + ":" + Config.port,
      },
    ],
    components: {
      schemas: {
        ...Object.fromEntries(schema),
      },
    },
  },
  apis: ["./src/api/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerDefinition);

export function generatePostmanDoc() {
  converter.convert({ type: 'string', data: JSON.stringify(swaggerSpec) },
    {}, (err, conversionResult) => {
      if (!conversionResult.result) {
        generalLogger.error('POSTMAN: collection not generated', conversionResult.reason);
      }
      else {
        generalLogger.info('POSTMAN: collection generated successfully');
        fs.writeFileSync(path.join(path.dirname(__filename), 'postman.json'), JSON.stringify(conversionResult.output[0].data));
      }
    }
  );
}