import * as path from 'path'
import Mocha from 'mocha'
import { glob } from 'glob'

export async function run (testsRoot: string): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  })
  return await new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot })
      .then(files => {
        // Add files to the test suite
        files.map(f => path.resolve(testsRoot, f))
          .forEach(f => mocha.addFile(f))
        // Run the mocha test
        mocha.run((failures: number) => {
          if (failures === 0) {
            resolve()
          } else {
            reject(new Error(`Test failures ${failures}`))
          }
        })
      }).catch(err => {
        console.error(err)
        reject(err)
      })
  })
}
