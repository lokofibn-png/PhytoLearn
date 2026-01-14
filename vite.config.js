import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: "./",
    plugins: [react()],
    define: {
      // Safely expose process.env to the client for libraries that rely on it
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        // Prioritize VITE_API_KEY, fallback to API_KEY, then hardcoded (not recommended for prod)
        API_KEY: JSON.stringify(env.VITE_API_KEY || env.API_KEY || "AIzaSyANCF9BSzc-fqWogeT-48Q-TdJw9F09PVc"),
      }
    }
  };
});
