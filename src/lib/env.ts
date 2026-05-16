const requiredEnvVars = [
  'DATABASE_URL',
];

const optionalEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'DIRECT_URL',
  'MONGODB_URI',
  'NODE_ENV',
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('Environment validation passed');
  return true;
}

export function getEnv() {
  return {
    required: requiredEnvVars.reduce((acc, key) => {
      acc[key] = process.env[key] || '';
      return acc;
    }, {} as Record<string, string>),
    optional: optionalEnvVars.reduce((acc, key) => {
      acc[key] = process.env[key] || '';
      return acc;
    }, {} as Record<string, string>),
  };
}

if (process.env.NODE_ENV === 'development') {
  validateEnv();
}