import { CONFIG } from '../constants.js';
import { logger } from '../logger.js';

export class Scraper {
  // ═══════════════════════════════════════════════════
  // NORMALIZE TIẾNG VIỆT
  // ═══════════════════════════════════════════════════
  static _normVN(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // ═══════════════════════════════════════════════════
  // CHECK ELEMENT SELECTED (inline, tránh circular import)
  // ═══════════════════════════════════════════════════
  static _isElSelected(el) {
    if (!el) return false;
    try {
      if (el.checked) return true;
      const cls = (el.className || '').toString().toLowerCase();
      if (/(selected|active|checked|chosen|picked)/.test(cls)) return true;
      if (el.getAttribute('aria-checked') === 'true') return true;
      if (el.getAttribute('aria-selected') === 'true') return true;
      const parent = el.closest && el.closest('div, label, li');
      if (parent) {
        const pc = (parent.className || '').toString().toLowerCase();
        if (/(selected|active|checked|chosen|picked)/.test(pc)) return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════
  // CHECK ANSWERED — Phát hiện câu đã làm
  // ═══════════════════════════════════════════════════
  static isAnswered(q) {
    try {
      if (q.type === 'truefalse') {
        return Scraper._isElSelected(q.tfEls.trueEl) || Scraper._isElSelected(q.tfEls.falseEl);
      }
      if (q.type === 'choice') {
        return q.choices.some((c) => Scraper._isElSelected(c.el) || Scraper._isElSelected(c.inputEl));
      }
      if (q.type === 'fill' && q.inputEl) {
        return q.inputEl.value && q.inputEl.value.trim().length > 0;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════
  // MATHJAX & LATEX EXTRACTION
  // ═══════════════════════════════════════════════════
  static _extractMathJax(el) {
    if (!CONFIG.ENABLE_MATHJAX || !el) return '';
    const results = [];

    el.querySelectorAll('script[type^="math/tex"]').forEach((s) => {
      const tex = s.textContent.trim();
      if (tex) results.push(`$${tex}$`);
    });

    el.querySelectorAll('mjx-container, math').forEach((m) => {
      const tex = m.getAttribute('data-latex') || m.getAttribute('aria-label') || m.textContent;
      if (tex) results.push(`$${tex.trim()}$`);
    });

    const text = el.innerText || '';
    const inlineMatches = text.match(/\\\((.*?)\\\)/g) || [];
    const blockMatches = text.match(/\\\[(.*?)\\\]/g) || [];
    [...inlineMatches, ...blockMatches].forEach((m) => {
      if (!results.includes(m)) results.push(m);
    });

    el.querySelectorAll('.MathJax, .MathJax_Preview, .math').forEach((m) => {
      const tex = m.getAttribute('data-latex') || m.textContent.trim();
      if (tex && !results.includes(`$${tex}$`)) results.push(`$${tex}$`);
    });

    return results.join(' ');
  }

  // ═══════════════════════════════════════════════════
  // SCAN ALL
  // ═══════════════════════════════════════════════════
  static scanAll() {
    const out = [];
    const seen = new Set();

    const leafs = document.querySelectorAll(
      'div, span, p, h1, h2, h3, h4, label, strong, b, em, i'
    );

    leafs.forEach((leaf) => {
      if (leaf.children.length > 0) return;
      const txt = (leaf.innerText || '').trim();
      if (!/^(Câu|Bài|Question)\s*\d+/i.test(txt)) return;

      let node = leaf.parentElement;
      let depth = 0;

      while (node && depth < 6) {
        const t = node.innerText || '';
        if (t.length < 30 || t.length > 5000) {
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
      document.querySelectorAll('div').forEach((el) => {
        if (el.innerText.length > 5000 || el.innerText.length < 20) return;
        if (seen.has(el)) return;

        const hasInput = el.querySelector(
          'input[type="text"], input:not([type]), textarea'
        ) !== null;
        const hasTF = /Đúng/i.test(el.innerText) && /Sai/i.test(el.innerText);
        const hasABCD = /A[\.\)]/.test(el.innerText) && /B[\.\)]/.test(el.innerText);

        if (hasInput || hasTF || hasABCD) {
          const q = Scraper.parseBlock(el);
          if (q) {
            seen.add(el);
            out.push(q);
          }
        }
      });
    }

    logger.info(`Scraper: tìm thấy ${out.length} câu hỏi`);
    return out;
  }

  // ═══════════════════════════════════════════════════
  // PARSE BLOCK
  // ═══════════════════════════════════════════════════
  static parseBlock(block) {
    try {
      const mathText = Scraper._extractMathJax(block);
      const rawText = block.innerText.replace(/\s+/g, ' ').trim();
      const fullText = mathText ? `${rawText}\n\n[MathJax: ${mathText}]` : rawText;

      let text = fullText;
      const m = rawText.match(/([A-D][\.\)]\s*.*)/);
      if (m) text = fullText.substring(0, m.index + (mathText ? mathText.length : 0)).trim();

      if (!text || text.length < 5) return null;

      // TRUE/FALSE
      const tfEls = { trueEl: null, falseEl: null, type: 'unknown' };

      block.querySelectorAll('label, .answer-item, .choice, .option').forEach((el) => {
        const t = Scraper._normVN(el.innerText || '');
        if (t === 'dung' || t === 'true') {
          tfEls.trueEl = el.querySelector('input') || el;
          tfEls.type = 'input';
        }
        if (t === 'sai' || t === 'false') {
          tfEls.falseEl = el.querySelector('input') || el;
          tfEls.type = 'input';
        }
      });

      if (!tfEls.trueEl || !tfEls.falseEl) {
        block.querySelectorAll('div, span, button, [role="button"], a').forEach((el) => {
          if (el.children.length > 1) return;
          const t = Scraper._normVN(el.innerText || '');
          if (t === 'dung' || t === 'true') { tfEls.trueEl = el; tfEls.type = 'div'; }
          if (t === 'sai' || t === 'false') { tfEls.falseEl = el; tfEls.type = 'div'; }
        });
      }

      if (tfEls.trueEl && tfEls.falseEl) {
        return { el: block, type: 'truefalse', text, tfEls };
      }

      // MULTIPLE CHOICE
      const choices = [];
      block.querySelectorAll('div, label, span, li, p').forEach((el) => {
        if (el.children.length > 3) return;
        const t = el.innerText.trim();
        const mm = t.match(/^([A-D])[\.\)]\s*(.*)/);
        if (mm) {
          choices.push({
            letter: mm[1],
            text: mm[2].trim(),
            el: el,
            inputEl: el.querySelector('input[type="radio"]') || el,
          });
        }
      });

      const uniq = [];
      const seenL = new Set();
      choices.forEach((c) => {
        if (!seenL.has(c.letter)) {
          seenL.add(c.letter);
          uniq.push(c);
        }
      });

      if (uniq.length >= 2) {
        return { el: block, type: 'choice', text, choices: uniq };
      }

      // FILL
      const inputEl = block.querySelector(
        'input[type="text"], input:not([type]), input[type="number"], textarea'
      );
      if (inputEl) {
        return { el: block, type: 'fill', text, inputEl };
      }

      return null;
    } catch (err) {
      logger.warn(`Scraper: bỏ qua block lỗi — ${err.message}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════
  // IMAGE EXTRACTION
  // ═══════════════════════════════════════════════════
  static async getImages(container) {
    if (!CONFIG.ENABLE_MULTIMODAL) return [];
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
        const dataUrl = await new Promise((r) => {
          const fr = new FileReader();
          fr.onload = () => r(fr.result);
          fr.readAsDataURL(blob);
        });
        out.push(dataUrl);
      } catch (_) {}
    }
    return out;
  }
}
