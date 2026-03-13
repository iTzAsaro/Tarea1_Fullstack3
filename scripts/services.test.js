const test = require('node:test');
const assert = require('node:assert/strict');

const { parseArgs, resolveSelection, topoSort, planFromArgs } = require('./services');

test('parseArgs: --all', () => {
  const args = parseArgs(['--all']);
  assert.equal(args.all, true);
  assert.deepEqual(args.services, []);
});

test('parseArgs: --service list', () => {
  const args = parseArgs(['--service', 'orders,payments']);
  assert.equal(args.all, false);
  assert.deepEqual(args.services, ['orders', 'payments']);
});

test('resolveSelection: expands dependencies by default', () => {
  const selected = resolveSelection({ all: false, services: ['payments'], withDeps: true });
  const set = new Set(selected);
  for (const s of ['payments', 'orders', 'inventory', 'users', 'stock']) assert.equal(set.has(s), true);
});

test('resolveSelection: no-deps fails when dependencies missing', () => {
  assert.throws(
    () => resolveSelection({ all: false, services: ['payments'], withDeps: false }),
    /Faltan dependencias/,
  );
});

test('topoSort: orders precede dependents', () => {
  const order = topoSort(['inventory', 'users', 'stock', 'orders', 'payments']);
  assert.ok(order.indexOf('orders') > order.indexOf('inventory'));
  assert.ok(order.indexOf('orders') > order.indexOf('users'));
  assert.ok(order.indexOf('orders') > order.indexOf('stock'));
  assert.ok(order.indexOf('payments') > order.indexOf('orders'));
});

test('planFromArgs: dry plan contains ports', () => {
  const planned = planFromArgs(parseArgs(['--service', 'orders']));
  assert.equal(planned.mode, 'run');
  const step = planned.plan.find((p) => p.service === 'orders');
  assert.ok(step);
  assert.equal(step.port, 8002);
});

