import { logger } from '../logger.js';

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
            const q = Scraper.parseBlock(node);
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
