const test = require('node:test');
const assert = require('node:assert/strict');

const { evaluateExpression, formatNumber } = require('../dist-evaluator/evaluator.cjs');

test('respects operator precedence', () => {
  assert.equal(evaluateExpression('2+3*4'), 14);
});

test('handles parentheses', () => {
  assert.equal(evaluateExpression('(2+3)*4'), 20);
});

test('supports modulo', () => {
  assert.equal(evaluateExpression('10%3'), 1);
});

test('prevents divide by zero', () => {
  assert.throws(() => evaluateExpression('9/0'));
});

test('formats decimal numbers', () => {
  assert.equal(formatNumber(3.14159265359), '3.1415926536');
});
