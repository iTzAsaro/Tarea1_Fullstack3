const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const process = require('node:process');
const path = require('node:path');
const fs = require('node:fs');
const net = require('node:net');

const REPO_ROOT = path.resolve(__dirname, '..');

const SERVICES = {
  inventory: { name: 'inventory', port: 8001, cwd: path.join(REPO_ROOT, 'backend', 'services', 'inventory_service') },
  orders: { name: 'orders', port: 8002, cwd: path.join(REPO_ROOT, 'backend', 'services', 'orders_service') },
  users: { name: 'users', port: 8003, cwd: path.join(REPO_ROOT, 'backend', 'services', 'users_service') },
  stock: { name: 'stock', port: 8004, cwd: path.join(REPO_ROOT, 'backend', 'services', 'stock_service') },
  payments: { name: 'payments', port: 8005, cwd: path.join(REPO_ROOT, 'backend', 'services', 'payments_service') },
  shipping: { name: 'shipping', port: 8006, cwd: path.join(REPO_ROOT, 'backend', 'services', 'shipping_service') },
  customer: { name: 'customer', port: 8007, cwd: path.join(REPO_ROOT, 'backend', 'services', 'customer_service') },
};

const DEPENDENCIES = {
  inventory: [],
  users: [],
  stock: [],
  orders: ['inventory', 'users', 'stock'],
  payments: ['orders'],
  shipping: ['orders'],
  customer: ['users'],
};

function usage() {
  const services = Object.keys(SERVICES).join(', ');
  return [
    'Uso:',
    '  npm run services -- --all',
    '  npm run services -- --service <nombre>',
    '  npm run services -- --service <a,b,c>',
    '',
    'Opciones:',
    '  --all                 Levanta todos los servicios.',
    '  --service <nombres>    Levanta uno o más servicios (separados por coma).',
    '  --no-deps              No auto-incluye dependencias (falla si faltan).',
    '  --no-migrate            No ejecuta migrate antes de levantar.',
    '  --no-health            No valida /health/ al inicio.',
    '  --health-timeout <ms>  Tiempo máximo por servicio para health check. Default: 20000.',
    '  --keep-going           Continúa aunque un servicio falle (igual retorna exit code 1 si hay fallas).',
    '  --dry-run              No ejecuta nada; imprime el plan.',
    '  --list                 Lista servicios disponibles.',
    '  -h, --help             Muestra esta ayuda.',
    '',
    `Servicios: ${services}`,
  ].join('\n');
}

function parseArgs(argv) {
  const args = { all: false, services: [], withDeps: true, migrate: true, health: true, healthTimeoutMs: 20000, keepGoing: false, dryRun: false, list: false, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--all') args.all = true;
    else if (a === '--service') {
      const raw = argv[i + 1];
      if (!raw) throw new Error('Falta valor para --service');
      i += 1;
      args.services = raw.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--no-deps') args.withDeps = false;
    else if (a === '--no-migrate') args.migrate = false;
    else if (a === '--no-health') args.health = false;
    else if (a === '--health-timeout') {
      const raw = argv[i + 1];
      if (!raw) throw new Error('Falta valor para --health-timeout');
      i += 1;
      const ms = Number(raw);
      if (!Number.isFinite(ms) || ms <= 0) throw new Error('Valor inválido para --health-timeout');
      args.healthTimeoutMs = ms;
    } else if (a === '--keep-going') args.keepGoing = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--list') args.list = true;
    else if (a === '-h' || a === '--help') args.help = true;
    else throw new Error(`Opción desconocida: ${a}`);
  }

  return args;
}

function resolvePythonExecutable() {
  const candidates = [
    path.join(REPO_ROOT, 'backend', '.venv', 'Scripts', 'python.exe'),
    path.join(REPO_ROOT, 'backend', '.venv', 'bin', 'python'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'python';
}

async function isPortAvailable(port) {
  const server = net.createServer();
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', () => resolve());
    });
    return true;
  } catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? e.code : null;
    if (code === 'EADDRINUSE') return false;
    throw e;
  } finally {
    try {
      server.close();
    } catch {
      void 0;
    }
  }
}

function validateServiceNames(names) {
  const unknown = names.filter((n) => !(n in SERVICES));
  if (unknown.length) throw new Error(`Servicio(s) desconocido(s): ${unknown.join(', ')}`);
}

function resolveSelection({ all, services, withDeps }) {
  if (all) return Object.keys(SERVICES);
  if (!services.length) throw new Error('Debes usar --all o --service');
  validateServiceNames(services);

  if (!withDeps) {
    const missing = new Map();
    for (const s of services) {
      const deps = DEPENDENCIES[s] ?? [];
      const missingForService = deps.filter((d) => !services.includes(d));
      if (missingForService.length) missing.set(s, missingForService);
    }
    if (missing.size) {
      const lines = ['Faltan dependencias para la selección:'];
      for (const [s, deps] of missing.entries()) lines.push(`- ${s}: ${deps.join(', ')}`);
      throw new Error(lines.join('\n'));
    }
    return [...new Set(services)];
  }

  const selected = new Set();
  const stack = [...services];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    if (selected.has(current)) continue;
    selected.add(current);
    const deps = DEPENDENCIES[current] ?? [];
    for (const d of deps) stack.push(d);
  }
  return [...selected];
}

function topoSort(selected) {
  const sel = new Set(selected);
  const indeg = new Map();
  const out = new Map();

  for (const s of sel) {
    indeg.set(s, 0);
    out.set(s, []);
  }
  for (const s of sel) {
    for (const d of DEPENDENCIES[s] ?? []) {
      if (!sel.has(d)) continue;
      indeg.set(s, (indeg.get(s) ?? 0) + 1);
      out.get(d)?.push(s);
    }
  }

  const queue = [];
  for (const [s, d] of indeg.entries()) if (d === 0) queue.push(s);
  queue.sort();

  const order = [];
  while (queue.length) {
    const s = queue.shift();
    if (!s) continue;
    order.push(s);
    for (const nxt of out.get(s) ?? []) {
      indeg.set(nxt, (indeg.get(nxt) ?? 0) - 1);
      if (indeg.get(nxt) === 0) {
        queue.push(nxt);
        queue.sort();
      }
    }
  }

  if (order.length !== sel.size) throw new Error('Dependencias cíclicas detectadas');
  return order;
}

async function runCommand({ python, service, label, args }) {
  const child = spawn(python, args, {
    cwd: SERVICES[service].cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  const prefix = `[${label}] `;
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  child.stdout.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) if (line) process.stdout.write(`${prefix}${line}\n`);
  });
  child.stderr.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) if (line) process.stderr.write(`${prefix}${line}\n`);
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 0));
  });
  return exitCode;
}

async function migrateService({ python, service }) {
  const args = ['manage.py', 'migrate', '--noinput'];
  const code = await runCommand({ python, service, label: `${service}:migrate`, args });
  if (code !== 0) throw new Error(`migrate falló para ${service} (exit ${code})`);
}

async function waitForHealth({ service, timeoutMs }) {
  const url = `http://127.0.0.1:${SERVICES[service].port}/health/`;
  const startedAt = Date.now();
  let lastError = null;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
      } else {
        const payload = await res.json().catch(() => ({}));
        if (payload && typeof payload === 'object' && 'ok' in payload && payload.ok === true) return;
        return;
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Error desconocido');
    }
    await delay(250);
  }
  throw new Error(`health check falló para ${service} (${url}): ${lastError ? lastError.message : 'timeout'}`);
}

function startServiceProcess({ python, service }) {
  const child = spawn(python, ['manage.py', 'runserver', String(SERVICES[service].port)], {
    cwd: SERVICES[service].cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  const prefix = `[${service}] `;
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) if (line) process.stdout.write(`${prefix}${line}\n`);
  });
  child.stderr.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) if (line) process.stderr.write(`${prefix}${line}\n`);
  });

  return child;
}

async function runWithConcurrency(items, limit, worker) {
  const queue = [...items];
  const running = new Set();
  const results = [];

  const runNext = async () => {
    const item = queue.shift();
    if (item === undefined) return;
    const p = Promise.resolve()
      .then(() => worker(item))
      .then((value) => results.push({ ok: true, item, value }))
      .catch((error) => results.push({ ok: false, item, error }))
      .finally(() => running.delete(p));
    running.add(p);
  };

  while (queue.length || running.size) {
    while (queue.length && running.size < limit) await runNext();
    if (running.size) await Promise.race(running);
  }

  return results;
}

function planFromArgs(args) {
  if (args.list) return { mode: 'list' };
  if (args.help) return { mode: 'help' };
  const selected = resolveSelection({ all: args.all, services: args.services, withDeps: args.withDeps });
  const order = topoSort(selected);
  const plan = order.map((s) => ({
    service: s,
    port: SERVICES[s].port,
    cwd: SERVICES[s].cwd,
    migrate: args.migrate,
    health: args.health,
  }));
  return { mode: 'run', plan };
}

async function main(argv) {
  const args = parseArgs(argv);
  const planned = planFromArgs(args);
  const python = resolvePythonExecutable();

  if (planned.mode === 'help') {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  if (planned.mode === 'list') {
    const names = Object.keys(SERVICES).sort();
    for (const n of names) process.stdout.write(`${n}\t:${SERVICES[n].port}\t${SERVICES[n].cwd}\n`);
    return 0;
  }

  if (args.dryRun) {
    process.stdout.write(`${JSON.stringify(planned, null, 2)}\n`);
    return 0;
  }

  const children = new Map();
  const failures = [];
  let shuttingDown = false;

  const shutdown = (reason) => {
    if (shuttingDown) return;
    shuttingDown = true;
    if (reason) process.stderr.write(`[orchestrator] ${reason}\n`);
    for (const child of children.values()) {
      try {
        child.kill();
      } catch {
        continue;
      }
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT recibido, deteniendo servicios...'));
  process.on('SIGTERM', () => shutdown('SIGTERM recibido, deteniendo servicios...'));

  const portChecks = await runWithConcurrency(planned.plan, 6, async (step) => {
    const ok = await isPortAvailable(step.port);
    return { ok };
  });
  const busy = portChecks.filter((r) => r.ok && r.value && r.value.ok === false).map((r) => r.item);
  for (const b of busy) failures.push({ service: b.service, stage: 'port', message: `puerto ${b.port} en uso` });
  if (busy.length) {
    for (const b of busy) process.stderr.write(`[orchestrator] puerto en uso: ${b.service} (${b.port})\n`);
    if (!args.keepGoing) return 1;
  }

  const migratable = planned.plan.filter((s) => !busy.find((b) => b.service === s.service));
  if (args.migrate) {
    process.stdout.write('[orchestrator] ejecutando migrate...\n');
    const mig = await runWithConcurrency(migratable, 3, async (step) => migrateService({ python, service: step.service }));
    for (const r of mig) {
      if (r.ok) process.stdout.write(`[orchestrator] migrate OK: ${r.item.service}\n`);
      else {
        const msg = r.error instanceof Error ? r.error.message : 'Error desconocido';
        failures.push({ service: r.item.service, stage: 'migrate', message: msg });
        process.stderr.write(`[orchestrator] migrate ERROR: ${r.item.service} - ${msg}\n`);
      }
    }
    if (failures.some((f) => f.stage === 'migrate') && !args.keepGoing) return 1;
  }

  const runnable = migratable
    .map((s) => s.service)
    .filter((s) => !failures.find((f) => f.service === s && f.stage === 'migrate'));

  for (const s of runnable) {
    process.stdout.write(`[orchestrator] iniciando ${s} (puerto ${SERVICES[s].port})\n`);
    const child = startServiceProcess({ python, service: s });
    children.set(s, child);
    child.on('error', (err) => {
      if (shuttingDown) return;
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      failures.push({ service: s, stage: 'spawn', message: msg });
      process.stderr.write(`[orchestrator] ERROR: ${s} no pudo iniciar - ${msg}\n`);
      if (!args.keepGoing) shutdown('Abortando por error de spawn.');
    });
    child.on('exit', (code) => {
      if (shuttingDown) return;
      const exitCode = code ?? 0;
      failures.push({ service: s, stage: 'runserver', message: `salió con código ${exitCode}` });
      process.stderr.write(`[orchestrator] ERROR: ${s} salió (exit ${exitCode})\n`);
      if (!args.keepGoing) shutdown('Abortando por error de proceso.');
    });
  }

  if (args.health) {
    process.stdout.write('[orchestrator] validando /health/...\n');
    const healthChecks = await runWithConcurrency(runnable, 6, async (s) => waitForHealth({ service: s, timeoutMs: args.healthTimeoutMs }));
    for (const r of healthChecks) {
      if (r.ok) process.stdout.write(`[orchestrator] health OK: ${r.item}\n`);
      else {
        const msg = r.error instanceof Error ? r.error.message : 'Error desconocido';
        failures.push({ service: r.item, stage: 'health', message: msg });
        process.stderr.write(`[orchestrator] health ERROR: ${r.item} - ${msg}\n`);
      }
    }
    if (failures.some((f) => f.stage === 'health') && !args.keepGoing) {
      shutdown('Abortando por error de health check.');
      return 1;
    }
  }

  process.stdout.write('[orchestrator] servicios levantados. Ctrl+C para detener.\n');
  await new Promise(() => {});
  shutdown('finalizando');

  return failures.length ? 1 : 0;
}

module.exports = {
  SERVICES,
  DEPENDENCIES,
  parseArgs,
  resolveSelection,
  topoSort,
  planFromArgs,
  usage,
};

if (require.main === module) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((e) => {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`${msg}\n`);
      process.stderr.write(`${usage()}\n`);
      process.exit(1);
    });
}
