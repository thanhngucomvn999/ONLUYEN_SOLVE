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
    this.history = [];
  }

  _parseAnswer(raw, type) {
    const parts = raw.split('---');
    let ans = parts.length > 1 ? parts[1].trim() : parts[0].trim();

    if (CONFIG.THINK_BEFORE_ANSWER && parts.length > 1) {
      const reasoning = parts[0].trim();
      logger.info('💭 Suy luận: ' + reasoning.slice(0, 100));
    }

    if (type === 'truefalse') {
      const low = ans.toLowerCase();
      if (/^(đúng|true|yes|t|1|\+)/.test(low)) return 'Đúng';
      if (/^(sai|false|no|f|0|-)/.test(low)) return 'Sai';
    }

    if (type === 'choice') {
      const m = ans.match(/\b([A-D])\b/i);
      if (m) return m[1].toUpperCase();
      const firstChar = ans.trim().charAt(0).toUpperCase();
      if (/[A-D]/.test(firstChar)) return firstChar;
    }

    if (type === 'fill') {
      ans = ans
        .replace(/^[=:]\s*/, '')
        .replace(/\.$/, '')
        .replace(/\./g, ',')
        .replace(/\s+/g, ' ')
        .trim();

      if (/^-?\d+$/.test(ans)) return ans;
      if (/^-?\d+\/-?\d+$/.test(ans)) return ans;
    }

    return ans;
  }

  async solveOne(q) {
    const key = this.storage.hashQ(q.text + '|' + q.type);
    const cache = this.storage.getCache();
    let answer;

    if (cache[key]) {
      answer = cache[key];
      logger.info('📦 Cache: "' + answer + '"');
    } else {
      try {
        const raw = await this.api.getAnswer(q);
        answer = this._parseAnswer(raw, q.type);
        cache[key] = answer;
        this.storage.setCache(cache);
      } catch (err) {
        logger.error('❌ Không lấy được đáp án: ' + err.message);
        return false;
      }
    }

    logger.info('✅ [' + q.type + '] → "' + answer + '"');

    let success = false;
    if (q.type === 'truefalse') {
      success = await UIController.selectTrueFalse(q, answer);
    } else if (q.type === 'choice') {
      success = await UIController.selectChoice(q, answer);
    } else if (q.type === 'fill' && q.inputEl) {
      success = await UIController.typeInto(q.inputEl, answer);
    }

    if (!success) {
      logger.warn('⚠️ Không apply được đáp án cho câu ' + q.type);
    }

    this.history.push({
      question: q.text.slice(0, 80),
      type: q.type,
      answer,
      success,
      time: new Date().toISOString(),
    });

    return success;
  }

  async solveAll() {
    this.state.stopped = false;
    this.state.running = true;

    const list = Scraper.scanAll();
    logger.info(`🚀 Bắt đầu giải ${list.length} câu`);

    if (!list.length) {
      logger.warn('0 câu hỏi. Bấm "🔍 Quét thử" để kiểm tra DOM.');
      this.state.running = false;
      return;
    }

    let successCount = 0;
    for (let i = 0; i < list.length; i++) {
      if (this.state.stopped) {
        logger.info(`⏹ Dừng ở câu ${i + 1}/${list.length}`);
        break;
      }

      const q = list[i];
      logger.info(`─── Câu ${i + 1}/${list.length} ───`);

      try {
        const ok = await this.solveOne(q);
        if (ok) successCount++;
      } catch (err) {
        logger.error('❌ Câu ' + (i + 1) + ': ' + err.message);
      }

      if (i < list.length - 1) {
        await new Promise((r) => setTimeout(r, CONFIG.RATE_LIMIT_MS));
      }
    }

    logger.info(`🏁 Hoàn tất: ${successCount}/${list.length} câu thành công`);
    this.state.running = false;
  }

  stop() {
    this.state.stopped = true;
    logger.info('⏹ Đã dừng');
  }

  exportHistory() {
    return this.history;
  }
}
