import * as vscode from 'vscode'
import debounce from 'just-debounce'
import { colorize } from './colorize'
import { updateConfiguration } from './configuration'
import { generatePalette } from "./configuration"

const colorizeIfNeeded = debounce(colorize, 200)

// Hmm this does not look like its used
interface SemanticToken {
	name: string
	range: vscode.Range
}

function handleActiveEditorChange(editor: vscode.TextEditor | undefined) {
	// Its like two calls are made one right after the next - the second is good
	if (!!editor && !!vscode.window.activeTextEditor) {
		colorizeIfNeeded(editor)
	}
}

function handleColorThemeChange() {
	generatePalette()
	if (!!vscode.window.activeTextEditor) {
		const editor = vscode.window.activeTextEditor
		colorizeIfNeeded(editor)
	} else {
		const logMessage: string = "vscode.window.activeTextEditor is undefined in handleColorThemeChange"
		vscode.window.showInformationMessage(logMessage)
		// console.log(logMessage)
	}
}

function handleTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
	if (!!vscode.window.activeTextEditor) {
		const editor = vscode.window.activeTextEditor
		if (!!editor && editor.document === event.document) {
			colorizeIfNeeded(editor)
		}
	} else {
		const logMessage: string = "vscode.window.activeTextEditor is undefined in handleTextDocumentChange"
		vscode.window.showInformationMessage(logMessage)
		// console.log(logMessage)
	}
}

export function activate(context: vscode.ExtensionContext) {
	updateConfiguration()
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(updateConfiguration))
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange))
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange))
	context.subscriptions.push(vscode.window.onDidChangeActiveColorTheme(handleColorThemeChange))

	if (!!vscode.window.activeTextEditor) {
		const editor = vscode.window.activeTextEditor
		colorizeIfNeeded(editor)
	}
}

export function deactivate() { }
