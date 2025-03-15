/**
 * Indicators
 *
 * @author Takuto Yanagida
 * @version 2025-03-13
 */

const CLS_SLIDE_CNT = 'slide-count';
const CLS_SLIDE_IDX = 'slide-index';

export class Indicator {

	#ies: HTMLElement[] = [];

	constructor(root: HTMLElement, size: number) {
		const ces = root.querySelectorAll('.' + CLS_SLIDE_CNT) as any as HTMLElement[];
		for (const elm of ces) {
			elm.innerHTML = '' + size;
		}
		this.#ies = root.querySelectorAll('.' + CLS_SLIDE_IDX) as any as HTMLElement[];
		for (const elm of this.#ies) {
			elm.innerHTML = '' + 1;
		}
	}

	transition(idx: number): void {
		for (const e of this.#ies) {
			e.innerHTML = '' + (idx + 1);
		}
	}
}
