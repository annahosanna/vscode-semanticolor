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
		// vscode.window.activeColorTheme should tell you the theme currently set in settings
		// but does that mean it has been applied?

		const legend: vscode.SemanticTokensLegend | undefined = await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend', uri)
		// There are other plugins which either are linked to tree sitter, or use the textmate grammer
		// so that they have a fallback in case they can only get the document text but no information about the tokens
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
				const logMessage: string = "Unable to obtain Semantic Token Legend"
				vscode.window.showInformationMessage(logMessage)
				// console.log(logMessage)
			}
		} else {
			// A document with no theme applied and thus no semantic tokens
			const logMessage: string = "Please apply a Theme in order to enable semantic coloring"
			vscode.window.showInformationMessage(logMessage)
			// console.log(logMessage)
		}
	}
}
