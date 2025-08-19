import path from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import { query } from '../../lib/models/db';

async function applySchema() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const schemaPath = path.resolve(__dirname, 'schema.sql');

  console.log(`Applying schema from: ${schemaPath}`);
  const sql = await readFile(schemaPath, { encoding: 'utf8' });

  // Execute the schema file as a single batch
  await query(sql);
  console.log('Schema applied successfully.');
}

const isDirectRun = () => import.meta.url === pathToFileURL(process.argv[1] || '').href;

if (isDirectRun()) {
  applySchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to apply schema:', err);
      process.exit(1);
    });
}

export default applySchema;


