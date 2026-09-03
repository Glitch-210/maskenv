## 👻 maskenv
```markdown
**A zero-dependency, hyper-fast stdout secret redactor for Node.js.**

As autonomous AI coding agents (like Claude Code, Aider, and Gemini CLI) increasingly read local terminal outputs and stack traces, the risk of accidentally leaking `.env` secrets into cloud LLM context windows has skyrocketed. 

maskenv intercepts `process.stdout` and `process.stderr` at the runtime level, dynamically masking your local `.env` secrets and hardcoded API keys before they ever hit the terminal.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()

## ✨ Features
* **Zero Dependencies:** Auditable, microscopic footprint (< 15KB).
* **AI-Agent Safe:** Prevents autonomous tools from reading secrets in stack traces.
* **Auto-Discovery:** Automatically parses your `.env` to build a masking dictionary.
* **Heuristic Catching:** Catches hardcoded Stripe, AWS, GitHub, and OpenAI keys even if they aren't in your `.env`.
* **Universal Support:** Dual-published for both CommonJS (`require`) and ESM (`import`).

## 🚀 Installation

```bash
npm install maskenv

```

## 🛠 Usage

### The Zero-Config Way (Recommended)

You can protect your application without modifying a single line of your source code. Run your app using Node's native `--import` flag:

```bash
node --import maskenv/auto server.js

```

*Any high-entropy secret inside your `.env` file will now be replaced with `[REDACTED]` in the console.*

### The Programmatic Way

If you prefer to initialize it manually, import it at the **very top** of your entry file (before any other loggers or modules are loaded):

```javascript
import { enableRedaction } from 'maskenv';

enableRedaction(); 

console.log(`Connecting with key: ${process.env.STRIPE_SECRET_KEY}`);
// Output: Connecting with key: [REDACTED]

```

## 🧪 Performance

maskenv is designed to be invisible. It utilizes strict-length regex patterns and native string manipulation to ensure a sub-2ms overhead per I/O operation, completely avoiding ReDoS (Regular Expression Denial of Service) vulnerabilities.

## 📄 License

MIT © [Glitch-210](https://www.google.com/search?q=https://github.com/Glitch-210)
