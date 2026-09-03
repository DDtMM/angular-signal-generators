import { access, cp, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';

const workspaceRoot = resolve(import.meta.dirname, '..');
const compatibilityRoot = join(workspaceRoot, 'compatibility');
const requestedVersions = process.argv.slice(2);
const availableVersions = (await readdir(compatibilityRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^angular-\d+$/.test(entry.name))
  .map((entry) => entry.name.replace('angular-', ''))
  .sort((left, right) => Number(left) - Number(right));
const angularVersions = requestedVersions.length > 0 ? requestedVersions : availableVersions;

const excludedDirectories = new Set([
  '.angular', '.git', '.nx', 'coverage', 'dist', 'node_modules',
]);

function shouldCopy(source) {
  const pathFromRoot = relative(workspaceRoot, source);
  if (!pathFromRoot || pathFromRoot.startsWith(`..${sep}`)) return true;
  return !pathFromRoot.split(sep).some((part) => excludedDirectories.has(part));
}

function run(command, args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: 'true' },
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) return resolvePromise();
      reject(new Error(
        `${command} ${args.join(' ')} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}`,
      ));
    });
  });
}

for (const angularVersion of angularVersions) {
  const environmentRoot = join(compatibilityRoot, `angular-${angularVersion}`);
  await access(join(environmentRoot, 'package.json')).catch(() => {
    throw new Error(
      `No compatibility environment exists for Angular ${angularVersion}. Available versions: ${availableVersions.join(', ')}.`,
    );
  });

  const temporaryRoot = await mkdtemp(join(tmpdir(), `signal-generators-angular-${angularVersion}-`));
  try {
    console.log(`\n=== Testing with Angular ${angularVersion} ===\n`);
    await cp(workspaceRoot, temporaryRoot, { recursive: true, filter: shouldCopy });
    await cp(join(environmentRoot, 'package.json'), join(temporaryRoot, 'package.json'));
    await cp(join(environmentRoot, 'package-lock.json'), join(temporaryRoot, 'package-lock.json'));
    await cp(join(environmentRoot, 'tsconfig.json'), join(temporaryRoot, 'tsconfig.json'));

    await run('npm', ['ci', '--no-audit', '--no-fund'], temporaryRoot);
    await run('npm', ['run', 'test', '--', '--watch=false', '--browsers=ChromeHeadless'], temporaryRoot);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}
