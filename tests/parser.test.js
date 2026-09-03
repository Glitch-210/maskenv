import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { enableRedaction, disableRedaction } from '../src/index.mjs';

test('End-to-End .env extraction and masking', () => {
  const envPath = path.resolve(process.cwd(), '.env');
  const mockEnvData = `
PORT=8080
# Comment
DB_PASS="Complex$Secret!99"
SHORT=123
`;
  
  // 1. Write mock .env
  fs.writeFileSync(envPath, mockEnvData);

  // 2. Setup spy stream
  const origStdout = process.stdout.write;
  let captured = '';
  process.stdout.write = (chunk, enc, cb) => {
    captured = String(chunk);
    if(cb) cb();
    return true;
  };

  // 3. Init library (will read the mock .env)
  enableRedaction();

  // 4. Test execution
  process.stdout.write('Connecting to DB with Complex$Secret!99 on PORT 8080');

  // 5. Assertions
  assert.ok(captured.includes('[REDACTED]'), 'Secret was not redacted');
  assert.ok(!captured.includes('Complex$Secret!99'), 'Secret leaked');
  assert.ok(captured.includes('8080'), 'Port should not be redacted (low entropy)');

  // 6. Teardown
  disableRedaction();
  process.stdout.write = origStdout;
  fs.unlinkSync(envPath); // Clean up filesystem
});