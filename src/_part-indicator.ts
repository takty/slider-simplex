/**
 * Indicators
 *
 * @author Takuto Yanagida
 * @version 2025-03-05
 */

const NS            = 'slider-simplex';
const CLS_SLIDE_CNT = NS + '-slide-count';
const CLS_SLIDE_IDX = NS + '-slide-index';

let slideCntElms: HTMLElement[] = [];
let slideIdxElms: HTMLElement[] = [];

export function initIndicators(size: number, root: HTMLElement): void {
	slideCntElms = root.querySelectorAll('.' + CLS_SLIDE_CNT) as unknown as HTMLElement[];
	slideIdxElms = root.querySelectorAll('.' + CLS_SLIDE_IDX) as unknown as HTMLElement[];
	for (const elm of slideCntElms) elm.innerHTML = '' + size;
	for (const elm of slideIdxElms) elm.innerHTML = '' + 1;
}

export function transitionIndicators(idx: number): void {
	for (const elm of slideIdxElms) elm.innerHTML = '' + (idx + 1);
}
