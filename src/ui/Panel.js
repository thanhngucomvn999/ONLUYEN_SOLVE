import { PROVIDER_REGISTRY } from '../constants.js';
import { logger } from '../logger.js';
import { Scraper } from '../scraper/Scraper.js';

export class Panel {
  static build(solver, storage) {
    if (document.getElementById('olv-panel')) return;

    const style = document.createElement('style');
    style.textContent = [
      '#olv-panel{position:fixed;top:16px;right:16px;z-index:999999;width:420px;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
      'background:linear-gradient(135deg,#1e1e2e 0%,#181825 100%);',
      'color:#cdd6f4;border-radius:14px;overflow:hidden;',
      'box-shadow:0 20px 60px rgba(0,0,0,.55),0 0 0 1px rgba(137,180,250,.15);',
      'display:flex;flex-direction:column;max-height:92vh;',
      'transition:transform .25s cubic-bezier(.4,0,.2,1)}',
      '#olv-panel.mini{transform:translateY(calc(-100% + 48px))}',
      '#olv-panel .head{padding:12px 16px;',
      'background:linear-gradient(135deg,#89b4fa 0%,#cba6f7 100%);',
      'display:flex;justify-content:space-between;align-items:center;',
      'cursor:move;flex-shrink:0;user-select:none}',
      '#olv-panel .head b{color:#11111b;font-size:13px;font-weight:700;letter-spacing:.3px}',
      '#olv-panel .head .actions{display:flex;gap:6px}',
      '#olv-panel .head .actions span{cursor:pointer;color:#11111b;font-weight:700;',
      'font-size:14px;padding:2px 6px;border-radius:4px;transition:background .15s}',
      '#olv-panel .head .actions span:hover{background:rgba(17,17,27,.15)}',
      '#olv-panel .body{padding:14px 16px;overflow-y:auto;flex:1;font-size:12px}',
      '#olv-panel .body::-webkit-scrollbar{width:6px}',
      '#olv-panel .body::-webkit-scrollbar-thumb{background:#45475a;border-radius:3px}',
      '#olv-panel .row{display:flex;gap:6px;margin-bottom:6px}',
      '#olv-panel button{flex:1;background:#313244;color:#cdd6f4;border:1px solid #45475a;',
      'padding:8px 10px;border-radius:8px;cursor:pointer;font-size:11px;',
      'font-weight:600;transition:all .15s;font-family:inherit;white-space:nowrap}',
      '#olv-panel button:hover{background:#45475a;transform:translateY(-1px)}',
      '#olv-panel button:active{transform:translateY(0)}',
      '#olv-panel button.go{background:linear-gradient(135deg,#a6e3a1 0%,#94e2d5 100%);',
      'color:#11111b;border:0;font-weight:700}',
      '#olv-panel button.go:hover{box-shadow:0 4px 12px rgba(166,227,161,.35)}',
      '#olv-panel button.stop{background:linear-gradient(135deg,#f38ba8 0%,#eba0ac 100%);',
      'color:#11111b;border:0;font-weight:700}',
      '#olv-panel button.debug{background:#45475a;color:#f9e2af}',
      '#olv-panel button.test{background:#45475a;color:#89b4fa}',
      '#olv-panel label{color:#89b4fa;font-size:10px;font-weight:700;',
      'display:block;margin:10px 0 4px;text-transform:uppercase;letter-spacing:.5px}',
      '#olv-panel input,#olv-panel select{width:100%;box-sizing:border-box;',
      'padding:8px 10px;background:#11111b;color:#cdd6f4;',
      'border:1px solid #313244;border-radius:8px;font-size:11px;',
      'font-family:inherit;transition:border-color .15s}',
      '#olv-panel input:focus,#olv-panel select:focus{outline:0;border-color:#89b4fa}',
      '#olv-panel .badge{display:inline-block;padding:2px 8px;border-radius:10px;',
      'font-size:9px;font-weight:700;margin-left:6px;text-transform:uppercase;letter-spacing:.4px}',
      '#olv-panel .badge.free{background:#a6e3a1;color:#11111b}',
      '#olv-panel .badge.paid{background:#89b4fa;color:#11111b}',
      '#olv-panel .badge.custom{background:#f9e2af;color:#11111b}',
      '#olv-panel .divider{height:1px;background:linear-gradient(90deg,transparent,#45475a,transparent);margin:12px 0}',
      '#olv-log{max-height:160px;overflow:auto;background:#11111b;padding:10px;',
      'border-radius:8px;margin-top:8px;font-size:10px;line-height:1.55;',
      'font-family:"JetBrains Mono","Consolas",monospace;color:#a6adc8;',
      'border:1px solid #313244}',
      '#olv-log::-webkit-scrollbar{width:6px}',
      '#olv-log::-webkit-scrollbar-thumb{background:#45475a;border-radius:3px}',
      '#olv-panel .status{display:flex;align-items:center;gap:6px;',
      'padding:6px 10px;background:#11111b;border-radius:8px;',
      'font-size:10px;color:#a6adc8;margin-bottom:10px;border:1px solid #313244}',
      '#olv-panel .dot{width:7px;height:7px;border-radius:50%;background:#f9e2af;',
      'box-shadow:0 0 8px currentColor;animation:pulse 2s infinite}',
      '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}',
    ].join('\n');
    document.head.appendChild(style);

    const p = document.createElement('div');
    p.id = 'olv-panel';

    const html = [
      '<div class="head">',
      '<b>ONLUYEN Solver</b>',
      '<div class="actions">',
      '<span id="olv-mini" title="Thu nhỏ">-</span>',
      '<span id="olv-toggle" title="Ẩn/Hiện">v</span>',
      '</div>',
      '</div>',
      '<div class="body" id="olv-body">',
      '<div class="status"><span class="dot"></span><span id="olv-status">Sẵn sàng</span></div>',
      '<div class="row">',
      '<button id="olv-start" class="go">▶ Giải tất cả</button>',
      '<button id="olv-once">⚡ 1 câu</button>',
      '</div>',
      '<div class="row">',
      '<button id="olv-debug" class="debug">🔍 Quét thử</button>',
      '<button id="olv-stop" class="stop">■ Dừng</button>',
      '</div>',
      '<div class="divider"></div>',
      '<label>🔌 API Provider <span id="olv-badge" class="badge free">Free</span></label>',
      '<select id="olv-provider">',
      '<optgroup label="Miễn phí">',
      '<option value="groq">Groq - Llama 3.3 70B</option>',
      '<option value="gemini">Google Gemini - Flash 2.0</option>',
      '<option value="cerebras">Cerebras - Llama 3.3 70B</option>',
      '<option value="openrouter">OpenRouter - Free models</option>',
      '</optgroup>',
      '<optgroup label="Trả phí">',
      '<option value="openai">OpenAI - GPT-4o / 4.1</option>',
      '<option value="anthropic">Anthropic - Claude Sonnet 4</option>',
      '<option value="deepseek">DeepSeek - V3 / R1</option>',
      '</optgroup>',
      '<optgroup label="Custom">',
      '<option value="custom">Custom (OpenAI-compatible)</option>',
      '</optgroup>',
      '</select>',
      '<label>🔑 API Key</label>',
      '<input id="olv-key" type="password" placeholder="Dán API key...">',
      '<label>📦 Model</label>',
      '<select id="olv-model"></select>',
      '<div id="olv-custom-wrap" style="display:none">',
      '<label>🌐 Custom Base URL</label>',
      '<input id="olv-custom-url" placeholder="https://...">',
      '<label>📦 Custom Model</label>',
      '<input id="olv-custom-model" placeholder="model-name">',
      '</div>',
      '<div class="row" style="margin-top:10px">',
      '<button id="olv-test" class="test">🧪 Kiểm tra</button>',
      '<button id="olv-save">💾 Lưu Settings</button>',
      '</div>',
      '<button id="olv-clear" style="width:100%">🗑 Xoá cache</button>',
      '<div class="divider"></div>',
      '<div id="olv-log"></div>',
      '</div>',
    ].join('');
    p.innerHTML = html;
    document.body.appendChild(p);

    const provSel = document.getElementById('olv-provider');
    const keyInput = document.getElementById('olv-key');
    const modelSel = document.getElementById('olv-model');
    const badge = document.getElementById('olv-badge');
    const customWrap = document.getElementById('olv-custom-wrap');
    const statusEl = document.getElementById('olv-status');

    function setStatus(msg) { statusEl.textContent = msg; }

    function refreshProviderUI() {
      const id = provSel.value;
      const pr = PROVIDER_REGISTRY[id];
      badge.className = 'badge ' + pr.category;
      badge.textContent = pr.category === 'free' ? 'Free'
        : pr.category === 'paid' ? 'Paid' : 'Custom';
      keyInput.value = storage.getKey(id);
      modelSel.innerHTML = '';

      if (id === 'custom') {
        modelSel.style.display = 'none';
        customWrap.style.display = 'block';
        document.getElementById('olv-custom-url').value = storage.getCustomUrl();
        document.getElementById('olv-custom-model').value = storage.getCustomModel();
      } else {
        modelSel.style.display = 'block';
        customWrap.style.display = 'none';
        pr.models.forEach(function (m) {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          if (storage.getModel(id) === m) opt.selected = true;
          modelSel.appendChild(opt);
        });
      }
    }

    provSel.onchange = refreshProviderUI;
    provSel.value = storage.getSelectedProvider();
    refreshProviderUI();

    document.getElementById('olv-save').onclick = function () {
      const id = provSel.value;
      storage.setSelectedProvider(id);
      storage.setKey(id, keyInput.value.trim());
      if (id === 'custom') {
        storage.setCustomUrl(document.getElementById('olv-custom-url').value.trim());
        storage.setCustomModel(document.getElementById('olv-custom-model').value.trim());
      } else {
        storage.setModel(id, modelSel.value);
      }
      logger.info('Đã lưu. Provider: ' + PROVIDER_REGISTRY[id].name);
      setStatus('Đã lưu Settings');
    };

    document.getElementById('olv-test').onclick = async function () {
      const id = provSel.value;
      setStatus('Đang test ' + PROVIDER_REGISTRY[id].name + '...');
      logger.info('Test ' + PROVIDER_REGISTRY[id].name + '...');
      try {
        const oldKey = storage.getKey(id);
        storage.setKey(id, keyInput.value.trim());
        if (id === 'custom') {
          storage.setCustomUrl(document.getElementById('olv-custom-url').value.trim());
          storage.setCustomModel(document.getElementById('olv-custom-model').value.trim());
        } else {
          storage.setModel(id, modelSel.value);
        }
        const txt = await solver.api.callProvider(id, 'Trả lời đúng 1 từ: OK');
        storage.setKey(id, oldKey);
        logger.info('OK! Phản hồi: "' + txt.slice(0, 50) + '"');
        setStatus('Kết nối OK');
      } catch (e) {
        logger.error(e.message);
        setStatus('Lỗi kết nối');
      }
    };

    document.getElementById('olv-clear').onclick = function () {
      storage.clearCache();
      logger.info('Đã xoá cache');
      setStatus('Đã xoá cache');
    };

    document.getElementById('olv-start').onclick = function () {
      setStatus('Đang giải...');
      solver.solveAll().then(function () { setStatus('Hoàn tất'); });
    };

    document.getElementById('olv-once').onclick = async function () {
      const l = Scraper.scanAll();
      const cache = storage.getCache();
      const q = l.find(function (x) {
        return !cache[storage.hashQ(x.text + '|' + x.type)];
      });
      if (q) await solver.solveOne(q);
      else logger.info('Không còn câu chưa giải');
    };

    document.getElementById('olv-debug').onclick = function () {
      const l = Scraper.scanAll();
      logger.info('Quét thử: ' + l.length + ' câu');
      l.forEach(function (q, i) {
        logger.info('  ' + (i + 1) + '. [' + q.type + '] ' + q.text.substring(0, 50) + '...');
      });
    };

    document.getElementById('olv-stop').onclick = function () {
      solver.stop();
      setStatus('Đã dừng');
    };

    document.getElementById('olv-toggle').onclick = function () {
      const b = document.getElementById('olv-body');
      b.style.display = b.style.display === 'none' ? 'block' : 'none';
    };

    document.getElementById('olv-mini').onclick = function () {
      p.classList.toggle('mini');
    };

    const head = p.querySelector('.head');
    let dx, dy, drag = false;
    head.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'SPAN') return;
      drag = true;
      dx = e.clientX - p.offsetLeft;
      dy = e.clientY - p.offsetTop;
    });
    document.addEventListener('mousemove', function (e) {
      if (!drag) return;
      p.style.left = (e.clientX - dx) + 'px';
      p.style.top = (e.clientY - dy) + 'px';
      p.style.right = 'auto';
    });
    document.addEventListener('mouseup', function () { drag = false; });
  }
}
