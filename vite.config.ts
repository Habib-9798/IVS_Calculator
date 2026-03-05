import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

// Custom plugin to sync frontend changes back to the source code (types.ts)
const codeSyncPlugin = () => ({
  name: 'code-sync-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.method === 'POST' && req.url === '/api/sync-config') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const settings = JSON.parse(body);
            const filePath = path.resolve(__dirname, 'src/types.ts');

            // Read the current file to preserve interfaces but update DEFAULT_SETTINGS
            const content = fs.readFileSync(filePath, 'utf-8');
            const startMarker = 'export const DEFAULT_SETTINGS: AppSettings = ';

            const startIndex = content.indexOf(startMarker);
            if (startIndex === -1) throw new Error('Could not find DEFAULT_SETTINGS marker');

            const assignmentStart = startIndex + startMarker.length;

            // Find the last closing brace in the file.
            const lastBraceIndex = content.lastIndexOf('}');
            if (lastBraceIndex === -1 || lastBraceIndex < assignmentStart) {
              throw new Error('Could not find end of DEFAULT_SETTINGS object');
            }

            // Check if there is a semicolon after the brace
            const nextSemicolon = content.indexOf(';', lastBraceIndex);
            const endOfObject = (nextSemicolon !== -1 && nextSemicolon < lastBraceIndex + 5)
              ? nextSemicolon + 1
              : lastBraceIndex + 1;

            const newDefaultSettings = JSON.stringify(settings, null, 2);
            const newContent = content.substring(0, assignmentStart) + newDefaultSettings + ';' + content.substring(endOfObject);

            fs.writeFileSync(filePath, newContent, 'utf-8');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error('Code Sync Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
      next();
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    plugins: [react(), tailwindcss(), codeSyncPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
