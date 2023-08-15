import * as vscode from 'vscode'
import JsonTmLanguageAnalyser from './jsonTmLanguageAnalyser'

export default class jsonTmLanguageDiagnosticProvider {
  private readonly tmLanguageErrors = vscode.languages.createDiagnosticCollection('tmLanguageErrors')
  public CreateDiagnostics (document: vscode.TextDocument): void {
    // Only attach diagnostics to json-tmlanguage docs
    if (document.languageId !== 'json-tmlanguage') { return }
    const diagnostics: vscode.Diagnostic[] = []

    const analyser = new JsonTmLanguageAnalyser(document)
    analyser.getAnalysis()

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    // Need to determine a mapping back to the source text for each element
    analyser.getElements('uuid', 'string')
      .filter(id => !guidRegex.test(id.value))
      .map(id => analyser.getRange(id))
      .forEach(range => {
        diagnostics.push(new vscode.Diagnostic(range, 'Invalid UUID/GUID', vscode.DiagnosticSeverity.Error))
      })

    const sectionNames = analyser.getSectionNames()
    analyser.getElements('include', 'string')
      .filter((thing) => {
        const t: string = thing.value ?? 'N/A'
        if (t.startsWith('#')) {
          const name = t.substring(1)
          return !sectionNames.includes(name)
        } else {
          return false
        }
      })
      .map(thing => analyser.getRange(thing))
      .forEach(range => diagnostics.push(new vscode.Diagnostic(range, 'Reference name was not found', vscode.DiagnosticSeverity.Error)))

    this.tmLanguageErrors.set(document.uri, diagnostics)
  }

  RemoveDiagnostics (document: vscode.TextDocument): void {
    this.tmLanguageErrors.delete(document.uri)
  }
}
