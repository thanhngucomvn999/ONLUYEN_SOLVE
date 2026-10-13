import { CONFIG } from '../constants.js';

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
