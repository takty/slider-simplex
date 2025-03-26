/**
 * Custom Property Utilities
 *
 * @author Takuto Yanagida
 * @version 2025-03-26
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
	if (!v.length) return def;
	if (typeof v !== 'string') return Boolean(v);
	try {
		return true === JSON.parse(v.toLowerCase());
	} catch (e) {
		return v.length !== 0;
	}
}

export function getStylePropertyFloat(elm: HTMLElement, prop: string, def: number = 0): number {
	const v: string = getPropValue(elm, prop);
	if (!v.length) return def;
	return parseFloat(v);
}

export function getStylePropertyString(elm: HTMLElement, prop: string, def: string = ''): string {
	const v: string = getPropValue(elm, prop);
	if (!v.length) return def;
	return (typeof v === 'string') ? v : String(v);
}

function getPropValue(elm: HTMLElement, prop: string): string {
	let v: string = getComputedStyle(elm).getPropertyValue(prop).trim();
	if (('"' === v.at(0) && '"' === v.at(-1)) || ("'" === v.at(0) && "'" === v.at(-1))) {
		v = v.slice(1, -1);
	}
	return v;
}
