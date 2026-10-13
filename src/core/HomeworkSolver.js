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

  // ═══════════════════════════════════════════════════
  // PARSE ANSWER — Flexible Formatting (VN)
  // ═══════════════════════════════════════════════════
  _parseAnswer(raw, type) {
    // Tách phần suy luận (trước ---) và đáp án (sau ---)
    const parts = raw.split('---');
    let ans = parts.length > 1 ? parts[1].trim() : parts[0].trim();

    if (CONFIG.THINK_BEFORE_ANSWER && parts.length > 1) {
      const reasoning = parts[0].trim();
      logger.info('💭 Suy luận: ' + reasoning.slice(0, 100));
    }

    // True/False
    if (type === 'truefalse') {
      const low = ans.toLowerCase();
      if (/^(đúng|true|yes|t|1|\+)/.test(low)) return 'Đúng';
      if (/^(sai|false|no|f|0|-)/.test(low)) return 'Sai';
    }

    // Multiple Choice
    if (type === 'choice') {
      const m = ans.match(/\b([A-D])\b/i);
      if (m) return m[1].toUpperCase();
      // Đôi khi model trả về full text — tìm chữ cái đầu
      const firstChar = ans.trim().charAt(0).toUpperCase();
      if (/[A-D]/.test(firstChar)) return firstChar;
    }

    // Fill-in — Format theo VN
    if (type === 'fill') {
      ans = ans
        .replace(/^[=:]\s*/, '')      // Bỏ dấu = hoặc :
        .replace(/\.$/, '')           // Bỏ dấu chấm cuối
        .replace(/\./g, ',')          // Đổi . thành ,
        .replace(/\s+/g, ' ')         // Chuẩn hoá khoảng trắng
        .trim();

      // Nếu là số nguyên, giữ nguyên
      if (/^-?\d+$/.test(ans)) return ans;

      // Nếu là phân số, giữ nguyên
      if (/^-?\d+\/-?\d+$/.test(ans)) return ans;
    }

    return ans;
  }

  // ═══════════════════════════════════════════════════
  // SOLVE ONE — Logic-First + Interaction-First
  // ═══════════════════════════════════════════════════
  async solveOne(q) {
    const key = this.storage.hashQ(q.text + '|' + q.type);
    const cache = this.storage.getCache();
    let answer;

    // ─── Cache hit ───
    if (cache[key]) {
      answer = cache[key];
      logger.info('📦 Cache: "' + answer + '"');
    } else {
      // ─── Gọi AI ───
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

    // ─── Interaction-First: Áp dụng đáp án ───
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

    // Lưu history để export
    this.history.push({
      question: q.text.slice(0, 80),
      type: q.type,
      answer,
      success,
      time: new Date().toISOString(),
    });

    return success;
  }

  // ═══════════════════════════════════════════════════
  // SOLVE ALL — Sequential + Rate Limiting
  // ═══════════════════════════════════════════════════
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

      // Rate limiting
      if (i < list.length - 1) {
        await new Promise((r) => setTimeout(r, CONFIG.RATE_LIMIT_MS));
      }
    }

    logger.info(`🏁 Hoàn tất: ${successCount}/${list.length} câu thành công`);
    this.state.running = false;
  }

  // ═══════════════════════════════════════════════════
  // STOP
  // ═══════════════════════════════════════════════════
  stop() {
    this.state.stopped = true;
    logger.info('⏹ Đã dừng');
  }

  // ═══════════════════════════════════════════════════
  // EXPORT HISTORY
  // ═══════════════════════════════════════════════════
  exportHistory() {
    return this.history;
  }
}
