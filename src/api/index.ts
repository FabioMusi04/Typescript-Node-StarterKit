import { Router } from 'express';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { generalLogger } from '../services/logger/winston.ts';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../services/docs/docs.ts';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router: Router = Router();

interface Module {
  name: string;
  modulePath: string;
}

const loadRoutes = async (): Promise<void> => {
  const modules: Module[] = readdirSync(__dirname)
    .filter(f => !f.startsWith('_'))
    .map(f => ({
      name: f,
      modulePath: path.join(__dirname, f)
    }))
    .filter(a => statSync(a.modulePath).isDirectory());

  for (const a of modules) {
    try {
      const moduleEntry = path.join(a.modulePath, 'index.ts');
      if (statSync(moduleEntry).isFile()) {
        const moduleURL = pathToFileURL(moduleEntry).href;
        const mod = await import(moduleURL);
        
        if (mod && mod.default && typeof mod.default === 'function') {
          router.use(`/${a.name}`, mod.default); 
          generalLogger.info('ROUTES: ', { message: `Loaded module ${a.name}` });
        } else {
          generalLogger.warn('ROUTES: ', { message: `No default export found in module ${a.name}` });
        }
      } else {
        generalLogger.warn('ROUTES: ', { message: `No index.ts found in module ${a.name}` });
      }
    } catch (err) {
      generalLogger.error('ROUTES: ', { message: err });
    }
  }
};

// Load routes asynchronously
loadRoutes().catch(err => generalLogger.error('ROUTES: ', { message: err }));

// Swagger setup
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
