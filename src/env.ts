import { Level } from '@src/logging/loggerType';

const getEnv = () => ({
  authAudience: process.env.AUTH_AUDIENCE,
  authIssuer: process.env.AUTH_ISSUER,
  authJwksUri: process.env.AUTH_JWKS_URI,
  environment: process.env.ENVIRONMENT,
  logLevel: parseLogLevel({ level: process.env.LOG_LEVEL }),
  storageId: process.env.STORAGE_ID,
  storageRegion: process.env.STORAGE_REGION,
  storageSecret: process.env.STORAGE_SECRET,
});

const parseLogLevel = ({ level }: { level?: string }) => {
  if (!level) return Level.Info;
  const lowercaseLevel = level.toLowerCase();
  if (lowercaseLevel === 'debug') return Level.Debug;
  if (lowercaseLevel === 'error') return Level.Error;
  return Level.Info;
};

export default getEnv();
