import * as vscode from 'vscode'
import * as murmurhash from 'murmurhash'
import { rangesByName } from './rangesByName'
import { colors, ignoredLanguages, method, theMethod } from "./configuration"

let rangeLists: vscode.Range[][] = colors.map(_ => [])

function colorIndexOfSymbol(symbolName: string, symbolIndex: number): number {
	switch (method) {
		case theMethod.hash:
			return murmurhash.v3(symbolName) % rangeLists.length
		case theMethod.sequential:
		default:
			return symbolIndex % rangeLists.length
	}
}

export async function colorize(editor: vscode.TextEditor): Promise<void> {
	if (!!editor.document.languageId && ignoredLanguages.has(editor.document.languageId)) { return }
	if (!!editor.document.uri) {
		const uri = editor.document.uri
		// provideDocumentSemanticTokensLegend is in the built-in commands documentation, but not the extension interface
		// does this mean that I can't count on it being there?
		// code.visualstudio.com/api/language-extensions/semantic-highlight-guide
		// However there is the built in command vscode.provideDocumentRangeSemanticTokensLegend and vscode.provideDocumentSemanticTokensLegend

		// Not really sure what querying the value of the active color scheme does
		// vscode.window.activeColorTheme

		const legend: vscode.SemanticTokensLegend | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri)
		// It would be nice if this would work, but it will not because there is a lookup in the index of the array
		// const tokenTypes = ["namespace", "class", "enum", "interface", "struct", "typeParameter", "type", "parameter", "variable", "property", "enumMember", "decorator", "event", "function", "method", "macro", "label", "comment", "string", "keyword", "number", "regexp", "operator"]
		// const legendDefault: vscode.SemanticTokensLegend = new vscode.SemanticTokensLegend(tokenTypes);
		// const legend = !!legendPromise ? legendPromise : legendDefault
		const tokensData: vscode.SemanticTokens | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri)
		rangeLists = colors.map(_ => [])
		if (!!tokensData) {
			if (!!legend) {
				const rangesBySymbolName = rangesByName(tokensData, legend, editor)
				Object.keys(rangesBySymbolName).forEach((name, index) => {
					// Return the ranges in Record<string, vscode.Range[]> which is kind of like a map
					const ranges = rangesBySymbolName[name]
					const colorIndex = colorIndexOfSymbol(name, index)
					rangeLists[colorIndex] = rangeLists[colorIndex].concat(ranges)
				})

				colors.forEach((color, index) => {
					// Text textdecoration object and an array of type Range
					// So this really just tells vscode to apply the textdecoration over a list of specific ranges
					editor.setDecorations(color, rangeLists[index])
				})
			} else {
				// This might be a good place to branch with regex for detecting token type
				// vscode uses textmate grammer which maps to a type and length
				// The document semantic tokens then maps that to a decoration
				const logMessage: string = "Unable to obtain Semantic Token Legend"
				vscode.window.showInformationMessage(logMessage)
				// console.log(logMessage)
			}
		} else {
			const logMessage: string = "Unable to obtain Semantic Tokens"
			vscode.window.showInformationMessage(logMessage)
			// console.log(logMessage)
		}
	}
}
