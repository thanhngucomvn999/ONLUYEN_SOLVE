import { PROVIDER_REGISTRY } from '../constants.js';
import { logger } from '../logger.js';
import { Scraper } from '../scraper/Scraper.js';

export class Panel {
  static build(solver, storage) {
    if (document.getElementById('olv-panel')) return;

    // ═══════════════════════════════════════════════════
    // INJECT CSS
    // ═══════════════════════════════════════════════════
    const style = document.createElement('style');
    style.textContent = `
      #olv-panel{position:fixed;top:16px;right:16px;z-index:2147483647;width:440px;
        font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
        background:#181825;color:#cdd6f4;border-radius:14px;overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 0 1px rgba(137,180,250,.2);
        display:flex;flex-direction:column;max-height:92vh;
        pointer-events:auto;user-select:text;
        transition:transform .3s cubic-bezier(.4,0,.2,1)}
      #olv-panel.mini{transform:translateY(calc(-100% + 52px))}
      #olv-panel *{box-sizing:border-box}
      #olv-panel .head{padding:12px 16px;
        background:linear-gradient(135deg,#89b4fa 0%,#cba6f7 100%);
        display:flex;justify-content:space-between;align-items:center;
        cursor:move;flex-shrink:0;user-select:none}
      #olv-panel .head .title{display:flex;align-items:center;gap:8px}
      #olv-panel .head b{color:#11111b;font-size:13px;font-weight:700;letter-spacing:.3px}
      #olv-panel .head .dot{width:8px;height:8px;border-radius:50%;background:#f9e2af;
        box-shadow:0 0 8px currentColor;animation:pulse 2s infinite}
      #olv-panel .head .dot.ok{background:#a6e3a1}
      #olv-panel .head .dot.err{background:#f38ba8}
      #olv-panel .head .dot.busy{background:#f9e2af}
      #olv-panel .head .actions{display:flex;gap:4px}
      #olv-panel .head .actions span{cursor:pointer;color:#11111b;font-weight:700;
        font-size:14px;padding:2px 7px;border-radius:5px;transition:background .15s;
        line-height:1;user-select:none}
      #olv-panel .head .actions span:hover{background:rgba(17,17,27,.2)}
      #olv-panel .tabs{display:flex;background:#11111b;border-bottom:1px solid #313244;flex-shrink:0}
      #olv-panel .tab{flex:1;padding:10px 12px;text-align:center;font-size:11px;
        font-weight:600;color:#7f849c;cursor:pointer;transition:all .15s;
        border-bottom:2px solid transparent;user-select:none}
      #olv-panel .tab:hover{color:#cdd6f4;background:#1e1e2e}
      #olv-panel .tab.active{color:#89b4fa;border-bottom-color:#89b4fa;background:#1e1e2e}
      #olv-panel .body{overflow-y:auto;flex:1;font-size:12px;display:none}
      #olv-panel .body.active{display:block}
      #olv-panel .body::-webkit-scrollbar{width:8px}
      #olv-panel .body::-webkit-scrollbar-thumb{background:#45475a;border-radius:4px}
      #olv-panel .section{padding:14px 16px}
      #olv-panel .row{display:flex;gap:6px;margin-bottom:6px}
      #olv-panel button{flex:1;background:#313244;color:#cdd6f4;border:1px solid #45475a;
        padding:10px 12px;border-radius:8px;cursor:pointer;font-size:11px;
        font-weight:600;transition:all .15s;font-family:inherit;white-space:nowrap;
        display:flex;align-items:center;justify-content:center;gap:5px;
        pointer-events:auto !important}
      #olv-panel button:hover{background:#45475a;transform:translateY(-1px)}
      #olv-panel button:active{transform:translateY(0)}
      #olv-panel button:disabled{opacity:.4;cursor:not-allowed;transform:none}
      #olv-panel button.go{background:linear-gradient(135deg,#a6e3a1 0%,#94e2d5 100%);
        color:#11111b;border:0;font-weight:700}
      #olv-panel button.go:hover{box-shadow:0 4px 14px rgba(166,227,161,.4)}
      #olv-panel button.stop{background:linear-gradient(135deg,#f38ba8 0%,#eba0ac 100%);
        color:#11111b;border:0;font-weight:700}
      #olv-panel button.debug{color:#f9e2af}
      #olv-panel button.test{color:#89b4fa}
      #olv-panel .mini-btn{flex:0 0 auto;padding:10px 11px}
      #olv-panel label{color:#89b4fa;font-size:10px;font-weight:700;
        display:flex;justify-content:space-between;align-items:center;
        margin:12px 0 5px;text-transform:uppercase;letter-spacing:.6px}
      #olv-panel label .hint{color:#7f849c;font-weight:500;text-transform:none;
        font-size:9px;letter-spacing:0}
      #olv-panel input,#olv-panel select{width:100%;
        padding:9px 11px;background:#11111b;color:#cdd6f4;
        border:1px solid #313244;border-radius:8px;font-size:11px;
        font-family:inherit;transition:border-color .15s;pointer-events:auto}
      #olv-panel input:focus,#olv-panel select:focus{outline:0;border-color:#89b4fa;
        box-shadow:0 0 0 3px rgba(137,180,250,.1)}
      #olv-panel .input-group{display:flex;gap:4px}
      #olv-panel .input-group input{flex:1}
      #olv-panel .badge{display:inline-block;padding:2px 8px;border-radius:10px;
        font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
      #olv-panel .badge.free{background:#a6e3a1;color:#11111b}
      #olv-panel .badge.paid{background:#89b4fa;color:#11111b}
      #olv-panel .badge.custom{background:#f9e2af;color:#11111b}
      #olv-panel .status-bar{display:flex;align-items:center;gap:8px;
        padding:10px 12px;background:#11111b;border-radius:8px;
        font-size:11px;color:#a6adc8;margin-bottom:10px;
        border:1px solid #313244}
      #olv-panel .status-bar .info{flex:1;min-width:0;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap}
      #olv-panel .status-bar .time{color:#7f849c;font-size:10px;font-family:monospace}
      #olv-panel .divider{height:1px;
        background:linear-gradient(90deg,transparent,#45475a,transparent);
        margin:12px 0}
      #olv-panel .custom-wrap{display:none}
      #olv-panel .custom-wrap.active{display:block}
      #olv-log{max-height:260px;overflow:auto;background:#11111b;padding:10px 12px;
        border-radius:8px;font-size:10px;line-height:1.6;
        font-family:"JetBrains Mono","Consolas",monospace;color:#a6adc8;
        border:1px solid #313244}
      #olv-log::-webkit-scrollbar{width:6px}
      #olv-log::-webkit-scrollbar-thumb{background:#45475a;border-radius:3px}
      #olv-log .log-line{padding:2px 0;border-bottom:1px solid rgba(69,71,90,.3)}
      #olv-log .log-time{color:#7f849c;margin-right:6px}
      #olv-log .log-info{color:#89b4fa}
      #olv-log .log-warn{color:#f9e2af}
      #olv-log .log-error{color:#f38ba8}
      #olv-log .log-success{color:#a6e3a1}
      #olv-panel .footer{padding:8px 16px 14px;color:#7f849c;font-size:10px;
        text-align:center;border-top:1px solid #313244;display:flex;
        justify-content:space-between;align-items:center}
      #olv-panel .footer a{color:#89b4fa;text-decoration:none}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      .olv-spin{animation:spin 1s linear infinite;display:inline-block}
    `;
    document.head.appendChild(style);

    // ═══════════════════════════════════════════════════
    // BUILD HTML
    // ═══════════════════════════════════════════════════
    const p = document.createElement('div');
    p.id = 'olv-panel';
    p.innerHTML = `
      <div class="head">
        <div class="title">
          <span class="dot ok" id="olv-dot"></span>
          <b>ONLUYEN Solver v<span id="olv-ver">?</span></b>
        </div>
        <div class="actions">
          <span id="olv-mini" title="Thu nhỏ">−</span>
          <span id="olv-toggle" title="Ẩn/Hiện">▼</span>
        </div>
      </div>

      <div class="tabs">
        <div class="tab active" data-tab="actions">⚡ Hành động</div>
        <div class="tab" data-tab="settings">⚙ Cài đặt</div>
        <div class="tab" data-tab="logs">📋 Log</div>
      </div>

      <div class="body active" id="olv-tab-actions">
        <div class="section">
          <div class="status-bar">
            <span class="info" id="olv-status">Sẵn sàng</span>
            <span class="time" id="olv-time">—</span>
          </div>
          <div class="row">
            <button id="olv-start" class="go">▶ Giải tất cả</button>
            <button id="olv-once">⚡ 1 câu</button>
          </div>
          <div class="row">
            <button id="olv-debug" class="debug">🔍 Quét thử</button>
            <button id="olv-stop" class="stop">■ Dừng</button>
          </div>
          <div class="divider"></div>
          <label>📊 Thống kê <span class="hint" id="olv-stats-hint">0 cache</span></label>
          <div class="row">
            <button id="olv-clear">🗑 Xoá cache</button>
            <button id="olv-export">📤 Export log</button>
          </div>
        </div>
      </div>

      <div class="body" id="olv-tab-settings">
        <div class="section">
          <label>
            🔌 API Provider
            <span class="badge free" id="olv-badge">Free</span>
          </label>
          <select id="olv-provider">
            <optgroup label="🟢 Miễn phí">
              <option value="groq">Groq — Llama 3.3 70B</option>
              <option value="gemini">Google Gemini — Flash 2.0</option>
              <option value="cerebras">Cerebras — Llama 3.3 70B</option>
              <option value="openrouter">OpenRouter — Free models</option>
            </optgroup>
            <optgroup label="🔵 Trả phí">
              <option value="openai">OpenAI — GPT-4o / 4.1</option>
              <option value="anthropic">Anthropic — Claude Sonnet 4</option>
              <option value="deepseek">DeepSeek — V3 / R1</option>
            </optgroup>
            <optgroup label="⚪ Custom">
              <option value="custom">Custom (OpenAI-compatible)</option>
            </optgroup>
          </select>

          <label>
            🔑 API Key
            <span class="hint"><a href="#" id="olv-get-key" style="color:#89b4fa;text-decoration:none">Lấy key →</a></span>
          </label>
          <div class="input-group">
            <input id="olv-key" type="password" placeholder="Dán API key...">
            <button id="olv-toggle-key" class="mini-btn" title="Hiện/Ẩn">👁</button>
          </div>

          <label>
            📦 Model
            <span class="hint"><a href="#" id="olv-refresh-models" style="color:#89b4fa;text-decoration:none">⟳ Refresh</a></span>
          </label>
          <select id="olv-model"></select>

          <div class="custom-wrap" id="olv-custom-wrap">
            <label>🌐 Custom Base URL</label>
            <input id="olv-custom-url" placeholder="https://...">
            <label>📦 Custom Model</label>
            <input id="olv-custom-model" placeholder="model-name">
          </div>

          <div class="row" style="margin-top:12px">
            <button id="olv-test" class="test">🧪 Test kết nối</button>
            <button id="olv-save">💾 Lưu</button>
          </div>

          <div class="divider"></div>

          <label>🛠 Tuỳ chọn nâng cao</label>
          <div class="row">
            <button id="olv-copy-cfg">📋 Copy config</button>
            <button id="olv-paste-cfg">📥 Paste config</button>
          </div>
        </div>
      </div>

      <div class="body" id="olv-tab-logs">
        <div class="section">
          <div id="olv-log"></div>
          <div class="row" style="margin-top:8px">
            <button id="olv-clear-log">🧹 Xoá log</button>
          </div>
        </div>
        <div class="footer">
          <span>v2.0.0</span>
          <a href="https://github.com/thanhngucomvn999/ONLUYEN_SOLVE" target="_blank">GitHub →</a>
        </div>
      </div>
    `;
    document.body.appendChild(p);

    // ═══════════════════════════════════════════════════
    // HELPER: query element by id
    // ═══════════════════════════════════════════════════
    const $ = (id) => document.getElementById(id);

    const provSel = $('olv-provider');
    const keyInput = $('olv-key');
    const modelSel = $('olv-model');
    const badge = $('olv-badge');
    const customWrap = $('olv-custom-wrap');
    const statusEl = $('olv-status');
    const timeEl = $('olv-time');
    const dotEl = $('olv-dot');
    const statsHint = $('olv-stats-hint');

    function setStatus(msg, type) {
      statusEl.textContent = msg;
      dotEl.className = 'dot ' + (type === 'ok' ? 'ok' : type === 'err' ? 'err' : type === 'busy' ? 'busy' : '');
    }

    function updateStats() {
      try {
        const cache = storage.getCache();
        statsHint.textContent = Object.keys(cache).length + ' cache';
      } catch (_) {}
    }

    // ═══════════════════════════════════════════════════
    // TAB SWITCH (event delegation)
    // ═══════════════════════════════════════════════════
    p.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        p.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        p.querySelectorAll('.body').forEach(b => b.classList.remove('active'));
        tab.classList.add('active');
        const body = $('olv-tab-' + tab.dataset.tab);
        if (body) body.classList.add('active');
      });
    });

    // ═══════════════════════════════════════════════════
    // PROVIDER UI
    // ═══════════════════════════════════════════════════
    const KEY_URLS = {
      groq: 'https://console.groq.com/keys',
      gemini: 'https://aistudio.google.com/apikey',
      cerebras: 'https://cloud.cerebras.ai',
      openrouter: 'https://openrouter.ai/keys',
      openai: 'https://platform.openai.com/api-keys',
      anthropic: 'https://console.anthropic.com/settings/keys',
      deepseek: 'https://platform.deepseek.com/api_keys',
      custom: '',
    };

    function refreshProviderUI() {
      const id = provSel.value;
      const pr = PROVIDER_REGISTRY[id];
      if (!pr) return;

      badge.className = 'badge ' + pr.category;
      badge.textContent = pr.category === 'free' ? 'Free' : pr.category === 'paid' ? 'Paid' : 'Custom';
      keyInput.value = storage.getKey(id);
      modelSel.innerHTML = '';

      if (id === 'custom') {
        modelSel.style.display = 'none';
        customWrap.classList.add('active');
        $('olv-custom-url').value = storage.getCustomUrl();
        $('olv-custom-model').value = storage.getCustomModel();
      } else {
        modelSel.style.display = 'block';
        customWrap.classList.remove('active');
        const currentModel = storage.getModel(id);
        pr.models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          opt.textContent = m;
          if (currentModel === m) opt.selected = true;
          modelSel.appendChild(opt);
        });
        if (!modelSel.value && pr.defaultModel) {
          const opt = document.createElement('option');
          opt.value = pr.defaultModel;
          opt.textContent = pr.defaultModel;
          opt.selected = true;
          modelSel.appendChild(opt);
        }
      }
    }

    provSel.addEventListener('change', refreshProviderUI);
    provSel.value = storage.getSelectedProvider();
    refreshProviderUI();

    // ═══════════════════════════════════════════════════
    // EVENT DELEGATION — MAIN HANDLER
    // ═══════════════════════════════════════════════════
    p.addEventListener('click', async (e) => {
      const btn = e.target.closest('button, a[id], span[id]');
      if (!btn) return;
      const id = btn.id;
      if (!id) return;

      console.log('[ONLUYEN] Click:', id);
      e.preventDefault();
      e.stopPropagation();

      try {
        // ─── HEADER ACTIONS ───
        if (id === 'olv-mini') {
          p.classList.toggle('mini');
          return;
        }
        if (id === 'olv-toggle') {
          p.querySelectorAll('.body').forEach(b => b.classList.remove('active'));
          const active = p.querySelector('.tab.active');
          if (active) $('olv-tab-' + active.dataset.tab).classList.add('active');
          return;
        }

        // ─── KEY VISIBILITY ───
        if (id === 'olv-toggle-key') {
          keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
          return;
        }

        // ─── GET KEY LINK ───
        if (id === 'olv-get-key') {
          const url = KEY_URLS[provSel.value];
          if (url) window.open(url, '_blank');
          else logger.warn('Không có link lấy key cho provider này');
          return;
        }

        // ─── REFRESH MODELS ───
        if (id === 'olv-refresh-models') {
          const provId = provSel.value;
          const key = keyInput.value.trim();
          if (provId === 'custom') { logger.warn('Custom không hỗ trợ refresh'); return; }
          if (!key) { setStatus('Cần nhập API key trước', 'err'); return; }
          setStatus('Đang tải model list...', 'busy');
          btn.innerHTML = '<span class="olv-spin">⟳</span> Loading...';
          try {
            const models = await fetchModels(provId, key);
            if (models.length > 0) {
              PROVIDER_REGISTRY[provId].models = models;
              modelSel.innerHTML = '';
              models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                if (storage.getModel(provId) === m) opt.selected = true;
                modelSel.appendChild(opt);
              });
              logger.info(`Đã tải ${models.length} models cho ${PROVIDER_REGISTRY[provId].name}`);
              setStatus(`Đã tải ${models.length} models`, 'ok');
            }
          } catch (err) {
            logger.error('Refresh thất bại: ' + err.message);
            setStatus('Refresh thất bại', 'err');
          }
          btn.textContent = '⟳ Refresh';
          return;
        }

        // ─── SAVE ───
        if (id === 'olv-save') {
          const provId = provSel.value;
          storage.setSelectedProvider(provId);
          storage.setKey(provId, keyInput.value.trim());
          if (provId === 'custom') {
            storage.setCustomUrl($('olv-custom-url').value.trim());
            storage.setCustomModel($('olv-custom-model').value.trim());
          } else if (modelSel.value) {
            storage.setModel(provId, modelSel.value);
          }
          logger.info('💾 Đã lưu. Provider: ' + PROVIDER_REGISTRY[provId].name);
          setStatus('Đã lưu Settings', 'ok');
          return;
        }

        // ─── TEST ───
        if (id === 'olv-test') {
          const provId = provSel.value;
          setStatus('Đang test ' + PROVIDER_REGISTRY[provId].name + '...', 'busy');
          logger.info('🧪 Test ' + PROVIDER_REGISTRY[provId].name + '...');
          const start = performance.now();
          const oldKey = storage.getKey(provId);
          const oldModel = storage.getModel(provId);
          try {
            storage.setKey(provId, keyInput.value.trim());
            if (provId === 'custom') {
              storage.setCustomUrl($('olv-custom-url').value.trim());
              storage.setCustomModel($('olv-custom-model').value.trim());
            } else if (modelSel.value) {
              storage.setModel(provId, modelSel.value);
            }
            const txt = await solver.api.callProvider(provId, 'Reply with exactly: OK');
            const elapsed = Math.round(performance.now() - start);
            storage.setKey(provId, oldKey);
            storage.setModel(provId, oldModel);
            logger.info(`✅ OK! (${elapsed}ms) "${txt.slice(0, 50)}"`);
            setStatus(`✅ OK (${elapsed}ms)`, 'ok');
            timeEl.textContent = elapsed + 'ms';
          } catch (err) {
            const elapsed = Math.round(performance.now() - start);
            storage.setKey(provId, oldKey);
            storage.setModel(provId, oldModel);
            logger.error('❌ ' + err.message);
            setStatus('❌ ' + err.message.slice(0, 50), 'err');
            timeEl.textContent = elapsed + 'ms';
          }
          return;
        }

        // ─── START ───
        if (id === 'olv-start') {
          setStatus('Đang giải...', 'busy');
          try {
            await solver.solveAll();
            setStatus('Hoàn tất', 'ok');
          } catch (err) {
            setStatus('Lỗi: ' + err.message, 'err');
          }
          updateStats();
          return;
        }

        // ─── SOLVE ONCE ───
        if (id === 'olv-once') {
          const l = Scraper.scanAll();
          const cache = storage.getCache();
          const q = l.find(x => !cache[storage.hashQ(x.text + '|' + x.type)]);
          if (q) {
            setStatus('Đang giải 1 câu...', 'busy');
            try { await solver.solveOne(q); setStatus('Đã giải 1 câu', 'ok'); }
            catch (err) { setStatus('Lỗi: ' + err.message, 'err'); }
          } else {
            logger.info('Không còn câu chưa giải');
            setStatus('Hết câu chưa giải', 'ok');
          }
          updateStats();
          return;
        }

        // ─── DEBUG SCAN ───
        if (id === 'olv-debug') {
          const l = Scraper.scanAll();
          logger.info(`🔍 Quét thử: ${l.length} câu`);
          l.forEach((q, i) => logger.info(`  ${i + 1}. [${q.type}] ${q.text.substring(0, 50)}...`));
          setStatus(`Tìm thấy ${l.length} câu`, l.length > 0 ? 'ok' : 'err');
          return;
        }

        // ─── STOP ───
        if (id === 'olv-stop') {
          solver.stop();
          setStatus('Đã dừng', 'ok');
          return;
        }

        // ─── CLEAR CACHE ───
        if (id === 'olv-clear') {
          storage.clearCache();
          logger.info('🗑 Đã xoá cache');
          setStatus('Đã xoá cache', 'ok');
          updateStats();
          return;
        }

        // ─── EXPORT LOG ───
        if (id === 'olv-export') {
          const logs = logger.history.map(h => `[${h.timestamp}] [${h.level}] ${h.messages.join(' ')}`).join('\n');
          const blob = new Blob([logs], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `onluyen-log-${Date.now()}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          logger.info('Đã export log');
          return;
        }

        // ─── CLEAR LOG ───
        if (id === 'olv-clear-log') {
          const box = $('olv-log');
          box.innerHTML = '';
          logger.info('Đã xoá log panel');
          return;
        }

        // ─── COPY CONFIG ───
        if (id === 'olv-copy-cfg') {
          const c = {
            selectedProvider: storage.getSelectedProvider(),
            keys: {}, models: {},
            customBaseUrl: storage.getCustomUrl(),
            customModel: storage.getCustomModel(),
          };
          Object.keys(PROVIDER_REGISTRY).forEach(pid => {
            const k = storage.getKey(pid);
            if (k) c.keys[pid] = k;
            const m = storage.getModel(pid);
            if (m) c.models[pid] = m;
          });
          try {
            await navigator.clipboard.writeText(JSON.stringify(c, null, 2));
            logger.info('📋 Đã copy config');
            setStatus('Đã copy config', 'ok');
          } catch (err) {
            logger.error('Copy lỗi: ' + err.message);
          }
          return;
        }

        // ─── PASTE CONFIG ───
        if (id === 'olv-paste-cfg') {
          try {
            const text = await navigator.clipboard.readText();
            const c = JSON.parse(text);
            if (c.selectedProvider) storage.setSelectedProvider(c.selectedProvider);
            if (c.keys) Object.keys(c.keys).forEach(pid => storage.setKey(pid, c.keys[pid]));
            if (c.models) Object.keys(c.models).forEach(pid => storage.setModel(pid, c.models[pid]));
            if (c.customBaseUrl) storage.setCustomUrl(c.customBaseUrl);
            if (c.customModel) storage.setCustomModel(c.customModel);
            logger.info('📥 Đã paste config');
            setStatus('Đã paste config', 'ok');
            provSel.value = storage.getSelectedProvider();
            refreshProviderUI();
          } catch (err) {
            logger.error('Paste lỗi: ' + err.message);
          }
          return;
        }
      } catch (err) {
        console.error('[ONLUYEN] Handler error for', id, err);
        logger.error('Handler ' + id + ' lỗi: ' + err.message);
      }
    });

    // ═══════════════════════════════════════════════════
    // FETCH MODELS HELPER
    // ═══════════════════════════════════════════════════
    async function fetchModels(provId, key) {
      if (provId === 'groq' || provId === 'openai' || provId === 'deepseek' || provId === 'openrouter' || provId === 'cerebras') {
        const baseUrl = PROVIDER_REGISTRY[provId].baseUrl.replace('/chat/completions', '/models');
        const res = await fetch(baseUrl, { headers: { 'Authorization': 'Bearer ' + key } });
        const data = await res.json();
        return (data.data || []).map(m => m.id).filter(Boolean).sort();
      }
      if (provId === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();
        return (data.models || [])
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));
      }
      return [];
    }

    // ═══════════════════════════════════════════════════
    // DRAG HEADER
    // ═══════════════════════════════════════════════════
    const head = p.querySelector('.head');
    let dx = 0, dy = 0, drag = false;
    head.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'SPAN') return;
      drag = true;
      dx = e.clientX - p.offsetLeft;
      dy = e.clientY - p.offsetTop;
    });
    document.addEventListener('mousemove', (e) => {
      if (!drag) return;
      p.style.left = (e.clientX - dx) + 'px';
      p.style.top = (e.clientY - dy) + 'px';
      p.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => { drag = false; });

    // ═══════════════════════════════════════════════════
    // KEYBOARD SHORTCUT
    // ═══════════════════════════════════════════════════
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        const btn = $('olv-start');
        if (btn) btn.click();
      }
    });

    updateStats();
    setStatus('Sẵn sàng', 'ok');

    console.log('[ONLUYEN] Panel v2.0 initialized. Click any button to see log.');
  }
}
