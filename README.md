# 🎓 ONLUYEN Solver

[![License: MIT](https://img.shields.io/badge/License-MIT-a6e3a1.svg)](LICENSE)

> AI Homework Solver cho [onluyen.vn](https://app.onluyen.vn) — Đa provider, miễn phí & trả phí.

## ✨ Tính năng

- 🔌 Đa provider: Groq, Gemini, Cerebras, OpenRouter (free) + OpenAI, Claude, DeepSeek (paid) + Custom endpoint
- 🎯 UI Settings: chọn provider, model, API key trực tiếp trên panel
- 🧠 Fallback tự động khi provider lỗi
- 🎨 Fix True/False: dispatch đủ 5 event cho React/Vue
- 🔍 Heuristic Scraper: tự dò câu hỏi, không phụ thuộc class cứng
- 📦 Cache localStorage: câu đã giải không gọi lại API
- 🧪 Test kết nối provider trước khi chạy

## 🚀 Cài đặt

1. Cài [Tampermonkey](https://www.tampermonkey.net/)
2. Mở URL: https://thanhngucomvn999.github.io/ONLUYEN_SOLVE/solver.user.js
3. Tampermonkey hỏi cài đặt — bấm **Install**
4. Truy cập app.onluyen.vn

## 🔑 Lấy API key miễn phí

| Provider | Link | Chi phí |
|---|---|---|
| Groq | https://console.groq.com/keys | Miễn phí 14,400 RPD |
| Gemini | https://aistudio.google.com/apikey | Miễn phí 1,500 RPD |
| Cerebras | https://cloud.cerebras.ai | Miễn phí |
| OpenRouter | https://openrouter.ai/keys | Miễn phí 50 RPD |

## 🛠️ Lệnh Console

\`\`\`javascript
hwSolver.start()        // Giải tất cả
hwSolver.stop()         // Dừng
hwSolver.solveOnce()    // Giải 1 câu chưa giải
hwSolver.scan()         // Liệt kê câu hỏi
hwSolver.providers()    // Danh sách provider
hwSolver.help()         // Trợ giúp
\`\`\`

## 📄 License

MIT © 2026 thanhngucomvn999
