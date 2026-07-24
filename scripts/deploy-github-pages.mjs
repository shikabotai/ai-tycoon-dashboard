import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const publishDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-tycoon-dashboard-gh-pages-'))

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...options.env },
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with status ${result.status}`)
  }
}

function emptyPublishDir() {
  for (const entry of fs.readdirSync(publishDir)) {
    if (entry === '.git') continue
    fs.rmSync(path.join(publishDir, entry), { recursive: true, force: true })
  }
}

function copyDist() {
  const distDir = path.join(repoRoot, 'dist')
  for (const entry of fs.readdirSync(distDir)) {
    fs.cpSync(path.join(distDir, entry), path.join(publishDir, entry), { recursive: true })
  }
  fs.writeFileSync(path.join(publishDir, '.nojekyll'), '')
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(publishDir, '404.html'))
}

try {
  run('npm', ['run', 'generate:projections'])
  run('npm', ['run', 'build'], { env: { GITHUB_PAGES: 'true' } })
  run('git', ['fetch', 'origin', 'gh-pages'])
  run('git', ['worktree', 'add', '--detach', publishDir, 'origin/gh-pages'])
  emptyPublishDir()
  copyDist()
  run('git', ['add', '-A'], { cwd: publishDir })

  const diff = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: publishDir })
  if (diff.status === 0) {
    console.log('No GitHub Pages changes to deploy.')
  } else {
    run('git', ['commit', '-m', 'Nightly PunkRecords projection deploy'], { cwd: publishDir })
    run('git', ['push', 'origin', 'HEAD:gh-pages'], { cwd: publishDir })
  }
} finally {
  spawnSync('git', ['worktree', 'remove', '--force', publishDir], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
}
