import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { enableRedaction, disableRedaction } from '../src/index.mjs';

describe('Stream Interceptor', () => {
  let originalStdoutWrite;
  let output = [];

  beforeEach(() => {
    originalStdoutWrite = process.stdout.write;
    output = [];
    process.stdout.write = (chunk, enc, cb) => {
      output.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
      if (typeof cb === 'function') cb();
      return true;
    };
  });

  afterEach(() => {
    disableRedaction();
    process.stdout.write = originalStdoutWrite;
  });

  test('redacts plain text standard string logging', () => {
    enableRedaction(['MY_FAKE_SECRET_123']);
    process.stdout.write('Connecting with password MY_FAKE_SECRET_123...\n');
    assert.ok(output[0].includes('[REDACTED]'));
    assert.ok(!output[0].includes('MY_FAKE_SECRET_123'));
  });

  test('catches hardcoded Stripe keys natively', () => {
    enableRedaction([]);
    const fakeKey = 'sk_live_' + 'abcdef1234567890abcdef1234567890';
    process.stdout.write(`Payment for ${fakeKey} failed`);
    assert.ok(output[0].includes('[REDACTED]'));
    assert.ok(!output[0].includes('sk_live_'));
  });
});