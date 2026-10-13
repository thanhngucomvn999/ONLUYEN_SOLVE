import { PROVIDER_REGISTRY } from './constants.js';
import { logger } from './logger.js';
import { StorageManager } from './core/StorageManager.js';
import { HomeworkSolver } from './core/HomeworkSolver.js';
import { Scraper } from './scraper/Scraper.js';
import { Panel } from './ui/Panel.js';

(function () {
  'use strict';

  const storage = new StorageManager();
  const solver = new HomeworkSolver(storage);

  window.hwSolver = {
    start: function () { return solver.solveAll(); },
    stop: function () { return solver.stop(); },
    solveOnce: function () {
      const l = Scraper.scanAll();
      const cache = storage.getCache();
      const q = l.find(function (x) {
        return !cache[storage.hashQ(x.text + '|' + x.type)];
      });
      return q ? solver.solveOne(q) : null;
    },
    scan: function () { return Scraper.scanAll(); },
    providers: function () { return Object.keys(PROVIDER_REGISTRY); },
    help: function () {
      console.table({
        'hwSolver.start()': 'Giải tất cả câu hỏi',
        'hwSolver.stop()': 'Dừng',
        'hwSolver.solveOnce()': 'Giải 1 câu chưa giải',
        'hwSolver.scan()': 'Liệt kê câu hỏi đã detect',
        'hwSolver.providers()': 'Xem danh sách provider',
      });
    },
  };

  function boot() {
    Panel.build(solver, storage);
    logger.info('ONLUYEN Solver v1.0 khởi động');
    logger.info('Provider: ' + PROVIDER_REGISTRY[storage.getSelectedProvider()].name);
    logger.info('Bấm "Quét thử" để kiểm tra DOM.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
