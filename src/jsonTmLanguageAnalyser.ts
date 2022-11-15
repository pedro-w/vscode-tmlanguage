import * as vscode from 'vscode'
import { parseTree, Node, findNodeAtLocation } from 'jsonc-parser'
export default class jsonTmLanguageAnalyser {
  private readonly _document: vscode.TextDocument
  constructor (document: vscode.TextDocument) {
    this._document = document
  }

  private _docContent: Node | undefined

  public getAnalysis (): void {
    if (this._docContent == null) {
      const docToCheck = this._document.getText()

      this._docContent = parseTree(docToCheck)
    }
    // Would having a type on the document content be useful?
    // return docContent;
  }

  // Convert node offset to a position that VSCode uses
  public getRange (node: Node): vscode.Range {
    return new vscode.Range(this._document.positionAt(node.offset), this._document.positionAt(node.offset + node.length))
  }

  public getSectionNames (): string[] {
    const keys: string[] = []
    const repository = (this._docContent != null) ? findNodeAtLocation(this._docContent, ['repository']) : undefined
    const children = ((repository?.children) != null) ? repository?.children : []
    for (const child of children) {
      if (child.type === 'property' && child.children?.[0] != null) {
        keys.push(child.children?.[0].value)
      }
    }
    return keys.sort((a, b) => a.localeCompare(b))
  }

  public getElements (matchingTitle: string, onlyType?: string): Node[] {
    const ans: Node[] = []
    if (this._docContent != null) {
      this.searchElements(this._docContent, matchingTitle, onlyType, ans)
    }
    return ans
  }

  private searchElements (element: Node, matchingTitle: string, onlyType: string | undefined, ans: Node[]): void {
    if (element.type === 'object' || element.type === 'array') {
      if (element.children != null) {
        for (const child of element.children) {
          this.searchElements(child, matchingTitle, onlyType, ans)
        }
      }
    } else if (element.type === 'property') {
      const key = element.children?.[0]
      const value = element.children?.[1]
      if (value != null) {
        if (key?.value === matchingTitle && (onlyType == null || onlyType === value.type)) {
          ans.push(value)
        }
        this.searchElements(value, matchingTitle, onlyType, ans)
      }
    }
  }
}
