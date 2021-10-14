import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

import * as plist from 'plist'
import * as YAML from 'yaml'

import { SupportedLanguage } from './languages'
import { PathParse } from './util'

export interface IConfig {
  replaceExistingFile: boolean
}

export class FileConverter {
  public convertFileToJsonTml (): Thenable<boolean> {
    return this.ConvertFile('json-tmlanguage')
  }

  public convertFileToYamlTml (): Thenable<boolean> {
    return this.ConvertFile('yaml-tmlanguage')
  }

  public convertFileToTml (): Thenable<boolean> {
    return this.ConvertFile('tmlanguage')
  }

  public convertFileToAuto (): Thenable<boolean> {
    return this.ConvertFile('yaml-tmlanguage')
  }

  public dispose (): void {
    // nothing to do
  }

  private fileExtensionFor (destinationLanguage: string): string | undefined {
    switch (destinationLanguage.toLowerCase()) {
      case 'json-tmlanguage':
        return 'tmLanguage.json'
      case 'yaml-tmlanguage':
        return 'tmLanguage.yml'
      case 'tmlanguage':
        return 'tmLanguage'
      default:
        return undefined
    }
  }

  private ConvertFile (destinationLanguage: string): Thenable<boolean> {
    const editor = vscode.window.activeTextEditor

    if (editor == null) {
      return Promise.reject(new Error('No active text editor'))
    }

    const extension = this.fileExtensionFor(destinationLanguage)

    if (extension == null) {
      return Promise.reject(new Error(`Unable to map destination language (${destinationLanguage}) to file extension`))
    }

    try {
      const doc: vscode.TextDocument = editor.document
      const parsedFilePath: path.ParsedPath = PathParse(doc.fileName)

      let documentText = doc.getText()

      // Some of the sublime tmlanguage variant files had comments as hints for auto conversion
      if (documentText.startsWith('//')) {
        const lastLineRange: vscode.Range = doc.lineAt(doc.lineCount - 1).range
        documentText = doc.getText(new vscode.Range(new vscode.Position(1, 0), lastLineRange.end))
      }

      const sourceLanguage = doc.languageId as SupportedLanguage

      const cfg = vscode.workspace.getConfiguration().get<IConfig>('tmLanguage')

      console.log(`Converting from ${sourceLanguage} to ${extension}`)

      if (cfg?.replaceExistingFile ?? false) {
        return this.createFileReplacingExisting(parsedFilePath, extension, sourceLanguage, destinationLanguage, documentText)
      } else {
        return this.createFileWithUniqueName(parsedFilePath, extension, sourceLanguage, destinationLanguage, documentText)
      }
    } catch (err) {
      console.log(err)
      return Promise.reject(err)
    }
  }

  private async createFileReplacingExisting (parsedFilePath: path.ParsedPath, extension: string, sourceLanguage: SupportedLanguage,
    destinationLanguage: string, documentText: string): Promise<boolean> {
    const newFilePath: string = path.join(parsedFilePath.dir, parsedFilePath.name + '.' + extension)
    const existed = fs.existsSync(newFilePath)
    const success = await this.openEditor(sourceLanguage, destinationLanguage, documentText, newFilePath, existed)
    return success
  }

  private async createFileWithUniqueName (parsedFilePath: path.ParsedPath, extension: string, sourceLanguage: SupportedLanguage,
    destinationLanguage: string, documentText: string): Promise<boolean> {
    // check to see if file already exists
    const matchingFiles = await vscode.workspace.findFiles(parsedFilePath.name + '*.' + extension, 'ABC')
    let paths = matchingFiles.map(p => p.fsPath)
    const editorWindows = vscode.window.visibleTextEditors.map(x => x.document.fileName)
    paths = paths.concat(editorWindows)
    let newFilePath = path.join(parsedFilePath.dir, `${parsedFilePath.name}.${extension}`)
    if (matchingFiles.length !== 0) {
      let counter = 1
      while (paths.includes(newFilePath)) {
        newFilePath = path.join(parsedFilePath.dir, `${parsedFilePath.name}(${counter}).${extension}`)
        counter++
      }
    }
    return await this.openEditor(sourceLanguage, destinationLanguage, documentText, newFilePath, false)
  }

  private parse (sourceLanguage: SupportedLanguage, documentText: string): any {
    switch (sourceLanguage) {
      case 'xml':
      case 'tmlanguage':
        return plist.parse(documentText)
      case 'json':
      case 'json-tmlanguage':
        return JSON.parse(documentText)
      case 'yaml':
      case 'yaml-tmlanguage':
        return YAML.parse(documentText)
      default:
        return undefined
    }
  }

  private build (destinationLanguage: SupportedLanguage, parsed: any): any {
    switch (destinationLanguage) {
      case 'xml':
      case 'tmlanguage':
        return plist.build(parsed)
      case 'json':
      case 'json-tmlanguage':
        return JSON.stringify(parsed, null, 2)
      case 'yaml':
      case 'yaml-tmlanguage':
        return YAML.stringify(parsed, { indent: 6 })
      default:
        return undefined
    }
  }

  private uriFor (filePath: string, existing: boolean): vscode.Uri {
    if (existing) {
      return vscode.Uri.file(filePath)
    } else {
      return vscode.Uri.parse('untitled:' + filePath)
    }
  }

  private DoEditStuff (edit: vscode.TextEditorEdit, editor: vscode.TextEditor, sourceLanguage: SupportedLanguage, destinationLanguage: string, documentText: string,
    exists: boolean, textDoc: vscode.TextDocument): void {
    const parsed = this.parse(sourceLanguage, documentText)

    if (parsed == null || parsed === '') {
      vscode.window.showErrorMessage(`tmLanguage: cannot convert source of type "${sourceLanguage}"`).then(() => {}, () => {})
    } else {
      const destLanguage = destinationLanguage as SupportedLanguage
      const built = this.build(destLanguage, parsed)

      if (exists) {
        const was = editor.selection
        const lastLineRange = textDoc.lineAt(textDoc.lineCount - 1).range
        const beginning = new vscode.Position(0, 0)
        const end = new vscode.Position(textDoc.lineCount - 1, lastLineRange.end.character)
        const entire = new vscode.Range(beginning, end)
        edit.replace(entire, built)
        editor.selection = was
      } else {
        edit.insert(new vscode.Position(0, 0), built)
      }
    }
  }

  private async openEditor (sourceLanguage: SupportedLanguage, destinationLanguage: string, documentText: string, path: string, exists: boolean): Promise<boolean> {
    const uri = this.uriFor(path, exists)
    const doc = await vscode.workspace.openTextDocument(uri)
    const editor = await vscode.window.showTextDocument(doc)
    const success = await editor.edit((edit: vscode.TextEditorEdit) => {
      this.DoEditStuff(edit, editor, sourceLanguage, destinationLanguage, documentText, exists, doc)
    })
    return success
  }
}
