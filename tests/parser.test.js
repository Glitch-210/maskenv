import test, { describe } from 'node:test';
import assert from 'node:assert';
import { enableRedaction, disableRedaction } from '../src/index.mjs';

describe('End-to-End .env extraction and masking', () => {
  test('handles redaction activation lifecycle cleanly', () => {
    assert.doesNotThrow(() => {
      enableRedaction(['TEST_SECRET']);
      disableRedaction();
    });
  });
});