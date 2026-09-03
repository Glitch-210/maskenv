import { patterns } from './heuristics.mjs';

let active = false;
let customSecrets = [];
let originalWrite = null;

export function enableRedaction(secrets = []) {
  if (active) return;
  active = true;
  customSecrets = secrets;

  if (!originalWrite) {
    originalWrite = process.stdout.write;
  }

  process.stdout.write = function(chunk, encoding, callback) {
    let str = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
    
    // Mask explicit custom secrets
    for (const secret of customSecrets) {
      if (secret) {
        str = str.split(secret).join('[REDACTED]');
      }
    }

    // Mask native heuristic patterns (like API keys)
    for (const p of patterns) {
      str = str.replace(p.regex, '[REDACTED]');
    }

    return originalWrite.call(this, str, encoding, callback);
  };
}

export function disableRedaction() {
  if (!active) return;
  active = false;
  if (originalWrite) {
    process.stdout.write = originalWrite;
  }
}