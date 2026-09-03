const fs = require('node:fs');
const path = require('node:path');
const { HARDCODED_PATTERNS } = require('./heuristics.cjs');

// [The rest of the logic is identical to index.mjs, replacing exports with module.exports]

let isPatched = false;
let originalStdoutWrite, originalStderrWrite, envSecrets = [];

function isHighEntropy(key, value) {
  if (!value || value.length < 12) return false;
  if (value.includes(' ') || value.startsWith('http') || value.includes('/')) return false;
  if (/SECRET|KEY|TOKEN|PASS|AUTH|API|CREDENTIAL/i.test(key)) return true;
  return [/[A-Z]/, /[a-z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(value)).length >= 3;
}

function extractSecrets() {
  const secrets = new Set();
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.trim().match(/^([^=]+)=(.*)$/);
      if (match && !line.trim().startsWith('#')) {
        let val = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
        if (isHighEntropy(match[1].trim(), val)) secrets.add(val);
      }
    }
  } catch (err) {}
  return Array.from(secrets).sort((a, b) => b.length - a.length);
}

function mask(text) {
  let m = text;
  for (const s of envSecrets) m = m.split(s).join('[REDACTED]');
  for (const p of HARDCODED_PATTERNS) m = m.replace(p, '[REDACTED_KEY]');
  return m;
}

function enableRedaction(manual = null) {
  if (isPatched) return;
  envSecrets = manual || extractSecrets();
  
  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  originalStderrWrite = process.stderr.write.bind(process.stderr);

  const createInterceptor = (orig) => function (chunk, enc, cb) {
    try {
      const isBuf = Buffer.isBuffer(chunk);
      const m = mask(isBuf ? chunk.toString('utf8') : String(chunk));
      return orig(isBuf ? Buffer.from(m, 'utf8') : m, enc, cb);
    } catch (e) {
      return orig(Buffer.from('[REDACTOR ERROR]\n'), enc, cb);
    }
  };

  process.stdout.write = createInterceptor(originalStdoutWrite);
  process.stderr.write = createInterceptor(originalStderrWrite);
  isPatched = true;
}

function disableRedaction() {
  if (!isPatched) return;
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
  isPatched = false;
}

module.exports = { enableRedaction, disableRedaction };