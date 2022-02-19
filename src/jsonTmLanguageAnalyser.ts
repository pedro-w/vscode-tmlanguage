import * as vscode from 'vscode'
import { parse } from './jsonGrammar'

export default class jsonTmLanguageAnalyser {
  private _docContent: any

  public getAnalysis (document: vscode.TextDocument): void {
    const docToCheck = document.getText()

    this._docContent = parse(docToCheck)

    // Would having a type on the document content be useful?
    // return docContent;
  }

  public getSectionNames (): string[] {
    const results: string[] = []
    const options = Object.getOwnPropertyNames(this._docContent.value.repository.value).sort((a, b) => a.localeCompare(b))
    for (var option of options) {
      results.push(option)
    }
    return results
  }

  public getElements (matchingTitle: string): any[] {
    return this.searchElements(this._docContent, matchingTitle)
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
