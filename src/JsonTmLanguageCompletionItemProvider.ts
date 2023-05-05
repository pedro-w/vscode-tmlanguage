import * as vscode from 'vscode'

import JsonTmLanguageAnalyser from './jsonTmLanguageAnalyser'

export default class JsonTmLanguageCompletionItemProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
    return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
      try {
        const analyser = new JsonTmLanguageAnalyser(document)
        analyser.getAnalysis()
        const sectionNames = analyser.getSectionNames()
        const completion = sectionNames.map(section => new vscode.CompletionItem(section, vscode.CompletionItemKind.Keyword))
        return resolve(completion)
      } catch (err) {
        return reject(err)
      }
    })
  }
}
