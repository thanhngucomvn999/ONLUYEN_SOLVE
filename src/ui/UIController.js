import { CONFIG } from '../constants.js';
import { logger } from '../logger.js';

export class UIController {
  static _dispatchFullClick(el) {
    if (!el) return false;
    try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch (_) {}

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

    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
      const ev = type.startsWith('pointer')
        ? new PointerEvent(type, { ...opts, pointerId: 1, pointerType: 'mouse' })
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
    if (/(selected|active|checked|chosen|picked)/.test(cls)) return true;
    if (el.getAttribute('aria-checked') === 'true') return true;
    if (el.getAttribute('aria-selected') === 'true') return true;

    try {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'rgb(255, 255, 255)') {
        return true;
      }
    } catch (_) {}

    const parent = el.closest('div, label, li');
    if (parent) {
      const pc = (parent.className || '').toString().toLowerCase();
      if (/(selected|active|checked|chosen|picked)/.test(pc)) return true;
    }

    return false;
  }

  static async selectTrueFalse(q, answer) {
    const isTrue = Scraper._normVN(answer) === 'dung';
    const target = isTrue ? q.tfEls.trueEl : q.tfEls.falseEl;

    if (!target) {
      logger.warn('Không tìm thấy element Đúng/Sai');
      return false;
    }

    UIController._dispatchFullClick(target);
    await UIController._sleep(150);

    if (!UIController.isSelected(target)) {
      const alt = target.closest('label, .answer-item, .choice, div') || target.parentElement;
      if (alt && alt !== target) {
        UIController._dispatchFullClick(alt);
        await UIController._sleep(150);
      }
    }

    if (!UIController.isSelected(target) && q.tfEls.type === 'input') {
      const input = target.querySelector('input') || target;
      if (input && input.tagName === 'INPUT') {
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    return UIController.isSelected(target);
  }

  static async selectChoice(q, answer) {
    const upper = (answer || '').toUpperCase();
    const c = q.choices.find((x) => x.letter === upper) || q.choices[0];
    if (!c) return false;

    UIController._dispatchFullClick(c.el);
    await UIController._sleep(150);

    if (!UIController.isSelected(c.el)) {
      const alt = c.el.closest('label, .answer-item, .choice, li') || c.el.parentElement;
      if (alt && alt !== c.el) {
        UIController._dispatchFullClick(alt);
        await UIController._sleep(150);
      }
    }

    if (!UIController.isSelected(c.el) && c.inputEl && c.inputEl.tagName === 'INPUT') {
      c.inputEl.checked = true;
      c.inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    return UIController.isSelected(c.el);
  }

  static async typeInto(input, text) {
    if (!input || !text) return false;

    input.focus();
    input.click();
    await UIController._sleep(80);

    const proto = input.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;

    setter.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    if (CONFIG.INSTANT_MODE) {
      setter.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      for (const ch of text) {
        setter.call(input, input.value + ch);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }));
        const delay = CONFIG.HUMAN_DELAY_MIN +
          Math.random() * (CONFIG.HUMAN_DELAY_MAX - CONFIG.HUMAN_DELAY_MIN);
        await UIController._sleep(delay);
      }
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    input.blur();
    return true;
  }

  static smartReset() {
    if (!CONFIG.ENABLE_SMART_RESET) return;
    try {
      document.querySelectorAll('input[type="text"], input[type="number"], input:not([type]), textarea').forEach((input) => {
        const proto = input.tagName === 'TEXTAREA'
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((input) => {
        input.checked = false;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      document.querySelectorAll('[class*="selected"], [class*="active"], [class*="checked"]').forEach((el) => {
        el.classList.remove('selected', 'active', 'checked', 'chosen', 'picked');
      });

      logger.info('🔄 Smart Reset: đã reset tất cả input');
    } catch (err) {
      logger.warn('Smart Reset lỗi: ' + err.message);
    }
  }

  static _sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
