/**
 * Use JISON to prepare a grammar file for JSON.
 * If this file is older than the generated grammar file,
 * skip the generation step.
 */

const jison = require('jisons')
const fs = require('fs')

const grammar = {
  comment: 'ECMA-262 5th Edition, 15.12.1 The JSON Grammar.',
  author: 'Zach Carter',

  lex: {
    macros: {
      digit: '[0-9]',
      esc: '\\\\',
      int: '-?(?:[0-9]|[1-9][0-9]+)',
      exp: '(?:[eE][-+]?[0-9]+)',
      frac: '(?:\\.[0-9]+)'
    },
    rules: [
      ['\\s+', '/* skip whitespace */'],
      ['{int}{frac}?{exp}?\\b', "return 'NUMBER';"],
      ['"(?:[^"\\\\]|\\\\.)*"', "yytext = yytext.substr(1,yyleng-2); return 'STRING';"],
      ['\\{', "return '{'"],
      ['\\}', "return '}'"],
      ['\\[', "return '['"],
      ['\\]', "return ']'"],
      [',', "return ','"],
      [':', "return ':'"],
      ['true\\b', "return 'TRUE'"],
      ['false\\b', "return 'FALSE'"],
      ['null\\b', "return 'NULL'"]
    ]
  },

  tokens: 'STRING NUMBER { } [ ] , : TRUE FALSE NULL',
  start: 'JSONText',

  bnf: {
    JSONString: [['STRING', '$$ = yytext;']],

    JSONNumber: [['NUMBER', '$$ = Number(yytext);']],

    JSONNullLiteral: [['NULL', '$$ = null;']],

    JSONBooleanLiteral: [['TRUE', '$$ = true;'],
      ['FALSE', '$$ = false;']],

    JSONText: [['JSONValue', 'return $$ = $1;']],

    JSONValue: [['JSONNullLiteral', "$$ = { 'value': $1, 'pos' : @1 };"],
      ['JSONBooleanLiteral', "$$ = { 'value': $1, 'pos' : @1 };"],
      ['JSONString', "$$ = { 'value': $1, 'pos' : @1 };"],
      ['JSONNumber', "$$ = { 'value': $1, 'pos' : @1 };"],
      ['JSONObject', '$$ = $1;'],
      ['JSONArray', "$$ = { 'value': $1, 'pos' : @1  };"]],

    JSONObject: [['{ }', '$$ = { };'],
      ['{ JSONMemberList }', "$$ = { 'value': $2, 'pos' : @1};"]],

    JSONMember: [['JSONString : JSONValue', '$$ = [$1, $3];']],

    JSONMemberList: [['JSONMember', '$$ = {}; $$[$1[0]] = $1[1];'],
      ['JSONMemberList , JSONMember', '$$ = $1; $1[$3[0]] = $3[1];']],

    JSONArray: [['[ ]', '$$ = [];'],
      ['[ JSONElementList ]', '$$ = $2;']],

    JSONElementList: [['JSONValue', '$$ = [$1];'],
      ['JSONElementList , JSONValue', '$$ = $1; $1.push($3);']]
  }
}

const destinationFile = './src/jsonGrammar.js'
const thisFileTime = fs.statSync(__filename).mtimeMs
const destinationFileTime = fs.statSync(destinationFile, { throwIfNoEntry: false })?.mtimeMs ?? 0
if (thisFileTime > destinationFileTime) {
  const parser = new jison.Parser(grammar)
  const source = parser.generate()
  fs.writeFileSync(destinationFile, source)
}
