import test from 'node:test';
import assert from 'node:assert/strict';
import { formatarWhatsApp } from '../src/utilitarios/telefone.js';

test('formata WhatsApp brasileiro sem DDI', () => {
  assert.equal(formatarWhatsApp('11999999999'), '(11) 99999-9999');
});

test('formata WhatsApp brasileiro com DDI', () => {
  assert.equal(formatarWhatsApp('+55 (11) 99999-9999'), '+55 (11) 99999-9999');
});

test('remove caracteres inválidos e limita o número', () => {
  assert.equal(formatarWhatsApp('abc 11-99999-9999 xyz'), '(11) 99999-9999');
  assert.equal(formatarWhatsApp('551199999999912345'), '+55 (11) 99999-9999');
});
