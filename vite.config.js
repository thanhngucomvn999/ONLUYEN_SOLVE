import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'ONLUYEN Solver',
        namespace: 'thanhngucomvn999.ONLUYEN_SOLVE',
        version: '3.1.0',
        description: 'AI Homework Solver - Multi-provider',
        author: 'thanhngucomvn999',
        match: ['https://app.onluyen.vn/*', 'https://*.onluyen.vn/*'],
        grant: ['GM_xmlhttpRequest', 'GM_setValue', 'GM_getValue'],
        connect: [
          'api.groq.com',
          'generativelanguage.googleapis.com',
          'api.cerebras.ai',
          'openrouter.ai',
          'api.openai.com',
          'api.anthropic.com',
          'api.deepseek.com',
          '*'
        ],
        'run-at': 'document-idle',
      },
      build: {
        fileName: 'solver.user.js',
        externalGlobals: {},
      },
    }),
  ],
});
