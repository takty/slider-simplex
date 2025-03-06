/**
 * Backgrounds
 *
 * @author Takuto Yanagida
 * @version 2022-11-04
 */

const NS      = 'slider-simplex';
const CLS_BGS = NS + '-backgrounds';

const CLS_VISIBLE = 'visible';

const bgs: HTMLDivElement[] = [];

export function initBackgrounds(size: number, root: Element, lis: HTMLLIElement[]): void {
	const frame: HTMLDivElement = document.createElement('div');
	frame.classList.add(CLS_BGS);
	root.insertBefore(frame, root.firstChild);

	for (let i = 0; i < size; i += 1) {
		const li  = lis[i];
		const bg  = document.createElement('div');
		const img: HTMLImageElement = li.querySelector(':scope img') as HTMLImageElement;
		if (img) {
			bg.style.backgroundImage = `url('${img.src}')`;
		}
		frame.appendChild(bg);
		bgs.push(bg);
	}
}

export function transitionBackgrounds(idx: number, size: number): void {
	for (let i = 0; i < size; i += 1) {
		if (!bgs[i]) continue;
		bgs[i].classList[i === idx ? 'add' : 'remove'](CLS_VISIBLE);
	}
}
