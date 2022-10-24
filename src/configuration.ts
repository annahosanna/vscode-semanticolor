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
			// Hue could really be split into 640 shades (assuming 320 is max)
			// Hue goes to 360, but that is the same as hue 0, so max out a little low - like 320
			// The way this is calculating colors is almost sequential
			// So change the saturation a bit where values might otherwise be close
			// colors = [0.0, 0.5, 0.1, 0.6, 0.2, 0.7, 0.3, 0.8, 0.4, 0.9].map(hue => {
			colors = [0.0, 0.2, 0.4, 0.6, 0.8, 0.1, 0.3, 0.5, 0.7, 0.9].map(hue => {
				// const hex = colorConvert.hsl.hex([hue * 360, saturation, luminance])
				const hex = colorConvert.hsl.hex([(hue * 360.0) % 324, ((((hue * 360.0) % 324) % 5) * 6) + 50, luminance])
				return vscode.window.createTextEditorDecorationType({ color: `#${hex}` })
			})
	}
}

