import * as vscode from 'vscode'
import JsonTmLanguageAnalyser from './jsonTmLanguageAnalyser'

export default class jsonTmLanguageDiagnosticProvider {
  private readonly uuidErrors = vscode.languages.createDiagnosticCollection('languageErrors')
  public CreateDiagnostics (document: vscode.TextDocument): void {
    const diagnostics: vscode.Diagnostic[] = []

    const analyser = new JsonTmLanguageAnalyser()
    analyser.getAnalysis(document)

    var guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    try {
      // Need to determine a mapping back to the source text for each element
      // var guids = this.searchElements(docContent, "uuid");
      var guids = analyser.getElements('uuid')
      for (const id of guids) {
        if (typeof (id.value) === 'string') {
          if (!guidRegex.test(id.value)) {
            const lineRange = new vscode.Range(id.pos.first_line - 1, id.pos.first_column, id.pos.last_line - 1, id.pos.last_column)
            diagnostics.push(new vscode.Diagnostic(lineRange, 'Invalid UUID/GUID', vscode.DiagnosticSeverity.Error))
          }
        }
      }

      var sectionNames = analyser.getSectionNames()
      const includes = analyser.getElements('include')

      for (const thing of includes) {
        if (typeof (thing.value) !== 'string') continue

        var t: string = thing.value
        if (t.substr(0, 1) !== '#') continue

        var name = t.substring(1)
        if (!sectionNames.includes(name)) {
          const lineRange = new vscode.Range(thing.pos.first_line - 1,
            thing.pos.first_column,
            thing.pos.last_line - 1,
            thing.pos.last_column)
          diagnostics.push(new vscode.Diagnostic(lineRange, 'Reference name was not found', vscode.DiagnosticSeverity.Error))
        }
      }
    } catch (err) {
      const loc = err?.hash?.loc
      if (loc != null) {
        var lineRange = new vscode.Range(loc.first_line - 1, loc.first_column, loc.last_line - 1, loc.last_column)
        diagnostics.push(new vscode.Diagnostic(lineRange, err.message, vscode.DiagnosticSeverity.Error))
      }
    }

    this.uuidErrors.set(document.uri, diagnostics)
  }

  private searchElements (element: any, matchingTitle: string): any[] {
    var matchingElements: any[] = []

    for (var property in element.value) {
      if (property === matchingTitle) {
        matchingElements.push(element.value[property])
      }

      var result = this.searchElements(element.value[property], matchingTitle)
      if (result.length > 0) {
        matchingElements = matchingElements.concat(result)
      }
    }

    return matchingElements
  }
}
