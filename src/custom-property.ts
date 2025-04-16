/**
 * Custom Property Utilities
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

export function getStylePropertyBool(
	elm: HTMLElement,
	prop: string,
	def?: boolean
): boolean;

export function getStylePropertyBool(
	elm: HTMLElement,
	prop: string,
	def: null
): boolean | null;

export function getStylePropertyBool(elm: HTMLElement, prop: string, def: boolean | null = false): boolean | null {
	const v: string = getPropValue(elm, prop);
	if (!v) return def;
	try {
		return true === JSON.parse(v.toLowerCase());
	} catch (e) {
		return true;
	}
}

export function getStylePropertyFloat(elm: HTMLElement, prop: string, def: number = 0): number {
	const v: string = getPropValue(elm, prop);
	const n: number = parseFloat(v);
	return isNaN(n) ? def : n;
}

export function getStylePropertyString(elm: HTMLElement, prop: string, def: string = ''): string {
	const v: string = getPropValue(elm, prop);
	return v || def;
}

function getPropValue(elm: HTMLElement, prop: string): string {
	let v: string = getComputedStyle(elm).getPropertyValue(prop).trim();
	if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
		v = v.slice(1, -1);
	}
	return v;
}
