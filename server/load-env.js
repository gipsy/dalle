import * as dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load before any route modules read process.env (ESM hoists imports above index.js body).
dotenv.config({ path: join(__dirname, '.env') });
