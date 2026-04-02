import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const publishDir = join(projectRoot, 'docs');
const dryRun = process.argv.includes('--dry-run');

function run(command, args, cwd = projectRoot, options = {}) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit'
  });
}

function read(command, args, cwd = projectRoot) {
  return run(command, args, cwd, { capture: true }).trim();
}

function copyDirectoryContents(fromDir, toDir) {
  readdirSync(fromDir).forEach((entry) => {
    cpSync(join(fromDir, entry), join(toDir, entry), { recursive: true });
  });
}

function getGitConfig(key, fallback) {
  try {
    return read('git', ['config', key]) || fallback;
  } catch {
    return fallback;
  }
}

function main() {
  run('npm', ['run', 'build']);

  if (!existsSync(publishDir)) {
    throw new Error('Publish directory "docs" was not created. Run the build and try again.');
  }

  const tempRoot = mkdtempSync(join(os.tmpdir(), 'projectproposal-hyundai-marine-'));
  const deployRoot = join(tempRoot, 'deploy');

  mkdirSync(deployRoot, { recursive: true });
  copyDirectoryContents(publishDir, deployRoot);
  writeFileSync(join(deployRoot, '.nojekyll'), '');

  const remoteUrl = read('git', ['remote', 'get-url', 'origin']);
  const gitUserName = getGitConfig('user.name', 'GitHub Pages Deploy');
  const gitUserEmail = getGitConfig('user.email', 'github-pages-deploy@local');

  try {
    run('git', ['init', '--initial-branch=deploy'], deployRoot);
    run('git', ['config', 'user.name', gitUserName], deployRoot);
    run('git', ['config', 'user.email', gitUserEmail], deployRoot);
    run('git', ['add', '.'], deployRoot);
    run('git', ['commit', '-m', 'Deploy GitHub Pages'], deployRoot);
    run('git', ['remote', 'add', 'origin', remoteUrl], deployRoot);

    if (dryRun) {
      console.log('Dry run complete. The deploy branch push was skipped.');
      return;
    }

    run('git', ['push', '--force', 'origin', 'HEAD:deploy'], deployRoot);
    console.log('Deployed docs output to origin/deploy.');
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

main();
