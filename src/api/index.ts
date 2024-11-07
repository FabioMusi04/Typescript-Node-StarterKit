import express, { Application, Router } from 'express';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

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
          console.log(`Loaded route for /${a.name}`);
        } else {
          console.warn(`No valid default export found in module ${a.name}`);
        }
      } else {
        console.warn(`No index.js file found in directory ${a.modulePath}`);
      }
    } catch (err) {
      console.error(`Failed to load module ${a.name}:`, err);
    }
  }
};

// Load routes asynchronously
loadRoutes().catch(err => console.error(`Error loading routes: ${err}`));

// Static route for apiDoc
router.use('/api', express.static(path.join(__dirname, '../../docs')));

export default router;
