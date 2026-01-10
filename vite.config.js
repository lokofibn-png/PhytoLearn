import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_API_KEY = "AIzaSyAwWDF0GdZordj_7bJubswdk3SJ9kLu0ok";

export default defineConfig({
  base: "./",
  plugins: [react()],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
      API_KEY: JSON.stringify(process.env.API_KEY || DEFAULT_API_KEY),
      FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY || DEFAULT_API_KEY)
    }
  }
});