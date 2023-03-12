import * as path from 'path'
import Mocha from 'mocha'
import { globSync } from 'glob'

export function run (eTestsRoot: string, callback: (error: any, failures?: number) => void): void {
  // Create the mocha test
  process.env.DEBUG = '*'
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  })
  const testsRoot = path.resolve(__dirname, '..')
  const files = globSync('**/**.test.js', { cwd: testsRoot })
  const roots = files.map(f => path.resolve(testsRoot, f))
  // Add files to the test suite
  console.log('tests root', eTestsRoot)
  console.log('Running the suite, files ', JSON.stringify(roots))
  files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))
  // Run the mocha test
  try {
    const runner = mocha.run((failures: number) => {
      console.log('Got failures ', failures)
      callback(null, failures)
    })
    console.log(JSON.stringify(runner.stats ?? 'nope'))
  } catch (err) {
    console.error(err)
    callback(err)
  }
  console.log(JSON.stringify(mocha.files))
}
