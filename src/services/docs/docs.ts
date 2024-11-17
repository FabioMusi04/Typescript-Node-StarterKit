import swaggerJsdoc from 'swagger-jsdoc';
import swaggerOptions from '../../../swagger.json' assert { type: 'json' };
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import converter from 'openapi-to-postmanv2'
import { CollectionDefinition } from 'postman-collection';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export let postmanSpec: CollectionDefinition | null = null;

converter.convert({ type: 'string', data: JSON.stringify(swaggerSpec) },
  {}, (err, conversionResult) => {
    if (!conversionResult.result) {
      console.log('Postman collection not generated', conversionResult.reason);
    }
    else {
      console.log('Postman collection successfully generated');
      fs.writeFileSync(path.join(__dirname, 'postman.json'), JSON.stringify(conversionResult.output[0].data));
      postmanSpec = conversionResult.output[0].data;
    }
  }
);
