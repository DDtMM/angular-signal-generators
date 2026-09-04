import { access, cp, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
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

async function configureTestTarget(temporaryRoot, angularVersion) {
  const angularConfigPath = join(temporaryRoot, 'angular.json');
  const angularConfig = JSON.parse(await readFile(angularConfigPath, 'utf8'));
  const testOptions = angularConfig.projects['signal-generators'].architect.test.options;
  if (Number(angularVersion) < 22) {
    delete testOptions.coverage;
    delete testOptions.coverageExclude;
    delete testOptions.coverageReporters;
  }
  testOptions.setupFiles = ['projects/signal-generators/src/testing/vitest-setup.ts'];
  await cp(join(compatibilityRoot, 'test-setup.ts'), join(temporaryRoot, testOptions.setupFiles[0]));
  await writeFile(angularConfigPath, `${JSON.stringify(angularConfig, null, 2)}\n`);
}

for (const angularVersion of angularVersions) {
  const environmentRoot = join(compatibilityRoot, `angular-${angularVersion}`);
  await access(join(environmentRoot, 'package.json')).catch(() => {
    throw new Error(
      `No compatibility environment exists for Angular ${angularVersion}. Available versions: ${availableVersions.join(', ')}.`,
    );
  });

  // Windows TEMP can use an 8.3 alias. Use the canonical path so Angular's
  // generated test imports and Vite's resolved paths refer to the same directory.
  const temporaryRoot = await realpath(await mkdtemp(join(tmpdir(), `signal-generators-angular-${angularVersion}-`)));
  try {
    console.log(`\n=== Testing with Angular ${angularVersion} ===\n`);
    await cp(workspaceRoot, temporaryRoot, { recursive: true, filter: shouldCopy });
    await cp(join(environmentRoot, 'package.json'), join(temporaryRoot, 'package.json'));
    await cp(join(environmentRoot, 'package-lock.json'), join(temporaryRoot, 'package-lock.json'));
    await cp(join(environmentRoot, 'tsconfig.json'), join(temporaryRoot, 'tsconfig.json'));
    await configureTestTarget(temporaryRoot, angularVersion);

    await run('npm', ['ci', '--no-audit', '--no-fund'], temporaryRoot);
    await run('npm', ['run', 'test', '--', '--watch=false'], temporaryRoot);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}
