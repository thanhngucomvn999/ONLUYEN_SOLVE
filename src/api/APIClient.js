import { CONFIG, PROVIDER_REGISTRY } from '../constants.js';
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
