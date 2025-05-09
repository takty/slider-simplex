/**
 * Indicators
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

const CLS_SLIDE_CNT = 'slide-count';
const CLS_SLIDE_IDX = 'slide-index';

export class Indicator {

	#ies: HTMLElement[] = [];

	constructor(root: HTMLElement, size: number) {
		const ces = Array.from(root.querySelectorAll<HTMLElement>('.' + CLS_SLIDE_CNT));
		for (const elm of ces) {
			elm.innerHTML = `${size}`;
		}
		this.#ies = Array.from(root.querySelectorAll<HTMLElement>('.' + CLS_SLIDE_IDX));
		for (const elm of this.#ies) {
			elm.innerHTML = '1';
		}
	}

	transition(idx: number): void {
		for (const e of this.#ies) {
			e.innerHTML = `${idx + 1}`;
		}
	}
}
