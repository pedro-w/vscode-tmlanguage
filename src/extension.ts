'use strict'

import * as vscode from 'vscode'
import JsonTmLanguageCompletionItemProvider from './JsonTmLanguageCompletionItemProvider'
import JsonTmLanguageDiagnosticProvider from './jsonTmLanguageDiagnosticProvider'
import { FileConverter } from './fileConverter'

export const JSON_FILE: vscode.DocumentFilter = { language: 'json-tmlanguage', scheme: 'file' }

export function activate (context: vscode.ExtensionContext): void {
  try {
    const fileConverter = new FileConverter()

    const convertToJsonCommand = vscode.commands.registerCommand('extension.convertToJsonTml', async () => {
      await fileConverter.convertFileToJsonTml()
    })
    context.subscriptions.push(convertToJsonCommand)

    const convertToYamlCommand = vscode.commands.registerCommand('extension.convertToYamlTml', async () => {
      await fileConverter.convertFileToYamlTml()
    })
    context.subscriptions.push(convertToYamlCommand)

    const convertToTmlCommand = vscode.commands.registerCommand('extension.convertToTml', async () => {
      await fileConverter.convertFileToTml()
    })
    context.subscriptions.push(convertToTmlCommand)

    const convertToAutoCommand = vscode.commands.registerCommand('extension.convertTo', async () => {
      await fileConverter.convertFileToAuto()
    })
    context.subscriptions.push(convertToAutoCommand)
    context.subscriptions.push(fileConverter)

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(JSON_FILE, new JsonTmLanguageCompletionItemProvider(), '#'))

    const diagnosticProvider = new JsonTmLanguageDiagnosticProvider()
    vscode.workspace.onDidChangeTextDocument(event => {
      const document = event.document
      if (document.languageId === 'json-tmlanguage') {
        diagnosticProvider.CreateDiagnostics(document)
      }
    })
    console.log(`Extension ${context.extension.id} loaded`)
  } catch (err) {
    console.error('Failed to load tmLanguage extension due to ', err)
  }
}
