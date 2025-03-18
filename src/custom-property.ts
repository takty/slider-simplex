/**
 * Custom Property Utilities
 *
 * @author Takuto Yanagida
 * @version 2025-03-17
 */

export function getStylePropertyBool(elm: HTMLElement, prop: string, def: boolean = false): boolean {
	let v: string = getComputedStyle(elm).getPropertyValue(prop).trim();
	if (('"' === v.at(0) && '"' === v.at(-1)) || ("'" === v.at(0) && "'" === v.at(-1))) {
		v = v.slice(1, -1);
	}
	if (!v.length) return def;
	if (typeof v !== 'string') return Boolean(v);
	try {
		return true === JSON.parse(v.toLowerCase());
	} catch (e) {
		return v.length !== 0;
	}
}

export function getStylePropertyFloat(elm: HTMLElement, prop: string, def: number = 0): number {
	let v: string = getComputedStyle(elm).getPropertyValue(prop).trim();
	if (('"' === v.at(0) && '"' === v.at(-1)) || ("'" === v.at(0) && "'" === v.at(-1))) {
		v = v.slice(1, -1);
	}
	if (!v.length) return def;
	return parseFloat(v);
}

export function getStylePropertyString(elm: HTMLElement, prop: string, def: string = ''): string {
	let v: string = getComputedStyle(elm).getPropertyValue(prop).trim();
	console.log(getComputedStyle(elm).getPropertyValue(prop));
	if (('"' === v.at(0) && '"' === v.at(-1)) || ("'" === v.at(0) && "'" === v.at(-1))) {
		v = v.slice(1, -1);
	}
	if (!v.length) return def;
	return (typeof v === 'string') ? v : String(v);
}
