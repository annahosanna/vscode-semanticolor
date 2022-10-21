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
	if (!!editor) {
		colorizeIfNeeded(editor)
	}
}

function handleColorThemeChange() {
	generatePalette()
	const editor = vscode.window.activeTextEditor
	if (!!editor) {
		colorizeIfNeeded(editor)
	}
}

function handleTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
	if (!!vscode.window.activeTextEditor) {
		const editor = vscode.window.activeTextEditor
		if (!!editor && editor.document === event.document) {
			colorizeIfNeeded(editor)
		}
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
