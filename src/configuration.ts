import * as vscode from 'vscode'
import { ColorThemeKind } from 'vscode'
import * as colorConvert from 'color-convert'

export const Method = {
	sequential: 'sequential',
	hash: 'hash'
}

const PaletteMode = {
	automatic: 'automatic',
	manual: 'manual'
}

export function updateConfiguration() {
	// using a ternay operator instead of a null coalescing operator
	const configuration = !!vscode.workspace.getConfiguration('colorIdentifiersMode') ? vscode.workspace.getConfiguration('colorIdentifiersMode') : {};
	tokenKinds = !!configuration.get('tokenKinds') ? new Set(configuration.get('tokenKinds')) : new Set([]);
	ignoredLanguages = !!configuration.get('ignoredLanguages') ? new Set(configuration.get('ignoredLanguages')) : new Set([]);
	method = !!configuration.get('method') ? configuration.get('method') : Method.sequential;
	paletteMode = !!configuration.get('paletteMode') ? configuration.get('paletteMode') : PaletteMode.automatic;
	generatePalette();
}

// https://blog.devgenius.io/when-to-use-null-undefined-or-empty-array-d45244ffc565
// ?? null coalescing operator "not null" ?? "if null"
// [] is the same as new Array<type>()
// !!variable A syntax to test for false like variables which return false if null or undefined
// const var_name: Type = expression
export function generatePalette() {
	colors.forEach(color => color.dispose())
	switch (paletteMode) {
		case PaletteMode.manual:
			const configuration = !!vscode.workspace.getConfiguration('colorIdentifiersMode') ? vscode.workspace.getConfiguration('colorIdentifiersMode') : {};
			const colorNames: string[] = !!configuration.get('manualColors') ? configuration.get('manualColors') : [];
			colors = colorNames.map(color => vscode.window.createTextEditorDecorationType({ color }));
			break
		case PaletteMode.automatic:
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

let paletteMode = PaletteMode.automatic
export let tokenKinds: Set<string> = new Set(['variable', 'parameter', 'property'])
export let ignoredLanguages: Set<string> = new Set()
export let method: string = Method.sequential
export let colors = [
	'#FF00FF'
].map(color => vscode.window.createTextEditorDecorationType({ color }))
