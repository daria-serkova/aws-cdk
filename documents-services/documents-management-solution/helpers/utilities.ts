import { config } from 'dotenv';
config();
/**
 * Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
 */
export const isProduction = process.env.TAG_ENVIRONMENT === 'production';
