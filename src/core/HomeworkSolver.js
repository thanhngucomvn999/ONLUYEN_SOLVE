import { CONFIG } from '../constants.js';
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
