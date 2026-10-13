import { CONFIG } from './constants.js';

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
