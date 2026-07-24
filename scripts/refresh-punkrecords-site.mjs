import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const punkRoot = process.env.PUNK_RECORDS_ROOT ?? '/Users/shika/.openclaw/workspace/PunkRecords'
const deployTarget = readOption('--deploy') ?? process.env.DASHBOARD_REFRESH_DEPLOY ?? 'none'
const shouldLint = !hasFlag('--skip-lint') && process.env.DASHBOARD_REFRESH_SKIP_LINT !== 'true'

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function readOption(name) {
  const prefix = `${name}=`
  const inline = process.argv.find((arg) => arg.startsWith(prefix))
  if (inline) return inline.slice(prefix.length)

  const index = process.argv.indexOf(name)
  if (index >= 0) return process.argv[index + 1]

  return null
}

function run(command, args, options = {}) {
  const startedAt = new Date()
  console.log(`[${startedAt.toISOString()}] ${command} ${args.join(' ')}`)

  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...options.env },
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with status ${result.status}`)
  }
}

function assertPunkRecordsReadable() {
  if (!fs.existsSync(punkRoot)) {
    throw new Error(`PunkRecords root not found: ${punkRoot}`)
  }

  const requiredDirs = ['Operations', 'Vessel', 'Career', 'Personal Decision Engine']
  const missing = requiredDirs.filter((dir) => !fs.existsSync(path.join(punkRoot, dir)))
  if (missing.length > 0) {
    throw new Error(`PunkRecords root is missing expected directories: ${missing.join(', ')}`)
  }
}

function refreshLocalBuild() {
  assertPunkRecordsReadable()
  run('npm', ['run', 'generate:projections'])
  if (shouldLint) run('npm', ['run', 'lint'])
  run('npm', ['run', 'build'])
}

try {
  if (deployTarget === 'none' || deployTarget === 'local') {
    refreshLocalBuild()
    console.log('PunkRecords dashboard projection refreshed locally.')
  } else if (deployTarget === 'github-pages') {
    assertPunkRecordsReadable()
    if (shouldLint) run('npm', ['run', 'lint'])
    run('node', ['scripts/deploy-github-pages.mjs'])
    console.log('PunkRecords dashboard projection refreshed and deployed to GitHub Pages.')
  } else {
    throw new Error(`Unsupported deploy target "${deployTarget}". Use "none", "local", or "github-pages".`)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
