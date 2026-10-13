import { CONFIG, PROVIDER_REGISTRY } from '../constants.js';
import { logger } from '../logger.js';

export class APIClient {
  constructor(storage) {
    this.storage = storage;
  }

  // ═══════════════════════════════════════════════════
  // CALL PROVIDER — Multi-provider (từ repo gốc)
  // ═══════════════════════════════════════════════════
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

    // Chọn model: vision nếu có ảnh
    const hasImages = images.length > 0 && CONFIG.ENABLE_MULTIMODAL;
    const model = hasImages && p.visionModel
      ? p.visionModel
      : (this.storage.getModel(providerId) || p.defaultModel);

    // ─── Build body theo từng provider ───
    if (p.isGemini) {
      url = p.baseUrl.replace('{model}', model).replace('{key}', key);
      const parts = [{ text: prompt }];
      images.forEach((img) => {
        parts.push({
          inline_data: {
            mime_type: img.match(/^data:(.*?);/)?.[1] || 'image/jpeg',
            data: img.split(',')[1],
          },
        });
      });
      body = { contents: [{ parts }] };
    } else if (p.isAnthropic) {
      const content = hasImages
        ? [
            { type: 'text', text: prompt },
            ...images.map((i) => ({
              type: 'image',
              source: {
                type: 'base64',
                media_type: i.match(/^data:(.*?);/)?.[1] || 'image/jpeg',
                data: i.split(',')[1],
              },
            })),
          ]
        : prompt;
      body = { model, max_tokens: 2048, messages: [{ role: 'user', content }] };
    } else {
      // OpenAI-compatible
      if (providerId === 'custom') url = this.storage.getCustomUrl();
      const content = hasImages
        ? [
            { type: 'text', text: prompt },
            ...images.map((i) => ({ type: 'image_url', image_url: { url: i } })),
          ]
        : prompt;
      body = { model, messages: [{ role: 'user', content }], temperature: 0.1 };
    }

    logger.info(`Gọi ${p.name} (${model})${hasImages ? ' [vision]' : ''}...`);
    const res = await this._http({ method: 'POST', url, headers, data: body });

    // Parse response
    if (p.isGemini) {
      return res.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    if (p.isAnthropic) {
      return res.content?.[0]?.text || '';
    }
    return res.choices?.[0]?.message?.content || '';
  }

  // ═══════════════════════════════════════════════════
  // GET ANSWER — Multi-Question Sequential fallback
  // ═══════════════════════════════════════════════════
  async getAnswer(question) {
    const prompt = this._buildPrompt(question);
    const images = await Scraper.getImages(question.el);
    const errors = [];

    // Ưu tiên: provider đã chọn → các provider có key khác
    const priority = [this.storage.getSelectedProvider()];
    for (const id of Object.keys(PROVIDER_REGISTRY)) {
      if (id !== this.storage.getSelectedProvider() && this.storage.getKey(id)) {
        priority.push(id);
      }
    }

    for (const id of priority) {
      // Retry logic
      for (let attempt = 0; attempt < CONFIG.RETRIES; attempt++) {
        try {
          const txt = await this.callProvider(id, prompt, images);
          if (txt && txt.trim()) return txt.trim();
        } catch (err) {
          const isLastAttempt = attempt === CONFIG.RETRIES - 1;
          if (isLastAttempt) {
            errors.push(`${PROVIDER_REGISTRY[id].name}: ${err.message}`);
            logger.warn(`${PROVIDER_REGISTRY[id].name} fail → thử provider kế tiếp...`);
          } else {
            logger.warn(`${PROVIDER_REGISTRY[id].name} retry ${attempt + 1}/${CONFIG.RETRIES}...`);
            await new Promise((r) => setTimeout(r, CONFIG.RETRY_DELAY_MS));
          }
        }
      }
    }

    throw new Error('Tất cả provider đều lỗi:\n' + errors.join('\n'));
  }

  // ═══════════════════════════════════════════════════
  // BUILD PROMPT — Logic-First Reasoning (từ repo gốc)
  // ═══════════════════════════════════════════════════
  _buildPrompt(q) {
    const lines = [];

    lines.push('Bạn là trợ lý giải bài tập chuyên nghiệp.');
    lines.push('');

    if (CONFIG.THINK_BEFORE_ANSWER) {
      lines.push('QUY TRÌNH:');
      lines.push('1. Đọc kỹ đề bài');
      lines.push('2. Suy luận từng bước (nếu là toán)');
      lines.push('3. Đưa ra đáp án cuối cùng');
      lines.push('');
      lines.push('ĐỊNH DẠNG TRẢ LỜI:');
      lines.push('[Suy luận ngắn 1-2 câu]');
      lines.push('---');
      lines.push('[Đáp án cuối cùng]');
    } else {
      lines.push('Trả lời CỰC NGẮN, chỉ đưa đáp án cuối cùng.');
    }

    lines.push('');
    lines.push('Loại câu hỏi: ' + q.type);
    lines.push('Nội dung: ' + q.text);

    if (q.type === 'truefalse') {
      lines.push('');
      lines.push('→ Chỉ trả lời "Đúng" hoặc "Sai" (không thêm gì khác).');
    }
    if (q.type === 'fill') {
      lines.push('');
      lines.push('→ Chỉ trả lời giá trị số/chuỗi cần điền.');
      lines.push('→ Dùng dấu phẩy cho số thập phân (VD: 3,14 thay vì 3.14).');
      lines.push('→ Nếu là phân số, viết dạng a/b (VD: 3/2).');
    }
    if (q.type === 'choice') {
      lines.push('');
      lines.push('→ Chỉ trả lời 1 chữ cái A/B/C/D.');
    }

    return lines.join('\n');
  }

  // ═══════════════════════════════════════════════════
  // HTTP WRAPPER
  // ═══════════════════════════════════════════════════
  _http({ method, url, headers, data, timeout = CONFIG.PROXY_TIMEOUT_MS }) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        data: data ? JSON.stringify(data) : undefined,
        timeout,
        onload: (res) => {
          try {
            if (res.status >= 200 && res.status < 300) {
              resolve(JSON.parse(res.responseText));
            } else {
              let detail = res.responseText.slice(0, 300);
              try {
                const parsed = JSON.parse(res.responseText);
                detail = parsed.error?.message || detail;
              } catch (_) {}
              reject(new Error(`HTTP ${res.status}: ${detail}`));
            }
          } catch (e) {
            reject(e);
          }
        },
        onerror: () => reject(new Error('Lỗi mạng')),
        ontimeout: () => reject(new Error('Timeout')),
      });
    });
  }
}
