import { CONFIG, PROVIDER_REGISTRY } from '../constants.js';

export class StorageManager {
  constructor() {
    this.cfg = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
    this.cfg.keys = this.cfg.keys || {};
    this.cfg.models = this.cfg.models || {};
  }

  save() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.cfg));
  }

  getSelectedProvider() {
    return this.cfg.selectedProvider || CONFIG.DEFAULT_PROVIDER;
  }
  setSelectedProvider(id) {
    this.cfg.selectedProvider = id;
    this.save();
  }

  getKey(id) { return this.cfg.keys[id] || ''; }
  setKey(id, key) { this.cfg.keys[id] = key; this.save(); }

  getModel(id) {
    return this.cfg.models[id] ||
      (PROVIDER_REGISTRY[id] && PROVIDER_REGISTRY[id].defaultModel) || '';
  }
  setModel(id, model) { this.cfg.models[id] = model; this.save(); }

  getCustomUrl() { return this.cfg.customBaseUrl || ''; }
  setCustomUrl(url) { this.cfg.customBaseUrl = url; this.save(); }

  getCustomModel() { return this.cfg.customModel || ''; }
  setCustomModel(m) { this.cfg.customModel = m; this.save(); }

  getCache() {
    return JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY) || '{}');
  }
  setCache(cache) {
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cache));
  }
  clearCache() { localStorage.removeItem(CONFIG.CACHE_KEY); }

  hashQ(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return 'q_' + h;
  }
}
