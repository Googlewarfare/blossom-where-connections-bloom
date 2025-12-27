/**
 * Environment Configuration & Validation
 * 
 * This module validates required environment variables at startup
 * and provides a typed interface for accessing them.
 */

interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_PROJECT_ID: string;
  MAPBOX_PUBLIC_TOKEN: string;
}

interface EnvValidationError {
  variable: string;
  message: string;
}

function validateEnv(): { config: EnvConfig; errors: EnvValidationError[] } {
  const errors: EnvValidationError[] = [];

  const requiredVars = [
    { key: 'VITE_SUPABASE_URL', name: 'SUPABASE_URL', description: 'Supabase project URL' },
    { key: 'VITE_SUPABASE_PUBLISHABLE_KEY', name: 'SUPABASE_PUBLISHABLE_KEY', description: 'Supabase anon/public key' },
    { key: 'VITE_SUPABASE_PROJECT_ID', name: 'SUPABASE_PROJECT_ID', description: 'Supabase project ID' },
    { key: 'VITE_MAPBOX_PUBLIC_TOKEN', name: 'MAPBOX_PUBLIC_TOKEN', description: 'Mapbox public access token' },
  ] as const;

  const config: Record<string, string> = {};

  for (const { key, name, description } of requiredVars) {
    const value = import.meta.env[key];
    
    if (!value || value.trim() === '') {
      errors.push({
        variable: key,
        message: `Missing required environment variable: ${key} (${description})`,
      });
      config[name] = '';
    } else {
      config[name] = value;
    }
  }

  return { 
    config: config as unknown as EnvConfig, 
    errors 
  };
}

const { config, errors } = validateEnv();

// Log errors in development, but don't crash the app
if (errors.length > 0 && import.meta.env.DEV) {
  console.group('⚠️ Environment Configuration Errors');
  errors.forEach((error) => {
    console.warn(`  • ${error.message}`);
  });
  console.groupEnd();
  console.info('💡 Create a .env file based on .env.example to resolve these issues.');
}

/**
 * Typed environment configuration object.
 * Access environment variables through this object for type safety.
 */
export const env = config;

/**
 * List of any environment validation errors encountered at startup.
 */
export const envErrors = errors;

/**
 * Check if all required environment variables are configured.
 */
export const isEnvValid = errors.length === 0;

/**
 * Get a formatted error message for display to users.
 */
export function getEnvErrorMessage(): string | null {
  if (errors.length === 0) return null;
  
  return `Application configuration error: ${errors.length} required environment variable(s) missing. Please check the console for details.`;
}
