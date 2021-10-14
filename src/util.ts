import * as path from 'path'
// Behaves as path.parse but handles double extensions .tmLanguage.json etc.

export function PathParse (p: string): path.ParsedPath {
  const parsed = path.parse(p)
  const base = parsed.base
  if (base.toLowerCase().endsWith('.tmlanguage.json')) {
    const pos = base.length - '.tmlanguage.json'.length
    return { ...parsed, ext: base.substring(pos), name: base.substring(0, pos) }
  } else if (base.toLowerCase().endsWith('.tmlanguage.yml')) {
    const pos = base.length - '.tmlanguage.yml'.length
    return { ...parsed, ext: base.substring(pos), name: base.substring(0, pos) }
  } else if (base.toLowerCase().endsWith('.tmlanguage.yaml')) {
    const pos = base.length - '.tmlanguage.yaml'.length
    return { ...parsed, ext: base.substring(pos), name: base.substring(0, pos) }
  } else { return parsed }
}
