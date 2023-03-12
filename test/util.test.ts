import * as assert from 'assert'
import { platform } from 'os'
import { PathParse } from '../src/util'

suite('Utility tests', function () {
  test('Doomed to fail', function () {
    assert.strictEqual(2 + 2, 5)
  })
  test('Test path parser', function () {
    const crossPlatformExamples = {
      'readme.txt': { name: 'readme', ext: '.txt', dir: '', base: 'readme.txt', root: '' },
      '/tmp/readme.txt': { name: 'readme', ext: '.txt', dir: '/tmp', base: 'readme.txt', root: '/' },
      'edit.tmLanguage.yml': { name: 'edit', ext: '.tmLanguage.yml', dir: '', base: 'edit.tmLanguage.yml', root: '' },
      'edit.tmLanguage.yaml': { name: 'edit', ext: '.tmLanguage.yaml', dir: '', base: 'edit.tmLanguage.yaml', root: '' },
      'edit.tmLanguage': { name: 'edit', ext: '.tmLanguage', dir: '', base: 'edit.tmLanguage', root: '' },
      'edit.tmLanguage.json': { name: 'edit', ext: '.tmLanguage.json', dir: '', base: 'edit.tmLanguage.json', root: '' },
      'edit.tmlanguage.json': { name: 'edit', ext: '.tmlanguage.json', dir: '', base: 'edit.tmlanguage.json', root: '' }
    }
    const win32Examples = {
      'c:\\temp\\readme.txt': { name: 'readme', ext: '.txt', dir: 'c:\\temp', base: 'readme.txt', root: 'c:\\' }
    }
    const examples = platform() === 'win32' ? { ...crossPlatformExamples, ...win32Examples } : crossPlatformExamples
    Object.entries(examples).forEach(([input, expected]) => {
      const actual = PathParse(input)
      assert.deepStrictEqual(actual, expected)
    })
  })
})
