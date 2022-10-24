import * as vscode from 'vscode'
import { ColorThemeKind } from 'vscode'
import * as colorConvert from 'color-convert'

export const theMethod = {
	sequential: 'sequential',
	hash: 'hash'
}

const thePaletteMode = {
	automatic: 'automatic',
	manual: 'manual'
}

let paletteMode = thePaletteMode.automatic
export let tokenKinds: Set<string> = new Set(['variable', 'parameter', 'property'])
export let ignoredLanguages: Set<string> = new Set()
export let colors = [
	'#FF00FF'
].map(color => vscode.window.createTextEditorDecorationType({ color }))
export let method: string = theMethod.sequential

export function updateConfiguration() {
	// using a ternay operator instead of a null coalescing operator
	// Seems to think [] is never[] which is not what I want
	// const configuration = !!vscode.workspace.getConfiguration('colorIdentifiersMode') ? vscode.workspace.getConfiguration('colorIdentifiersMode') : [];
	// Yay but this could have a return value I do not want
	const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('colorIdentifiersMode')
	tokenKinds = !!configuration.get('tokenKinds') ? new Set(configuration.get('tokenKinds')) : new Set<string>()
	ignoredLanguages = !!configuration.get('ignoredLanguages') ? new Set(configuration.get('ignoredLanguages')) : new Set<string>()
	var checkMethod: string | undefined = configuration.get('method')
	var anyMethod: any = checkMethod
	if (checkMethod !== undefined) {
		method = (anyMethod as string) 
	} else {
		method = theMethod.sequential
	}
	var checkPaletteMode: string | undefined = configuration.get('paletteMode')
	var anyPaletteMode: any = checkPaletteMode
	if (checkPaletteMode !== undefined) {		 
		paletteMode = (anyPaletteMode as string)
	 } else {
		paletteMode = thePaletteMode.automatic
	}
	generatePalette()
}

// https://blog.devgenius.io/when-to-use-null-undefined-or-empty-array-d45244ffc565
// ?? null coalescing operator "not null" ?? "if null"
// [] is the same as new Array<type>() except when it is infered as 'never' or 'never[]'
// !!variable A syntax to test for false like variables which return false if null or undefined
// const var_name: Type = expression
// Typescript does not understand narrowing/filtering of type or value, so that something can be assigned to a different type. 
// It always infers all of the type outcomes must be handled
export function generatePalette() {
	colors.forEach(color => color.dispose())
	switch (paletteMode) {
		case thePaletteMode.manual:
			const configuration = vscode.workspace.getConfiguration('colorIdentifiersMode')
			if (!!configuration) {
				var checkColorNames: string[] | undefined = configuration.get('manualColors')
				var anyColor: any = checkColorNames
				var colorNames: string[]
				if (checkColorNames !== undefined) {
					colorNames = (anyColor as string[]) 
				} else {
					colorNames = new Array<string>()
				}
				colors = colorNames.map(color => vscode.window.createTextEditorDecorationType({ color }))
			} else {
				var colorNames: string[] = new Array<string>()
				colors = colorNames.map(color => vscode.window.createTextEditorDecorationType({ color }))
			}
			break
		case thePaletteMode.automatic:
		default:
			const saturation = 90
			const luminance = vscode.window.activeColorTheme.kind === ColorThemeKind.Light ? 30 : 80
			// Colors is a map of TextEditorDecorationType for 10 colors
			colors = [0.0, 0.5, 0.1, 0.6, 0.2, 0.7, 0.3, 0.8, 0.4, 0.9].map(hue => {
				const hex = colorConvert.hsl.hex([360.0 * hue, saturation, luminance])
				return vscode.window.createTextEditorDecorationType({ color: `#${hex}` })
			})
	}
}

