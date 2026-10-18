import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolve the absolute path to server/.env regardless of the process working directory
export const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env');

// Immediately load environment variables before other modules are evaluated
dotenv.config({ path: ENV_FILE_PATH });

/**
 * Validates required environment variables at startup.
 * Logs only missing variable names and safe path information; never outputs secret values.
 */
export const validateEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missing = [];

  for (const key of required) {
    const val = process.env[key];
    // For MONGODB_URI, also accept legacy MONGO_URI
    if (key === 'MONGODB_URI') {
      const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!uri || uri.startsWith('your_')) {
        missing.push(key);
      }
      continue;
    }

    if (!val || val.startsWith('your_') || val.startsWith('change_me')) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(`\n[ENV WARNING] Missing or unconfigured required environment variables: ${missing.join(', ')}`);
    console.warn(`[ENV WARNING] Ensure they are defined in: ${ENV_FILE_PATH}\n`);
  } else {
    console.log(`\n[ENV INFO] All required environment variables verified successfully from: ${ENV_FILE_PATH}\n`);
  }

  return {
    isValid: missing.length === 0,
    missing
  };
};

export default {
  ENV_FILE_PATH,
  validateEnv
};
