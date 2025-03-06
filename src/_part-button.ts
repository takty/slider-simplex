/**
 * Buttons
 *
 * @author Takuto Yanagida
 * @version 2022-07-28
 */

const NS = 'slider-simplex';

const CLS_FRAME = NS + '-frame';
const CLS_PREV  = NS + '-prev';
const CLS_NEXT  = NS + '-next';

const CLS_ACTIVE = 'active';
const DX_FLICK   = 32;

export function initButtons(timeTran: number, size: number, root: HTMLElement, transitionFn: ( idx: number | null, dir: number ) => Promise<void>): void {
	const frame   = root.getElementsByClassName(CLS_FRAME)[0] as HTMLElement;
	const prevBtn = root.getElementsByClassName(CLS_PREV)[0] as HTMLElement;
	const nextBtn = root.getElementsByClassName(CLS_NEXT)[0] as HTMLElement;
	if (size === 1) {
		if (prevBtn) prevBtn.style.display = 'none';
		if (nextBtn) nextBtn.style.display = 'none';
		return;
	}
	const prevFn = async () => { await transitionFn(null, -1); };
	const nextFn = async () => { await transitionFn(null,  1); };
	if (prevBtn) prevBtn.addEventListener('click', async () => { frame.dataset.disabled = 'true'; await prevFn(); frame.dataset.disabled = 'false'; });
	if (nextBtn) nextBtn.addEventListener('click', async () => { frame.dataset.disabled = 'true'; await nextFn(); frame.dataset.disabled = 'false'; });
	if (window.ontouchstart === null) _initFlick(timeTran, frame, prevFn, nextFn, prevBtn, nextBtn);
}

function _initFlick(timeTran: number, frame: HTMLElement, prevFn: () => void, nextFn: () => void, prevBtn: HTMLElement, nextBtn: HTMLElement): void {
	const sts = { prev: 0, next: 0 };
	let px: number | null = null;

	frame.addEventListener('touchstart', e => { px = e.touches[0].pageX; });
	frame.addEventListener('touchmove', e => {
		if (px === null) return;
		const x = e.changedTouches[0].pageX;

		if (px + DX_FLICK < x) {  // ->
			prevFn();
			_setCommonFlickProcess(timeTran, e, prevBtn, 'prev', sts);
			px = null;
		} else if (x < px - DX_FLICK) {  // <-
			nextFn();
			_setCommonFlickProcess(timeTran, e, nextBtn, 'next', sts);
			px = null;
		}
	});
	frame.addEventListener('touchend', () => { px = null; });
}

function _setCommonFlickProcess(timeTran: number, e: TouchEvent, btn: HTMLElement, which: 'prev' | 'next', sts: { prev: number, next: number }): void {
	if (e.cancelable === true) e.preventDefault();
	if (!btn) return;
	clearTimeout(sts[which]);
	btn.classList.add(CLS_ACTIVE);
	sts[which] = setTimeout(() => { btn.classList.remove(CLS_ACTIVE); }, timeTran * 1000 / 2);
}
