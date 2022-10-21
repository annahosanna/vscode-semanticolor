import * as vscode from 'vscode'
import * as murmurhash from 'murmurhash'
import { rangesByName } from './rangesByName'
import { colors, ignoredLanguages, method, Method } from "./configuration"

let rangeLists: vscode.Range[][] = colors.map(_ => [])

function colorIndexOfSymbol(symbolName: string, symbolIndex: number): number {
	switch (method) {
		case Method.hash:
			return murmurhash.v3(symbolName) % rangeLists.length
		case Method.sequential:
		default:
			return symbolIndex % rangeLists.length
	}
}

export async function colorize(editor: vscode.TextEditor): Promise<void> {
	if (!!editor.document.languageId && ignoredLanguages.has(editor.document.languageId)) { return }
	if (!!editor.document.uri) {
		const uri = editor.document.uri
		// provideDocumentSemanticTokensLegend is in the built-in commands documentation, but not the extension interface
		// does this mean that I can't count on it being there
		vscode.window.activeColorTheme
		const legend: vscode.SemanticTokensLegend | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri)
		const tokensData: vscode.SemanticTokens | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens', uri)
		rangeLists = colors.map(_ => [])
		if (!!tokensData && !!legend) {
			const rangesBySymbolName = rangesByName(tokensData, legend, editor)
			Object.keys(rangesBySymbolName).forEach((name, index) => {
				const ranges = rangesBySymbolName[name]
				const colorIndex = colorIndexOfSymbol(name, index)
				rangeLists[colorIndex] = rangeLists[colorIndex].concat(ranges)
			})

			colors.forEach((color, index) => {
				// Text textdecoration object and an array of type Range where
				// So this really just tells vscode to apply the textdecoration over a list of specific ranges
				editor.setDecorations(color, rangeLists[index])
			})
		}
	}
}
