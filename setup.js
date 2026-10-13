#!/usr/bin/env node
'use strict';

/**
 * ONLUYEN_SOLVE — Auto Setup + Push to GitHub (v2, bulletproof)
 * Chạy: node setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════
const REPO_URL = 'https://github.com/thanhngucomvn999/ONLUYEN_SOLVE.git';
const COMMIT_MSG = 'Initial commit: ONLUYEN Solver v1.0';

// ═══════════════════════════════════════════════════════
// MÀU TERMINAL
// ═══════════════════════════════════════════════════════
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
};
const ok = (m) => console.log(`  ${c.green}✓${c.reset} ${m}`);
const warn = (m) => console.log(`  ${c.yellow}⚠${c.reset} ${m}`);
const err = (m) => console.log(`  ${c.red}✗${c.reset} ${m}`);
const info = (m) => console.log(`  ${c.cyan}ℹ${c.reset} ${m}`);
const title = (m) => console.log(`\n${c.bold}${c.magenta}${m}${c.reset}`);

// ═══════════════════════════════════════════════════════
// DIRECTORIES
// ═══════════════════════════════════════════════════════
const DIRS = [
  '.github/workflows',
  'src/api',
  'src/core',
  'src/scraper',
  'src/ui',
  'dist',
];

// ═══════════════════════════════════════════════════════
// FILE CONTENTS
// ═══════════════════════════════════════════════════════
const FILES = {};

// ── package.json ───────────────────────────────
FILES['package.json'] = String.raw`{
  "name": "onluyen-solve",
  "version": "1.0.0",
  "description": "AI Homework Solver for onluyen.vn - Multi-provider, modular, free forever",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-monkey": "^4.0.0"
  },
  "keywords": ["onluyen", "homework", "solver", "ai", "tampermonkey"],
  "license": "MIT"
}
`;

// ── vite.config.js ─────────────────────────────
FILES['vite.config.js'] = String.raw`import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'ONLUYEN Solver',
        namespace: 'thanhngucomvn999.ONLUYEN_SOLVE',
        version: '1.0.0',
        description: 'AI Homework Solver - Multi-provider',
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
`;

// ── .gitignore ─────────────────────────────────
FILES['.gitignore'] = String.raw`node_modules/
dist/*.js
dist/*.map
!dist/.gitkeep
*.log
.DS_Store
.env
.vscode/
.idea/
`;

// ── dist/.gitkeep ──────────────────────────────
FILES['dist/.gitkeep'] = '';

// ── LICENSE ────────────────────────────────────
FILES['LICENSE'] = String.raw`MIT License

Copyright (c) 2026 thanhngucomvn999

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

// ── README.md ──────────────────────────────────
FILES['README.md'] = String.raw`# 🎓 ONLUYEN Solver

[![License: MIT](https://img.shields.io/badge/License-MIT-a6e3a1.svg)](LICENSE)

> AI Homework Solver cho [onluyen.vn](https://app.onluyen.vn) — Đa provider, miễn phí & trả phí.

## ✨ Tính năng

- 🔌 Đa provider: Groq, Gemini, Cerebras, OpenRouter (free) + OpenAI, Claude, DeepSeek (paid) + Custom endpoint
- 🎯 UI Settings: chọn provider, model, API key trực tiếp trên panel
- 🧠 Fallback tự động khi provider lỗi
- 🎨 Fix True/False: dispatch đủ 5 event cho React/Vue
- 🔍 Heuristic Scraper: tự dò câu hỏi, không phụ thuộc class cứng
- 📦 Cache localStorage: câu đã giải không gọi lại API
- 🧪 Test kết nối provider trước khi chạy

## 🚀 Cài đặt

1. Cài [Tampermonkey](https://www.tampermonkey.net/)
2. Mở URL: https://thanhngucomvn999.github.io/ONLUYEN_SOLVE/solver.user.js
3. Tampermonkey hỏi cài đặt — bấm **Install**
4. Truy cập app.onluyen.vn

## 🔑 Lấy API key miễn phí

| Provider | Link | Chi phí |
|---|---|---|
| Groq | https://console.groq.com/keys | Miễn phí 14,400 RPD |
| Gemini | https://aistudio.google.com/apikey | Miễn phí 1,500 RPD |
| Cerebras | https://cloud.cerebras.ai | Miễn phí |
| OpenRouter | https://openrouter.ai/keys | Miễn phí 50 RPD |

## 🛠️ Lệnh Console

\`\`\`javascript
hwSolver.start()        // Giải tất cả
hwSolver.stop()         // Dừng
hwSolver.solveOnce()    // Giải 1 câu chưa giải
hwSolver.scan()         // Liệt kê câu hỏi
hwSolver.providers()    // Danh sách provider
hwSolver.help()         // Trợ giúp
\`\`\`

## 📄 License

MIT © 2026 thanhngucomvn999
`;

// ── .github/workflows/deploy.yml ───────────────
FILES['.github/workflows/deploy.yml'] = String.raw`name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Build userscript
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

// ── src/constants.js ───────────────────────────
FILES['src/constants.js'] = String.raw`export const CONFIG = {
  STORAGE_KEY: 'onluyen_solve_cfg',
  CACHE_KEY: 'onluyen_solve_cache',
  RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  PROXY_TIMEOUT_MS: 60000,
  INSTANT_MODE: false,
  HUMAN_DELAY_MIN: 200,
  HUMAN_DELAY_MAX: 800,
  LOG_LEVEL: 'INFO',
  DEFAULT_PROVIDER: 'groq',
};

export const PROVIDER_REGISTRY = {
  groq: {
    name: 'Groq',
    category: 'free',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  },
  gemini: {
    name: 'Google Gemini',
    category: 'free',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}',
    authType: 'query',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash'],
    isGemini: true,
  },
  cerebras: {
    name: 'Cerebras',
    category: 'free',
    baseUrl: 'https://api.cerebras.ai/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'llama-3.3-70b',
    models: ['llama-3.3-70b', 'llama-3.1-8b'],
  },
  openrouter: {
    name: 'OpenRouter',
    category: 'free',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
    ],
  },
  openai: {
    name: 'OpenAI',
    category: 'paid',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  },
  anthropic: {
    name: 'Anthropic Claude',
    category: 'paid',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    authType: 'x-api-key',
    defaultModel: 'claude-sonnet-4-20250514',
    models: ['claude-sonnet-4-20250514', 'claude-haiku-3-5-20241022'],
    isAnthropic: true,
  },
  deepseek: {
    name: 'DeepSeek',
    category: 'paid',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    authType: 'bearer',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  custom: {
    name: 'Custom (OpenAI-compatible)',
    category: 'custom',
    baseUrl: '',
    authType: 'bearer',
    defaultModel: '',
    models: [],
  },
};
`;

// ── src/logger.js ──────────────────────────────
FILES['src/logger.js'] = String.raw`import { CONFIG } from './constants.js';

class Logger {
  constructor() {
    this.history = [];
    this.levels = { DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, NONE: 5 };
  }

  _log(level, ...args) {
    const current = this.levels[CONFIG.LOG_LEVEL] || 2;
    if (this.levels[level] < current) return;

    const timestamp = new Date().toISOString();
    this.history.push({ timestamp, level, messages: args });
    if (this.history.length > 200) this.history.shift();

    const line = '[ONLUYEN][' + level + '] (' + timestamp + ') ' + args.join(' ');
    if (level === 'ERROR') console.error(line);
    else if (level === 'WARN') console.warn(line);
    else if (level === 'DEBUG') console.debug(line);
    else console.log(line);

    const box = document.getElementById('olv-log');
    if (box) {
      const el = document.createElement('div');
      el.textContent = '[' + new Date().toLocaleTimeString() + '] ' + args.join(' ');
      box.appendChild(el);
      box.scrollTop = box.scrollHeight;
    }
  }

  debug(...a) { this._log('DEBUG', ...a); }
  info(...a) { this._log('INFO', ...a); }
  warn(...a) { this._log('WARN', ...a); }
  error(...a) { this._log('ERROR', ...a); }
}

export const logger = new Logger();
`;

// ── src/core/StorageManager.js ─────────────────
FILES['src/core/StorageManager.js'] = String.raw`import { CONFIG, PROVIDER_REGISTRY } from '../constants.js';

export class StorageManager {
  constructor() {
    this.cfg = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
    this.cfg.keys = this.cfg.keys || {};
    this.cfg.models = this.cfg.models || {};
  }

  save() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.cfg));
  }

  getSelectedProvider() {
    return this.cfg.selectedProvider || CONFIG.DEFAULT_PROVIDER;
  }
  setSelectedProvider(id) {
    this.cfg.selectedProvider = id;
    this.save();
  }

  getKey(id) { return this.cfg.keys[id] || ''; }
  setKey(id, key) { this.cfg.keys[id] = key; this.save(); }

  getModel(id) {
    return this.cfg.models[id] ||
      (PROVIDER_REGISTRY[id] && PROVIDER_REGISTRY[id].defaultModel) || '';
  }
  setModel(id, model) { this.cfg.models[id] = model; this.save(); }

  getCustomUrl() { return this.cfg.customBaseUrl || ''; }
  setCustomUrl(url) { this.cfg.customBaseUrl = url; this.save(); }

  getCustomModel() { return this.cfg.customModel || ''; }
  setCustomModel(m) { this.cfg.customModel = m; this.save(); }

  getCache() {
    return JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY) || '{}');
  }
  setCache(cache) {
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cache));
  }
  clearCache() { localStorage.removeItem(CONFIG.CACHE_KEY); }

  hashQ(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return 'q_' + h;
  }
}
`;

// ── src/api/APIClient.js ───────────────────────
FILES['src/api/APIClient.js'] = String.raw`import { CONFIG, PROVIDER_REGISTRY } from '../constants.js';
import { logger } from '../logger.js';

export class APIClient {
  constructor(storage) {
    this.storage = storage;
  }

  async callProvider(providerId, prompt, images = []) {
    const p = PROVIDER_REGISTRY[providerId];
    if (!p) throw new Error('Provider không tồn tại: ' + providerId);

    const key = this.storage.getKey(providerId);
    if (!key && providerId !== 'custom') {
      throw new Error('Chưa có API key cho ' + p.name);
    }

    let url = p.baseUrl;
    let body = {};
    const headers = { 'Content-Type': 'application/json' };

    if (p.authType === 'bearer') {
      headers['Authorization'] = 'Bearer ' + key;
    } else if (p.authType === 'x-api-key') {
      headers['x-api-key'] = key;
      headers['anthropic-version'] = '2023-06-01';
    }

    const model = this.storage.getModel(providerId) || p.defaultModel;

    if (p.isGemini) {
      url = p.baseUrl.replace('{model}', model).replace('{key}', key);
      const parts = [{ text: prompt }];
      images.forEach(function (img) {
        parts.push({ inline_data: { mime_type: 'image/jpeg', data: img.split(',')[1] } });
      });
      body = { contents: [{ parts: parts }] };
    } else if (p.isAnthropic) {
      body = {
        model: model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      };
    } else {
      if (providerId === 'custom') url = this.storage.getCustomUrl();
      const content = images.length
        ? [{ type: 'text', text: prompt }].concat(
            images.map(function (i) { return { type: 'image_url', image_url: { url: i } }; })
          )
        : prompt;
      body = {
        model: model,
        messages: [{ role: 'user', content: content }],
        temperature: 0.1,
      };
    }

    logger.info('Gọi ' + p.name + ' (' + model + ')...');
    const res = await this._http({ method: 'POST', url: url, headers: headers, data: body });

    if (p.isGemini) {
      return (res.candidates && res.candidates[0] && res.candidates[0].content &&
        res.candidates[0].content.parts[0].text) || '';
    }
    if (p.isAnthropic) {
      return (res.content && res.content[0] && res.content[0].text) || '';
    }
    return (res.choices && res.choices[0] && res.choices[0].message.content) || '';
  }

  async getAnswer(question) {
    const prompt = this._buildPrompt(question);
    const images = await this._getImages(question.el);
    const errors = [];

    const priority = [this.storage.getSelectedProvider()];
    for (const id of Object.keys(PROVIDER_REGISTRY)) {
      if (id !== this.storage.getSelectedProvider() && this.storage.getKey(id)) {
        priority.push(id);
      }
    }

    for (const id of priority) {
      try {
        const txt = await this.callProvider(id, prompt, images);
        if (txt && txt.trim()) return txt.trim();
      } catch (e) {
        errors.push(PROVIDER_REGISTRY[id].name + ': ' + e.message);
        logger.warn(PROVIDER_REGISTRY[id].name + ' fail, thử provider kế tiếp...');
      }
    }
    throw new Error('Tất cả provider đều lỗi:\n' + errors.join('\n'));
  }

  _buildPrompt(q) {
    let s = 'Bạn là trợ lý giải bài tập. Trả lời CỰC NGẮN, chỉ đưa đáp án cuối cùng trên 1 dòng.\n\n';
    s += 'Loại câu hỏi: ' + q.type + '\n';
    s += 'Nội dung: ' + q.text + '\n';
    if (q.type === 'truefalse') s += '\n→ Chỉ trả lời "Đúng" hoặc "Sai".';
    if (q.type === 'fill') s += '\n→ Chỉ trả lời giá trị cần điền, KHÔNG giải thích.';
    if (q.type === 'choice') s += '\n→ Chỉ trả lời 1 chữ cái A/B/C/D.';
    return s;
  }

  async _getImages(container) {
    const imgs = container.querySelectorAll('img');
    const out = [];
    for (const img of imgs) {
      if (!img.src) continue;
      if (img.src.startsWith('data:')) {
        out.push(img.src);
        continue;
      }
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        const dataUrl = await new Promise(function (r) {
          const fr = new FileReader();
          fr.onload = function () { r(fr.result); };
          fr.readAsDataURL(blob);
        });
        out.push(dataUrl);
      } catch (_) { /* skip */ }
    }
    return out;
  }

  _http(opts) {
    const method = opts.method;
    const url = opts.url;
    const headers = opts.headers;
    const data = opts.data;
    const timeout = opts.timeout || CONFIG.PROXY_TIMEOUT_MS;

    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        method: method,
        url: url,
        headers: headers,
        data: data ? JSON.stringify(data) : undefined,
        timeout: timeout,
        onload: function (res) {
          try {
            if (res.status >= 200 && res.status < 300) {
              resolve(JSON.parse(res.responseText));
            } else {
              let detail = res.responseText.slice(0, 300);
              try {
                const parsed = JSON.parse(res.responseText);
                detail = (parsed.error && parsed.error.message) || detail;
              } catch (_) { /* ignore */ }
              reject(new Error('HTTP ' + res.status + ': ' + detail));
            }
          } catch (e) {
            reject(e);
          }
        },
        onerror: function () { reject(new Error('Lỗi mạng')); },
        ontimeout: function () { reject(new Error('Timeout')); },
      });
    });
  }
}
`;

// ── src/scraper/Scraper.js ─────────────────────
FILES['src/scraper/Scraper.js'] = String.raw`import { logger } from '../logger.js';

export class Scraper {
  static _normVN(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  static scanAll() {
    const out = [];
    const seen = new Set();
    const leafs = document.querySelectorAll('div, span, p, h1, h2, h3, h4, label, strong, b');

    leafs.forEach(function (leaf) {
      if (leaf.children.length > 0) return;
      const txt = (leaf.innerText || '').trim();
      if (!/^(Câu|Bài|Question)\s*\d+/i.test(txt)) return;

      let node = leaf.parentElement;
      let depth = 0;
      while (node && depth < 6) {
        const t = node.innerText || '';
        if (t.length < 30 || t.length > 3000) {
          node = node.parentElement;
          depth++;
          continue;
        }

        const hasABCD = /A[\.\)]/.test(t) && /B[\.\)]/.test(t);
        const hasTF = /Đúng/i.test(t) && /Sai/i.test(t);
        const hasInput = node.querySelector(
          'input[type="text"], input:not([type]), textarea'
        ) !== null;

        if (hasABCD || hasTF || hasInput) {
          let isSmallest = true;
          const children = node.querySelectorAll('div, section, article');
          for (const child of children) {
            const ct = child.innerText || '';
            if ((/A[\.\)]/.test(ct) || /Đúng/i.test(ct)) && ct.length < t.length) {
              isSmallest = false;
              break;
            }
          }
          if (isSmallest && !seen.has(node)) {
            const q = this.parseBlock(node);
            if (q) {
              seen.add(node);
              out.push(q);
            }
          }
          break;
        }
        node = node.parentElement;
        depth++;
      }
    });

    if (out.length === 0) {
      document.querySelectorAll('div').forEach(function (el) {
        if (el.innerText.length > 3000 || el.innerText.length < 20) return;
        if (seen.has(el)) return;
        const hasInput = el.querySelector(
          'input[type="text"], input:not([type]), textarea'
        ) !== null;
        const hasTF = /Đúng/i.test(el.innerText) && /Sai/i.test(el.innerText);
        const hasABCD = /A[\.\)]/.test(el.innerText) && /B[\.\)]/.test(el.innerText);
        if (hasInput || hasTF || hasABCD) {
          const q = this.parseBlock(el);
          if (q) {
            seen.add(el);
            out.push(q);
          }
        }
      });
    }

    logger.info('Scraper: tìm thấy ' + out.length + ' câu hỏi');
    return out;
  }

  static parseBlock(block) {
    const rawText = block.innerText.replace(/\s+/g, ' ').trim();
    let text = rawText;
    const m = rawText.match(/([A-D][\.\)]\s*.*)/);
    if (m) text = rawText.substring(0, m.index).trim();

    const tfEls = { trueEl: null, falseEl: null };
    block.querySelectorAll('div, span, button, label').forEach(function (el) {
      if (el.children.length > 2) return;
      const t = Scraper._normVN(el.innerText || '');
      if (t === 'dung' || t === 'true') tfEls.trueEl = el;
      if (t === 'sai' || t === 'false') tfEls.falseEl = el;
    });
    if (tfEls.trueEl && tfEls.falseEl) {
      return { el: block, type: 'truefalse', text: text, tfEls: tfEls };
    }

    const choices = [];
    block.querySelectorAll('div, label, span').forEach(function (el) {
      if (el.children.length > 2) return;
      const t = el.innerText.trim();
      const mm = t.match(/^([A-D])[\.\)]\s*(.*)/);
      if (mm) choices.push({ letter: mm[1], text: mm[2].trim(), el: el });
    });
    const uniq = [];
    const seenL = new Set();
    choices.forEach(function (ch) {
      if (!seenL.has(ch.letter)) {
        seenL.add(ch.letter);
        uniq.push(ch);
      }
    });
    if (uniq.length >= 2) {
      return { el: block, type: 'choice', text: text, choices: uniq };
    }

    const inputEl = block.querySelector(
      'input[type="text"], input:not([type]), textarea'
    );
    if (inputEl) return { el: block, type: 'fill', text: text, inputEl: inputEl };

    return null;
  }
}
`;

// ── src/ui/UIController.js ─────────────────────
FILES['src/ui/UIController.js'] = String.raw`import { CONFIG } from '../constants.js';

export class UIController {
  static _dispatchFullClick(el) {
    if (!el) return false;
    try { el.scrollIntoView({ block: 'center' }); } catch (_) { /* ignore */ }
    const r = el.getBoundingClientRect();
    const opts = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: r.left + r.width / 2,
      clientY: r.top + r.height / 2,
      button: 0,
      buttons: 1,
    };
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (type) {
      const ev = type.startsWith('pointer')
        ? new PointerEvent(type, Object.assign({}, opts, { pointerId: 1, pointerType: 'mouse' }))
        : new MouseEvent(type, opts);
      el.dispatchEvent(ev);
    });
    if (el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')) {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return true;
  }

  static isSelected(el) {
    if (!el) return false;
    if (el.checked) return true;
    const cls = (el.className || '').toString().toLowerCase();
    if (/(selected|active|checked|chosen)/.test(cls)) return true;
    if (el.getAttribute('aria-checked') === 'true') return true;
    const p = el.closest('div, label');
    if (p && /(selected|active|checked|chosen)/.test((p.className || '').toString().toLowerCase())) {
      return true;
    }
    return false;
  }

  static async selectTrueFalse(q, answer) {
    const target = Scraper._normVN(answer) === 'dung' ? q.tfEls.trueEl : q.tfEls.falseEl;
    if (!target) return false;
    UIController._dispatchFullClick(target);
    await new Promise(function (r) { setTimeout(r, 120); });
    if (!UIController.isSelected(target)) {
      const alt = target.closest('label, div') || target.parentElement;
      if (alt) UIController._dispatchFullClick(alt);
    }
    return true;
  }

  static async selectChoice(q, answer) {
    const upper = answer.toUpperCase();
    const c = q.choices.find(function (x) { return x.letter === upper; }) || q.choices[0];
    if (!c) return false;
    UIController._dispatchFullClick(c.el);
    await new Promise(function (r) { setTimeout(r, 120); });
    if (!UIController.isSelected(c.el)) {
      const alt = c.el.closest('label, div') || c.el.parentElement;
      if (alt) UIController._dispatchFullClick(alt);
    }
    return true;
  }

  static async typeInto(input, text) {
    input.focus();
    const proto = input.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;

    setter.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));

    if (CONFIG.INSTANT_MODE) {
      setter.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      for (const ch of text) {
        setter.call(input, input.value + ch);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        const delay = CONFIG.HUMAN_DELAY_MIN +
          Math.random() * (CONFIG.HUMAN_DELAY_MAX - CONFIG.HUMAN_DELAY_MIN);
        await new Promise(function (r) { setTimeout(r, delay); });
      }
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    input.blur();
  }
}
`;

// ── src/core/HomeworkSolver.js ─────────────────
FILES['src/core/HomeworkSolver.js'] = String.raw`import { CONFIG } from '../constants.js';
import { logger } from '../logger.js';
import { Scraper } from '../scraper/Scraper.js';
import { UIController } from '../ui/UIController.js';
import { APIClient } from '../api/APIClient.js';

export class HomeworkSolver {
  constructor(storage) {
    this.storage = storage;
    this.api = new APIClient(storage);
    this.state = { running: false, stopped: false };
  }

  _parseAnswer(raw, type) {
    let ans = raw.split('---')[0].trim();
    if (type === 'truefalse') {
      const low = ans.toLowerCase();
      if (/^(đúng|true|yes|t|1)/.test(low)) return 'Đúng';
      if (/^(sai|false|no|f|0)/.test(low)) return 'Sai';
    }
    if (type === 'choice') {
      const m = ans.match(/\b([A-D])\b/i);
      if (m) return m[1].toUpperCase();
    }
    if (type === 'fill') {
      ans = ans.replace(/^[=:]\s*/, '').replace(/\.$/, '').replace(/\./g, ',').trim();
    }
    return ans;
  }

  async solveOne(q) {
    const cache = this.storage.getCache();
    const key = this.storage.hashQ(q.text + '|' + q.type);
    let answer;

    if (cache[key]) {
      answer = cache[key];
      logger.info('Cache: "' + answer + '"');
    } else {
      const raw = await this.api.getAnswer(q);
      answer = this._parseAnswer(raw, q.type);
      cache[key] = answer;
      this.storage.setCache(cache);
    }

    logger.info('[' + q.type + '] -> "' + answer + '"');

    if (q.type === 'truefalse') return UIController.selectTrueFalse(q, answer);
    if (q.type === 'choice') return UIController.selectChoice(q, answer);
    if (q.type === 'fill' && q.inputEl) return UIController.typeInto(q.inputEl, answer);
    return false;
  }

  async solveAll() {
    this.state.stopped = false;
    this.state.running = true;
    const list = Scraper.scanAll();
    logger.info('Bắt đầu giải ' + list.length + ' câu');

    if (!list.length) {
      logger.warn('0 câu hỏi. Bấm "Quét thử" để kiểm tra DOM.');
      this.state.running = false;
      return;
    }

    for (const q of list) {
      if (this.state.stopped) break;
      try {
        await this.solveOne(q);
      } catch (e) {
        logger.error(e.message);
      }
      const delay = CONFIG.INSTANT_MODE ? 150 : 800;
      await new Promise(function (r) { setTimeout(r, delay); });
    }

    logger.info('Hoàn tất');
    this.state.running = false;
  }

  stop() {
    this.state.stopped = true;
    logger.info('Đã dừng');
  }
}
`;

// ── src/ui/Panel.js ────────────────────────────
FILES['src/ui/Panel.js'] = String.raw`import { PROVIDER_REGISTRY } from '../constants.js';
import { logger } from '../logger.js';
import { Scraper } from '../scraper/Scraper.js';

export class Panel {
  static build(solver, storage) {
    if (document.getElementById('olv-panel')) return;

    const style = document.createElement('style');
    style.textContent = [
      '#olv-panel{position:fixed;top:16px;right:16px;z-index:999999;width:420px;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
      'background:linear-gradient(135deg,#1e1e2e 0%,#181825 100%);',
      'color:#cdd6f4;border-radius:14px;overflow:hidden;',
      'box-shadow:0 20px 60px rgba(0,0,0,.55),0 0 0 1px rgba(137,180,250,.15);',
      'display:flex;flex-direction:column;max-height:92vh;',
      'transition:transform .25s cubic-bezier(.4,0,.2,1)}',
      '#olv-panel.mini{transform:translateY(calc(-100% + 48px))}',
      '#olv-panel .head{padding:12px 16px;',
      'background:linear-gradient(135deg,#89b4fa 0%,#cba6f7 100%);',
      'display:flex;justify-content:space-between;align-items:center;',
      'cursor:move;flex-shrink:0;user-select:none}',
      '#olv-panel .head b{color:#11111b;font-size:13px;font-weight:700;letter-spacing:.3px}',
      '#olv-panel .head .actions{display:flex;gap:6px}',
      '#olv-panel .head .actions span{cursor:pointer;color:#11111b;font-weight:700;',
      'font-size:14px;padding:2px 6px;border-radius:4px;transition:background .15s}',
      '#olv-panel .head .actions span:hover{background:rgba(17,17,27,.15)}',
      '#olv-panel .body{padding:14px 16px;overflow-y:auto;flex:1;font-size:12px}',
      '#olv-panel .body::-webkit-scrollbar{width:6px}',
      '#olv-panel .body::-webkit-scrollbar-thumb{background:#45475a;border-radius:3px}',
      '#olv-panel .row{display:flex;gap:6px;margin-bottom:6px}',
      '#olv-panel button{flex:1;background:#313244;color:#cdd6f4;border:1px solid #45475a;',
      'padding:8px 10px;border-radius:8px;cursor:pointer;font-size:11px;',
      'font-weight:600;transition:all .15s;font-family:inherit;white-space:nowrap}',
      '#olv-panel button:hover{background:#45475a;transform:translateY(-1px)}',
      '#olv-panel button:active{transform:translateY(0)}',
      '#olv-panel button.go{background:linear-gradient(135deg,#a6e3a1 0%,#94e2d5 100%);',
      'color:#11111b;border:0;font-weight:700}',
      '#olv-panel button.go:hover{box-shadow:0 4px 12px rgba(166,227,161,.35)}',
      '#olv-panel button.stop{background:linear-gradient(135deg,#f38ba8 0%,#eba0ac 100%);',
      'color:#11111b;border:0;font-weight:700}',
      '#olv-panel button.debug{background:#45475a;color:#f9e2af}',
      '#olv-panel button.test{background:#45475a;color:#89b4fa}',
      '#olv-panel label{color:#89b4fa;font-size:10px;font-weight:700;',
      'display:block;margin:10px 0 4px;text-transform:uppercase;letter-spacing:.5px}',
      '#olv-panel input,#olv-panel select{width:100%;box-sizing:border-box;',
      'padding:8px 10px;background:#11111b;color:#cdd6f4;',
      'border:1px solid #313244;border-radius:8px;font-size:11px;',
      'font-family:inherit;transition:border-color .15s}',
      '#olv-panel input:focus,#olv-panel select:focus{outline:0;border-color:#89b4fa}',
      '#olv-panel .badge{display:inline-block;padding:2px 8px;border-radius:10px;',
      'font-size:9px;font-weight:700;margin-left:6px;text-transform:uppercase;letter-spacing:.4px}',
      '#olv-panel .badge.free{background:#a6e3a1;color:#11111b}',
      '#olv-panel .badge.paid{background:#89b4fa;color:#11111b}',
      '#olv-panel .badge.custom{background:#f9e2af;color:#11111b}',
      '#olv-panel .divider{height:1px;background:linear-gradient(90deg,transparent,#45475a,transparent);margin:12px 0}',
      '#olv-log{max-height:160px;overflow:auto;background:#11111b;padding:10px;',
      'border-radius:8px;margin-top:8px;font-size:10px;line-height:1.55;',
      'font-family:"JetBrains Mono","Consolas",monospace;color:#a6adc8;',
      'border:1px solid #313244}',
      '#olv-log::-webkit-scrollbar{width:6px}',
      '#olv-log::-webkit-scrollbar-thumb{background:#45475a;border-radius:3px}',
      '#olv-panel .status{display:flex;align-items:center;gap:6px;',
      'padding:6px 10px;background:#11111b;border-radius:8px;',
      'font-size:10px;color:#a6adc8;margin-bottom:10px;border:1px solid #313244}',
      '#olv-panel .dot{width:7px;height:7px;border-radius:50%;background:#f9e2af;',
      'box-shadow:0 0 8px currentColor;animation:pulse 2s infinite}',
      '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}',
    ].join('\\n');
    document.head.appendChild(style);

    const p = document.createElement('div');
    p.id = 'olv-panel';

    const html = [
      '<div class="head">',
      '<b>ONLUYEN Solver</b>',
      '<div class="actions">',
      '<span id="olv-mini" title="Thu nhỏ">-</span>',
      '<span id="olv-toggle" title="Ẩn/Hiện">v</span>',
      '</div>',
      '</div>',
      '<div class="body" id="olv-body">',
      '<div class="status"><span class="dot"></span><span id="olv-status">Sẵn sàng</span></div>',
      '<div class="row">',
      '<button id="olv-start" class="go">▶ Giải tất cả</button>',
      '<button id="olv-once">⚡ 1 câu</button>',
      '</div>',
      '<div class="row">',
      '<button id="olv-debug" class="debug">🔍 Quét thử</button>',
      '<button id="olv-stop" class="stop">■ Dừng</button>',
      '</div>',
      '<div class="divider"></div>',
      '<label>🔌 API Provider <span id="olv-badge" class="badge free">Free</span></label>',
      '<select id="olv-provider">',
      '<optgroup label="Miễn phí">',
      '<option value="groq">Groq - Llama 3.3 70B</option>',
      '<option value="gemini">Google Gemini - Flash 2.0</option>',
      '<option value="cerebras">Cerebras - Llama 3.3 70B</option>',
      '<option value="openrouter">OpenRouter - Free models</option>',
      '</optgroup>',
      '<optgroup label="Trả phí">',
      '<option value="openai">OpenAI - GPT-4o / 4.1</option>',
      '<option value="anthropic">Anthropic - Claude Sonnet 4</option>',
      '<option value="deepseek">DeepSeek - V3 / R1</option>',
      '</optgroup>',
      '<optgroup label="Custom">',
      '<option value="custom">Custom (OpenAI-compatible)</option>',
      '</optgroup>',
      '</select>',
      '<label>🔑 API Key</label>',
      '<input id="olv-key" type="password" placeholder="Dán API key...">',
      '<label>📦 Model</label>',
      '<select id="olv-model"></select>',
      '<div id="olv-custom-wrap" style="display:none">',
      '<label>🌐 Custom Base URL</label>',
      '<input id="olv-custom-url" placeholder="https://...">',
      '<label>📦 Custom Model</label>',
      '<input id="olv-custom-model" placeholder="model-name">',
      '</div>',
      '<div class="row" style="margin-top:10px">',
      '<button id="olv-test" class="test">🧪 Kiểm tra</button>',
      '<button id="olv-save">💾 Lưu Settings</button>',
      '</div>',
      '<button id="olv-clear" style="width:100%">🗑 Xoá cache</button>',
      '<div class="divider"></div>',
      '<div id="olv-log"></div>',
      '</div>',
    ].join('');
    p.innerHTML = html;
    document.body.appendChild(p);

    const provSel = document.getElementById('olv-provider');
    const keyInput = document.getElementById('olv-key');
    const modelSel = document.getElementById('olv-model');
    const badge = document.getElementById('olv-badge');
    const customWrap = document.getElementById('olv-custom-wrap');
    const statusEl = document.getElementById('olv-status');

    function setStatus(msg) { statusEl.textContent = msg; }

    function refreshProviderUI() {
      const id = provSel.value;
      const pr = PROVIDER_REGISTRY[id];
      badge.className = 'badge ' + pr.category;
      badge.textContent = pr.category === 'free' ? 'Free'
        : pr.category === 'paid' ? 'Paid' : 'Custom';
      keyInput.value = storage.getKey(id);
      modelSel.innerHTML = '';

      if (id === 'custom') {
        modelSel.style.display = 'none';
        customWrap.style.display = 'block';
        document.getElementById('olv-custom-url').value = storage.getCustomUrl();
        document.getElementById('olv-custom-model').value = storage.getCustomModel();
      } else {
        modelSel.style.display = 'block';
        customWrap.style.display = 'none';
        pr.models.forEach(function (m) {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          if (storage.getModel(id) === m) opt.selected = true;
          modelSel.appendChild(opt);
        });
      }
    }

    provSel.onchange = refreshProviderUI;
    provSel.value = storage.getSelectedProvider();
    refreshProviderUI();

    document.getElementById('olv-save').onclick = function () {
      const id = provSel.value;
      storage.setSelectedProvider(id);
      storage.setKey(id, keyInput.value.trim());
      if (id === 'custom') {
        storage.setCustomUrl(document.getElementById('olv-custom-url').value.trim());
        storage.setCustomModel(document.getElementById('olv-custom-model').value.trim());
      } else {
        storage.setModel(id, modelSel.value);
      }
      logger.info('Đã lưu. Provider: ' + PROVIDER_REGISTRY[id].name);
      setStatus('Đã lưu Settings');
    };

    document.getElementById('olv-test').onclick = async function () {
      const id = provSel.value;
      setStatus('Đang test ' + PROVIDER_REGISTRY[id].name + '...');
      logger.info('Test ' + PROVIDER_REGISTRY[id].name + '...');
      try {
        const oldKey = storage.getKey(id);
        storage.setKey(id, keyInput.value.trim());
        if (id === 'custom') {
          storage.setCustomUrl(document.getElementById('olv-custom-url').value.trim());
          storage.setCustomModel(document.getElementById('olv-custom-model').value.trim());
        } else {
          storage.setModel(id, modelSel.value);
        }
        const txt = await solver.api.callProvider(id, 'Trả lời đúng 1 từ: OK');
        storage.setKey(id, oldKey);
        logger.info('OK! Phản hồi: "' + txt.slice(0, 50) + '"');
        setStatus('Kết nối OK');
      } catch (e) {
        logger.error(e.message);
        setStatus('Lỗi kết nối');
      }
    };

    document.getElementById('olv-clear').onclick = function () {
      storage.clearCache();
      logger.info('Đã xoá cache');
      setStatus('Đã xoá cache');
    };

    document.getElementById('olv-start').onclick = function () {
      setStatus('Đang giải...');
      solver.solveAll().then(function () { setStatus('Hoàn tất'); });
    };

    document.getElementById('olv-once').onclick = async function () {
      const l = Scraper.scanAll();
      const cache = storage.getCache();
      const q = l.find(function (x) {
        return !cache[storage.hashQ(x.text + '|' + x.type)];
      });
      if (q) await solver.solveOne(q);
      else logger.info('Không còn câu chưa giải');
    };

    document.getElementById('olv-debug').onclick = function () {
      const l = Scraper.scanAll();
      logger.info('Quét thử: ' + l.length + ' câu');
      l.forEach(function (q, i) {
        logger.info('  ' + (i + 1) + '. [' + q.type + '] ' + q.text.substring(0, 50) + '...');
      });
    };

    document.getElementById('olv-stop').onclick = function () {
      solver.stop();
      setStatus('Đã dừng');
    };

    document.getElementById('olv-toggle').onclick = function () {
      const b = document.getElementById('olv-body');
      b.style.display = b.style.display === 'none' ? 'block' : 'none';
    };

    document.getElementById('olv-mini').onclick = function () {
      p.classList.toggle('mini');
    };

    const head = p.querySelector('.head');
    let dx, dy, drag = false;
    head.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'SPAN') return;
      drag = true;
      dx = e.clientX - p.offsetLeft;
      dy = e.clientY - p.offsetTop;
    });
    document.addEventListener('mousemove', function (e) {
      if (!drag) return;
      p.style.left = (e.clientX - dx) + 'px';
      p.style.top = (e.clientY - dy) + 'px';
      p.style.right = 'auto';
    });
    document.addEventListener('mouseup', function () { drag = false; });
  }
}
`;

// ── src/main.js ────────────────────────────────
FILES['src/main.js'] = String.raw`import { PROVIDER_REGISTRY } from './constants.js';
import { logger } from './logger.js';
import { StorageManager } from './core/StorageManager.js';
import { HomeworkSolver } from './core/HomeworkSolver.js';
import { Scraper } from './scraper/Scraper.js';
import { Panel } from './ui/Panel.js';

(function () {
  'use strict';

  const storage = new StorageManager();
  const solver = new HomeworkSolver(storage);

  window.hwSolver = {
    start: function () { return solver.solveAll(); },
    stop: function () { return solver.stop(); },
    solveOnce: function () {
      const l = Scraper.scanAll();
      const cache = storage.getCache();
      const q = l.find(function (x) {
        return !cache[storage.hashQ(x.text + '|' + x.type)];
      });
      return q ? solver.solveOne(q) : null;
    },
    scan: function () { return Scraper.scanAll(); },
    providers: function () { return Object.keys(PROVIDER_REGISTRY); },
    help: function () {
      console.table({
        'hwSolver.start()': 'Giải tất cả câu hỏi',
        'hwSolver.stop()': 'Dừng',
        'hwSolver.solveOnce()': 'Giải 1 câu chưa giải',
        'hwSolver.scan()': 'Liệt kê câu hỏi đã detect',
        'hwSolver.providers()': 'Xem danh sách provider',
      });
    },
  };

  function boot() {
    Panel.build(solver, storage);
    logger.info('ONLUYEN Solver v1.0 khởi động');
    logger.info('Provider: ' + PROVIDER_REGISTRY[storage.getSelectedProvider()].name);
    logger.info('Bấm "Quét thử" để kiểm tra DOM.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
`;

// ── index.html ─────────────────────────────────
FILES['index.html'] = String.raw`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ONLUYEN Solver</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(135deg, #1e1e2e 0%, #181825 100%); color: #cdd6f4;
    min-height: 100vh; padding: 40px 20px; }
  .container { max-width: 780px; margin: 0 auto; background: #181825;
    border-radius: 20px; padding: 48px; box-shadow: 0 20px 60px rgba(0,0,0,.55);
    border: 1px solid #313244; }
  h1 { font-size: 36px; background: linear-gradient(135deg, #a6e3a1 0%, #89b4fa 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
  .subtitle { color: #89b4fa; margin-bottom: 28px; font-size: 15px; }
  h2 { color: #f9e2af; font-size: 20px; margin: 32px 0 14px; }
  p, li { line-height: 1.75; color: #bac2de; margin-bottom: 10px; }
  ul { padding-left: 22px; }
  code { background: #11111b; color: #f38ba8; padding: 3px 8px; border-radius: 5px;
    font-family: "JetBrains Mono", "Consolas", monospace; font-size: 13px; }
  .btn { display: inline-block; padding: 14px 28px; border-radius: 10px;
    text-decoration: none; font-weight: 700; margin: 8px 8px 8px 0;
    transition: all .2s; font-size: 14px; }
  .btn.primary { background: linear-gradient(135deg, #a6e3a1 0%, #94e2d5 100%); color: #11111b; }
  .btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(166,227,161,.3); }
  .btn.secondary { background: #313244; color: #89b4fa; border: 1px solid #45475a; }
  .badges { margin: 20px 0; }
  .badge { display: inline-block; padding: 5px 12px; border-radius: 14px;
    font-size: 11px; margin-right: 8px; font-weight: 700; }
  .badge.free { background: #a6e3a1; color: #11111b; }
  .badge.paid { background: #89b4fa; color: #11111b; }
  .card { background: #11111b; padding: 20px; border-radius: 12px;
    margin: 14px 0; border: 1px solid #313244; }
  a { color: #89b4fa; }
</style>
</head>
<body>
<div class="container">
  <h1>ONLUYEN Solver</h1>
  <p class="subtitle">AI Homework Solver cho onluyen.vn — Đa provider, miễn phí & trả phí</p>
  <div class="badges">
    <span class="badge free">Free: Groq, Gemini, Cerebras</span>
    <span class="badge paid">Paid: OpenAI, Claude</span>
    <span class="badge custom">Custom endpoint</span>
  </div>
  <h2>Cài đặt</h2>
  <p>Bấm nút dưới để cài userscript qua Tampermonkey:</p>
  <a class="btn primary" href="solver.user.js">📥 Cài đặt ONLUYEN Solver</a>
  <a class="btn secondary" href="https://github.com/thanhngucomvn999/ONLUYEN_SOLVE" target="_blank">📂 Xem trên GitHub</a>
  <h2>Lấy API key miễn phí</h2>
  <div class="card">
    <ul>
      <li><strong>Groq</strong> — <a href="https://console.groq.com/keys" target="_blank">console.groq.com/keys</a></li>
      <li><strong>Gemini</strong> — <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a></li>
      <li><strong>Cerebras</strong> — <a href="https://cloud.cerebras.ai" target="_blank">cloud.cerebras.ai</a></li>
      <li><strong>OpenRouter</strong> — <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a></li>
    </ul>
  </div>
  <h2>Lệnh Console</h2>
  <div class="card">
    <p><code>hwSolver.start()</code> — Giải tất cả câu hỏi</p>
    <p><code>hwSolver.stop()</code> — Dừng</p>
    <p><code>hwSolver.scan()</code> — Liệt kê câu hỏi đã detect</p>
    <p><code>hwSolver.help()</code> — Xem trợ giúp</p>
  </div>
  <h2>License</h2>
  <p>MIT © 2026 <a href="https://github.com/thanhngucomvn999">thanhngucomvn999</a></p>
</div>
</body>
</html>
`;

// ═══════════════════════════════════════════════════════
// LOGIC
// ═══════════════════════════════════════════════════════

function createDirs() {
  title('Tạo cấu trúc thư mục');
  DIRS.forEach(function (dir) {
    const full = path.join(process.cwd(), dir);
    if (!fs.existsSync(full)) {
      fs.mkdirSync(full, { recursive: true });
      ok(dir);
    } else {
      info(dir + ' (đã tồn tại)');
    }
  });
}

function writeFiles() {
  title('Viết các file');
  Object.keys(FILES).forEach(function (filePath) {
    const full = path.join(process.cwd(), filePath);
    const dir = path.dirname(full);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(full, FILES[filePath], 'utf8');
    ok(filePath);
  });
}

function exec(cmd, opts) {
  opts = opts || {};
  return execSync(cmd, Object.assign({ stdio: 'inherit', cwd: process.cwd() }, opts));
}

function tryExec(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe', cwd: process.cwd() }).toString().trim();
  } catch (_) {
    return null;
  }
}

function gitSetup() {
  title('Cấu hình Git');

  const ver = tryExec('git --version');
  if (!ver) {
    err('Git chưa được cài! Tải tại: https://git-scm.com/downloads');
    process.exit(1);
  }
  ok('Git: ' + ver);

  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    execSync('git init', { stdio: 'pipe' });
    ok('Đã khởi tạo git repo');
  } else {
    info('.git đã tồn tại');
  }

  try {
    execSync('git branch -M main', { stdio: 'pipe' });
    ok('Branch: main');
  } catch (_) {
    info('Không đổi branch (repo trống)');
  }

  const userName = tryExec('git config user.name');
  const userEmail = tryExec('git config user.email');
  if (!userName || !userEmail) {
    warn('Chưa cấu hình git user - dùng mặc định');
    execSync('git config user.name "thanhngucomvn999"', { stdio: 'pipe' });
    execSync('git config user.email "thanhngucomvn999@users.noreply.github.com"', { stdio: 'pipe' });
    ok('Đã set user mặc định');
  } else {
    ok('User: ' + userName + ' <' + userEmail + '>');
  }

  execSync('git add .', { stdio: 'pipe' });
  ok('Đã add tất cả file');

  const status = tryExec('git status --porcelain');
  if (status) {
    try {
      execSync('git commit -m "' + COMMIT_MSG + '"', { stdio: 'pipe' });
      ok('Commit: ' + COMMIT_MSG);
    } catch (e) {
      warn('Commit lỗi: ' + e.message);
    }
  } else {
    info('Không có gì để commit');
  }

  const existingRemote = tryExec('git remote get-url origin');
  if (existingRemote) {
    execSync('git remote remove origin', { stdio: 'pipe' });
    info('Đã xoá remote cũ');
  }
  execSync('git remote add origin ' + REPO_URL, { stdio: 'pipe' });
  ok('Remote: ' + REPO_URL);
}

function gitPush() {
  title('Push lên GitHub');
  info('Đang push...');
  console.log();

  try {
    exec('git push -u origin main --force');
    ok('Push thành công!');
    return true;
  } catch (_) {
    err('Push thất bại. Thử thủ công: git push -u origin main --force');
    return false;
  }
}

function showNextSteps() {
  title('Hoàn tất!');
  console.log();
  info('Bước tiếp theo:');
  console.log('  1. Vào: ' + c.cyan + 'https://github.com/thanhngucomvn999/ONLUYEN_SOLVE' + c.reset);
  console.log('  2. Tab ' + c.bold + 'Actions' + c.reset + ' → xem workflow "Build and Deploy"');
  console.log('  3. Chờ ~2 phút → workflow xanh');
  console.log('  4. Tab ' + c.bold + 'Settings → Pages' + c.reset + ' → Source = ' + c.cyan + 'GitHub Actions' + c.reset);
  console.log('  5. Sau khi deploy, cài tại:');
  console.log('     ' + c.green + 'https://thanhngucomvn999.github.io/ONLUYEN_SOLVE/solver.user.js' + c.reset);
  console.log();
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════
function main() {
  console.log();
  console.log(c.bold + c.magenta + '=========================================' + c.reset);
  console.log(c.bold + c.magenta + '  ONLUYEN_SOLVE - Auto Setup + Push Git' + c.reset);
  console.log(c.bold + c.magenta + '=========================================' + c.reset);
  console.log();
  info('Thư mục: ' + process.cwd());
  info('Repo:    ' + REPO_URL);
  console.log();

  try {
    createDirs();
    writeFiles();
    gitSetup();
    gitPush();
    showNextSteps();
  } catch (e) {
    console.log();
    err('Lỗi: ' + e.message);
    console.log(e.stack);
    process.exit(1);
  }
}

main();