import fs from 'node:fs';
import path from 'node:path';
import { HARDCODED_PATTERNS } from './heuristics.mjs';

let isPatched = false;
let originalStdoutWrite;
let originalStderrWrite;
let envSecrets = [];

const SENSITIVE_KEY_PATTERN = /SECRET|KEY|TOKEN|PASS|AUTH|API|CREDENTIAL/i;

function isHighEntropy(key, value) {
  if (!value || value.length < 12) return false;
  if (value.includes(' ') || value.startsWith('http') || value.includes('/')) return false;
  if (SENSITIVE_KEY_PATTERN.test(key)) return true;
  
  const complexity = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^a-zA-Z0-9]/]
    .filter(regex => regex.test(value)).length;
  return complexity >= 3;
}

function extractSecrets() {
  const secrets = new Set();
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (!match) continue;
      
      let value = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
      if (isHighEntropy(match[1].trim(), value)) secrets.add(value);
    }
  } catch (err) { /* Silent fail if no .env exists */ }
  
  return Array.from(secrets).sort((a, b) => b.length - a.length);
}

function mask(text) {
  let masked = text;
  for (const secret of envSecrets) {
    masked = masked.split(secret).join('[REDACTED]');
  }
  for (const pattern of HARDCODED_PATTERNS) {
    masked = masked.replace(pattern, '[REDACTED_KEY]');
  }
  return masked;
}

export function enableRedaction(manualSecrets = null) {
  if (isPatched) return;
  
  envSecrets = manualSecrets || extractSecrets();
  
  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  originalStderrWrite = process.stderr.write.bind(process.stderr);

  const createInterceptor = (originalWrite) => function (chunk, encoding, callback) {
    try {
      const isBuffer = Buffer.isBuffer(chunk);
      const text = isBuffer ? chunk.toString('utf8') : String(chunk);
      const redacted = mask(text);
      const finalChunk = isBuffer ? Buffer.from(redacted, 'utf8') : redacted;
      
      return originalWrite(finalChunk, encoding, callback);
    } catch (e) {
      return originalWrite(Buffer.from('[REDACTOR ERROR]\n'), encoding, callback);
    }
  };

  process.stdout.write = createInterceptor(originalStdoutWrite);
  process.stderr.write = createInterceptor(originalStderrWrite);
  isPatched = true;
}

export function disableRedaction() {
  if (!isPatched) return;
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
  isPatched = false;
}