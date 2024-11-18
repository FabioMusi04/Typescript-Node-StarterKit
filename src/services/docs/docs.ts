import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from '../../../swagger.json' assert { type: 'json' };
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import converter from 'openapi-to-postmanv2'
import { CollectionDefinition } from 'postman-collection';
import { generalLogger } from '../logger/winston.ts';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const swaggerSpec = swaggerJsdoc(swaggerOptions);

let postmanSpec: CollectionDefinition | null = null;

export function generatePostmanDoc() {
  converter.convert({ type: 'string', data: JSON.stringify(swaggerSpec) },
    {}, (err, conversionResult) => {
      if (!conversionResult.result) {
        generalLogger.error('POSTMAN: collection not generated', conversionResult.reason);
      }
      else {
        generalLogger.info('POSTMAN: collection generated successfully');
        fs.writeFileSync(path.join(__dirname, 'postman.json'), JSON.stringify(conversionResult.output[0].data));
        postmanSpec = conversionResult.output[0].data;
      }
    }
  );
}