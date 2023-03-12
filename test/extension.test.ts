//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { FileConverter } from '../src/fileConverter'
import * as path from 'path'
import { TextDocument, workspace, window, extensions, commands } from 'vscode'
const formatFilesPath = path.join(__dirname, '..', '..', 'test', 'testfiles')

const jsonTestFile = path.join(formatFilesPath, 'jsontest.JSON-tmLanguage')

const yamlTestFile = path.join(formatFilesPath, 'yamltest.YAML-tmLanguage')

// Defines a Mocha test suite to group tests of similar kind together
suite('File conversion tests', function () {
  setup(async function () {
    // Just make sure the extension is loaded before we do anything
    const extension = extensions.getExtension('pedro-w.tmlanguage')
    console.log(`Extension loaded: ${extension?.id ?? 'NONE'}`)
  })
  test('Convert from json to tmLanguage', async function () {
    const textDocument = await workspace.openTextDocument(jsonTestFile)
    await window.showTextDocument(textDocument)
    const fileConverter = new FileConverter()
    const success = await fileConverter.convertFileToTml()
    assert.strictEqual(true, success)
    const result = path.join(path.dirname(textDocument.fileName), 'jsontest.tmLanguage')
    const resultDoc = workspace.textDocuments.find((doc: TextDocument) => { return doc.fileName === result })
    const text = resultDoc?.getText() ?? ''
    assert.notStrictEqual(text, '')
  })

  test('Convert from yaml to tmLanguage', async function () {
    const textDocument = await workspace.openTextDocument(yamlTestFile)
    await window.showTextDocument(textDocument)
    const fileConverter = new FileConverter()
    const success = await fileConverter.convertFileToTml()
    assert.strictEqual(true, success)
    const result = path.join(path.dirname(textDocument.fileName), 'yamltest.tmLanguage')
    const resultDoc = workspace.textDocuments.find((doc: TextDocument) => { return doc.fileName === result })
    const text = resultDoc?.getText() ?? ''
    await commands.executeCommand('workbench.action.closeActiveEditor')
    assert.notStrictEqual(text, '')
  })
  test('Doomed to failure', async function () {
    assert.equal(2 + 2, 5)
  })
})
