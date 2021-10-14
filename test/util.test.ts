import * as assert from 'assert'
import { PathParse } from '../src/util'

suite('Utility tests', () => {
  test('Test path parser', function () {
    const examples = {
      'readme.txt': { name: 'readme', ext: '.txt', dir: '', base: 'readme.txt', root: '' },
      'c:\\temp\\readme.txt': { name: 'readme', ext: '.txt', dir: 'c:\\temp', base: 'readme.txt', root: 'c:\\' },
      '/tmp/readme.txt': { name: 'readme', ext: '.txt', dir: '/tmp', base: 'readme.txt', root: '/' },
      'edit.tmLanguage.yml': { name: 'edit', ext: '.tmLanguage.yml', dir: '', base: 'edit.tmLanguage.yml', root: '' },
      'edit.tmLanguage.yaml': { name: 'edit', ext: '.tmLanguage.yaml', dir: '', base: 'edit.tmLanguage.yaml', root: '' },
      'edit.tmLanguage': { name: 'edit', ext: '.tmLanguage', dir: '', base: 'edit.tmLanguage', root: '' },
      'edit.tmLanguage.json': { name: 'edit', ext: '.tmLanguage.json', dir: '', base: 'edit.tmLanguage.json', root: '' },
      'edit.tmlanguage.json': { name: 'edit', ext: '.tmlanguage.json', dir: '', base: 'edit.tmlanguage.json', root: '' }
    }
    Object.entries(examples).forEach(([input, expected]) => {
      const actual = PathParse(input)
      assert.deepStrictEqual(actual, expected)
    })
  })
})
