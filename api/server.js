// Vercel serverless handler — wraps Express app
// Token is read from env vars (META_ACCESS_TOKEN set in Vercel dashboard)
import app from '../server/app.js';

export default app;
