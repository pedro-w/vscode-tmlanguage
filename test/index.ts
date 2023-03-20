import * as path from 'path'
import Mocha from 'mocha'
import { glob } from 'glob'

export async function run (testsRoot: string): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  })
  const files = await glob('**/**.test.js', { cwd: testsRoot })
  files.map(f => path.resolve(testsRoot, f))
    .forEach(f => mocha.addFile(f))
  // Run the mocha test
  const failures = await new Promise<number>((resolve) => mocha.run(resolve))
  if (failures > 0) {
    throw new Error(`Test failures ${failures}`)
  }
}
