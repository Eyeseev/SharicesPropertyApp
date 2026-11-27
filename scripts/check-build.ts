/**
 * Post-build safety check (run after `pnpm build`):
 *  - the test-only sign-in provider is absent from the production output
 *  - no test fixture reached the production output
 * Exits non-zero on failure.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const NEXT = path.join(ROOT, '.next')
const FORBIDDEN = [
  { needle: 'e2e-test-login', why: 'test-only sign-in provider' },
  { needle: 'Test sign-in (development only)', why: 'test-only sign-in provider' },
  { needle: 'fixture-7f3a-do-not-ship', why: 'test fixture data' },
]

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

if (!existsSync(NEXT)) {
  console.error('No .next directory: run `pnpm build` first.')
  process.exit(1)
}

const files = walk(NEXT).filter(
  (f) =>
    /\.(js|mjs|cjs|json|html|rsc|txt)$/.test(f) &&
    !f.includes(`${path.sep}cache${path.sep}`) &&
    !f.startsWith(path.join(NEXT, 'dev') + path.sep),
)
const hits: string[] = []
for (const f of files) {
  const text = readFileSync(f, 'utf8')
  for (const { needle, why } of FORBIDDEN) {
    if (text.includes(needle)) hits.push(`${path.relative(ROOT, f)}: contains ${why} ("${needle}")`)
  }
}

if (hits.length) {
  console.error('Build check FAILED:\n' + hits.map((h) => `  - ${h}`).join('\n'))
  process.exit(1)
}
console.log(
  `Build check OK: scanned ${files.length} files; no test provider or fixtures in production output.`,
)
