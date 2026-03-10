import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initTokenManager } from './token-manager.js';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 3001;

initTokenManager(
  process.env.META_ACCESS_TOKEN,
  process.env.META_APP_ID,
  process.env.META_APP_SECRET
).then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Meta Ads proxy rodando em http://localhost:${PORT}`);
    console.log(`[server] Conta: ${process.env.META_ACCOUNT_ID}`);
  });
}).catch((err) => {
  console.error('[server] Erro ao inicializar token manager:', err);
  process.exit(1);
});
