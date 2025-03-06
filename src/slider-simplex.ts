/**
 * Slider Simplex - Show
 *
 * @author Takuto Yanagida
 * @version 2022-11-04
 */

import { Slide } from './_class-slide';
import { asyncTimeout, initViewportDetection, onLoad, initResizeEventHandler, onResize } from './_common';
import { initButtons } from './_part-button';
import { initRivets, transitionRivets } from './_part-rivet';
import { initIndicators, transitionIndicators } from './_part-indicator';
import { initThumbnails, transitionThumbnails } from './_part-thumbnail.js';
import { initBackgrounds, transitionBackgrounds } from './_part-background.js';

import { Transition } from './_transition';
import { TransitionFade } from './_transition-fade';
import { TransitionSlide } from './_transition-slide';
import { TransitionScroll } from './_transition-scroll';

const NS          = 'slider-simplex';
const CLS_FRAME   = NS + '-frame';
const CLS_SLIDES  = NS + '-slides';
const CLS_START   = 'start';
const CLS_VIEW    = 'view';
const CLS_PAUSE   = 'pause';
const CLS_SCROLL  = 'scroll';
const OFFSET_VIEW = 100;

interface SliderOptions {
	is_show?           : boolean;
	effect_type?       : string;
	duration_time?     : number;
	transition_time?   : number;
	random_timing?     : boolean;
	background_visible?: boolean;
	side_slide_visible?: boolean;
}

export function slider_show(id: string, opts: SliderOptions = {}) {
	const root: HTMLElement = id ? document.getElementById(id) as HTMLElement : document.getElementsByClassName(NS)[0] as HTMLElement;
	if (!root) return;

	const isShow: boolean = opts?.is_show ?? true;

	const effectType  : string  = opts?.effect_type     ?? 'slide';  // 'scroll' or 'fade'
	const timeDur     : number  = opts?.duration_time   ?? 8;  // [second]
	const timeTran    : number  = opts?.transition_time ?? 1;  // [second]
	const randomTiming: boolean = opts?.random_timing   ?? false;

	let bgVisible: boolean = false;
	let sideVisible: boolean = false;
	if (isShow) {
		bgVisible      = opts?.background_visible ?? true;
		sideVisible    = opts?.side_slide_visible ?? false;

		root.style.setProperty('--transition-time', `${timeTran}s`);

		if (effectType !== 'scroll') sideVisible = false;
		if (sideVisible) {
			bgVisible = false;
			const ss = root.querySelector('.' + CLS_SLIDES) as HTMLElement;
			ss.style.overflow = 'visible';
		}
	}

	const lis: HTMLLIElement[] = Array.prototype.slice.call(root.querySelectorAll(`.${CLS_SLIDES} > li`));
	const size: number = lis.length;
	const sss: Slide[] = [];
	let effect!: Transition;

	let onTransitionEnd: (() => void) | null = null;


	// -------------------------------------------------------------------------


	const hasVideo = initSlides();
	if (isShow) {
		if (bgVisible) initBackgrounds(size, root, lis);
	}
	if (hasVideo) setTimeout(tryResizeVideo, 100);
	function tryResizeVideo() {
		const finish = onResizeSlide();
		if (!finish) setTimeout(tryResizeVideo, 100);
	}
	if (isShow) {
		const frame = root.getElementsByClassName(CLS_FRAME)[0] as HTMLElement;
		if (0 < navigator.maxTouchPoints) {
			frame.addEventListener('pointerenter', (e: PointerEvent): void => {
				const m = (e.pointerType === 'mouse') ? 'remove' : 'add';
				frame.classList[m]('touch');
			}, { once: true });
		}
	}
	onLoad(() => {
		initResizeEventHandler();
		if (isShow) {
			initButtons(timeTran, size, root, transition);
			initThumbnails(id, size);
			initIndicators(size, root);
			initRivets(id, size, root, transition);
		}
		initViewportDetection(root, CLS_VIEW, OFFSET_VIEW);

		transition(0, 0);
		console.log(`Slider Simplex - Show (#${id}): started`);
		setTimeout(() => root.classList.add(CLS_START), 0);
	});


	// -------------------------------------------------------------------------


	function initSlides() {
		if (isShow) {
			if (effectType === 'scroll' && 1 < size && size < 5) {
				cloneLis();
				if (size === 2) cloneLis();
			}
		}
		const isScroll = root.classList.contains(CLS_SCROLL);
		let hasVideo = false;

		for (let i = 0; i < lis.length; i += 1) {
			if (isScroll) lis[i].classList.add(CLS_SCROLL);

			const ss = new Slide(lis[i], i);
			if ('video' === ss.getType()) hasVideo = true;
			sss.push(ss);
		}
		onResize(onResizeSlide, true);
		switch (effectType) {
			case 'slide' : effect = new TransitionSlide(size, lis, timeTran); break;
			case 'scroll': effect = new TransitionScroll(size, lis, timeTran); break;
			case 'fade'  : effect = new TransitionFade(size, lis, timeTran); break;
			default      : effect = new TransitionSlide(size, lis, timeTran); break;
		}
		return hasVideo;
	}

	function onResizeSlide() {
		let finish = true;
		for (const ss of sss) {
			if (!ss.onResize()) finish = false;
		}
		return finish;
	}

	function cloneLis() {
		for (let i = 0; i < size; i += 1) {
			const li: HTMLLIElement = lis[i];
			const nls = li.cloneNode(true) as HTMLLIElement;
			lis.push(nls);
			li.parentNode?.appendChild(nls);
		}
	}


	// -------------------------------------------------------------------------


	let curIdx   : number        = 0;
	let stStep   : { set: () => Promise<void>, clear: () => void } | null = null;
	let last     : number        = 0;
	let stReserve: number | null = null;

	async function transition(idx: number | null, dir: number): Promise<void> {
		[idx, dir] = getIdxDir(idx, dir);

		const t = window.performance.now();
		if (dir !== 0 && t - last < timeTran * 1000) {
			if (stReserve) clearTimeout(stReserve);
			stReserve = setTimeout(() => transition(idx, dir), timeTran * 1000 - (t - last));
			return;
		}
		last = t;

		for (const ss of sss) ss.onPreDisplay(idx, size);
		for (const ss of sss) ss.transition(idx, size);
		if (isShow) {
			transitionBackgrounds(idx, size);
			transitionThumbnails(idx);
			transitionIndicators(idx);
			transitionRivets(idx);
		}
		await effect.transition(idx, dir);
		if (onTransitionEnd) onTransitionEnd();
		curIdx = idx;
		display(idx);
	}

	async function display(idx: number) {
		for (const ss of sss) ss.display(idx, size);
		if (size === 1) return;

		const dt = sss[idx].getDuration(timeDur, timeTran, randomTiming);
		if (stStep) stStep.clear();
		stStep = asyncTimeout(Math.ceil(dt * 1000), step);
		await stStep.set();
	}

	async function step() {
		if (root.classList.contains(CLS_VIEW) && !root.classList.contains(CLS_PAUSE)) {
			transition(null, 1);
		} else {
			asyncTimeout(timeDur * 1000, step).set();
		}
	}

	function getIdxDir(idx: number | null, dir: number) {
		if (idx === null) {
			idx = curIdx + dir;
			if (size - 1 < idx) idx = 0;
			if (idx < 0) idx = size - 1;
		} else if (dir === 0 && curIdx !== idx) {
			const r = (curIdx < idx) ? idx - curIdx : idx + size - curIdx;
			const l = (idx < curIdx) ? curIdx - idx : curIdx + size - idx;
			dir = (l < r) ? -1 : 1;
		}
		return [idx, dir];
	}


	// -------------------------------------------------------------------------


	const fs = {
		move: (idx: number) => transition(idx, size === 2 ? 1 : 0),
		next: ()  => transition((curIdx === size - 1) ? 0          : (curIdx + 1),  1),
		prev: ()  => transition((curIdx === 0       ) ? (size - 1) : (curIdx - 1), -1),

		onTransitionEnd: (fn: () => void): void => { onTransitionEnd = fn; }
	};
	return fs;

}
