/**
 * Slider Simplex - Show
 *
 * @author Takuto Yanagida
 * @version 2025-03-14
 */

import { Slide } from './_class-slide';
import { asyncTimeout, initViewportDetection, onLoad, initResizeEventHandler, onResize } from './_common';
import { Navigation } from './_part-navigation';
import { Pagination } from './_part-pagination';
import { Indicator } from './_part-indicator';
import { Selector } from './_part-selector.js';
import { Background } from './_part-background.js';

import { Transition } from './_transition';
import { TransitionFade } from './_transition-fade';
import { TransitionSlide } from './_transition-slide';
import { TransitionScroll } from './_transition-scroll';

const NS          = 'slider-simplex';
const CLS_FRAME   = 'frame';
const CLS_SLIDES  = 'slides';

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
	const root = id ? document.getElementById(id) as HTMLElement : document.getElementsByClassName(NS)[0] as HTMLElement;
	if (root) {
		return new Slider(root, opts);
	}
	return null;
}

export class Slider {

	root  : HTMLElement;
	isShow: boolean;

	effectType  : string
	timeDur     : number
	timeTran    : number
	randomTiming: boolean

	bgVisible  : boolean;
	sideVisible: boolean;

	lis    : HTMLLIElement[];
	size   : number;
	sss    : Slide[] = [];
	effect!: Transition;

	onTransitionEnd: (() => void) | null = null;

	selector  : Selector   | null = null;
	indicator : Indicator  | null = null;
	pagination: Pagination | null = null;
	background: Background | null = null;

	constructor(root: HTMLElement, opts: SliderOptions = {}) {
		this.root = root;

		this.isShow = opts?.is_show ?? true;

		this.effectType   = opts?.effect_type     ?? 'slide';  // 'scroll' or 'fade'
		this.timeDur      = opts?.duration_time   ?? 8;  // [second]
		this.timeTran     = opts?.transition_time ?? 1;  // [second]
		this.randomTiming = opts?.random_timing   ?? false;

		this.bgVisible   = false;
		this.sideVisible = false;
		if (this.isShow) {
			this.bgVisible      = opts?.background_visible ?? true;
			this.sideVisible    = opts?.side_slide_visible ?? false;

			this.root.style.setProperty('--transition-time', `${this.timeTran}s`);

			if (this.effectType !== 'scroll') this.sideVisible = false;
			if (this.sideVisible) {
				this.bgVisible = false;
				const ss = this.root.querySelector('.' + CLS_SLIDES) as HTMLElement;
				ss.style.overflow = 'visible';
			}
		}

		this.lis  = Array.prototype.slice.call(this.root.querySelectorAll(`.${CLS_SLIDES} > li`));
		this.size = this.lis.length;


		// -------------------------------------------------------------------------


		const hasVideo = this.initSlides();
		if (this.isShow) {
			if (this.bgVisible) this.background = new Background(this.root, this.lis);
		}
		const tryResizeVideo = () => {
			const finish: boolean = this.onResizeSlide();
			if (!finish) setTimeout(tryResizeVideo, 100);
		}
		if (hasVideo) setTimeout(tryResizeVideo, 100);
		if (this.isShow) {
			if (0 < navigator.maxTouchPoints) {
				const frame = this.root.getElementsByClassName(CLS_FRAME)[0] as HTMLElement;
				frame.addEventListener('pointerenter', (e: PointerEvent): void => {
					const m = (e.pointerType === 'mouse') ? 'remove' : 'add';
					this.root.classList[m]('touch');
				}, { once: true });
			}
		}

		onLoad(() => {
			initResizeEventHandler();
			if (this.isShow) {
				Navigation.create(this.root, this.size, (idx: number, dir: number) => this.transition(idx, dir), this.timeTran);
				this.selector   = new Selector(this.root, this.lis, this.size, (idx: number, dir: number) => this.transition(idx, dir));
				this.indicator  = new Indicator(this.root, this.size);
				this.pagination = Pagination.create(this.root, this.size, (idx: number, dir: number) => this.transition(idx, dir));
			}
			initViewportDetection(this.root, CLS_VIEW, OFFSET_VIEW);

			this.transition(0, 0);
			console.log(`Slider Simplex - Show (#${this.root.id}): started`);
			setTimeout(() => this.root.classList.add(CLS_START), 0);
		});
	}

	getController() {
		const fs = {
			move: (idx: number) => this.transition(idx, this.size === 2 ? 1 : 0),
			next: ()  => this.transition((this.curIdx === this.size - 1) ? 0          : (this.curIdx + 1),  1),
			prev: ()  => this.transition((this.curIdx === 0       ) ? (this.size - 1) : (this.curIdx - 1), -1),

			onTransitionEnd: (fn: () => void): void => { this.onTransitionEnd = fn; }
		};
		return fs;
	}


	// -------------------------------------------------------------------------


	initSlides() {
		if (this.isShow) {
			if (this.effectType === 'scroll' && 1 < this.size && this.size < 5) {
				this.cloneLis();
				if (this.size === 2) this.cloneLis();
			}
		}
		const isScroll = this.root.classList.contains(CLS_SCROLL);
		let hasVideo = false;

		for (let i = 0; i < this.lis.length; i += 1) {
			if (isScroll) this.lis[i].classList.add(CLS_SCROLL);

			const ss = new Slide(this.lis[i], i);
			if ('video' === ss.getType()) hasVideo = true;
			this.sss.push(ss);
		}
		onResize(() => this.onResizeSlide(), true);
		switch (this.effectType) {
			case 'slide' : this.effect = new TransitionSlide(this.size, this.lis, this.timeTran); break;
			case 'scroll': this.effect = new TransitionScroll(this.size, this.lis, this.timeTran); break;
			case 'fade'  : this.effect = new TransitionFade(this.size, this.lis, this.timeTran); break;
			default      : this.effect = new TransitionSlide(this.size, this.lis, this.timeTran); break;
		}
		return hasVideo;
	}

	onResizeSlide() {
		let finish = true;
		for (const ss of this.sss) {
			if (!ss.onResize()) finish = false;
		}
		return finish;
	}

	cloneLis() {
		for (let i = 0; i < this.size; i += 1) {
			const li: HTMLLIElement = this.lis[i];
			const nls = li.cloneNode(true) as HTMLLIElement;
			this.lis.push(nls);
			li.parentNode?.appendChild(nls);
		}
	}


	// -------------------------------------------------------------------------


	curIdx   : number        = 0;
	stStep   : { set: () => Promise<void>, clear: () => void } | null = null;
	last     : number        = 0;
	stReserve: number | null = null;

	async transition(idx: number, dir: number): Promise<void> {
		[idx, dir] = this.getIdxDir(idx, dir);

		const t = window.performance.now();
		if (dir !== 0 && t - this.last < this.timeTran * 1000) {
			if (this.stReserve) clearTimeout(this.stReserve);
			this.stReserve = setTimeout(() => this.transition(idx, dir), this.timeTran * 1000 - (t - this.last));
			return;
		}
		this.last = t;

		for (const ss of this.sss) ss.onPreDisplay(idx, this.size);
		for (const ss of this.sss) ss.transition(idx, this.size);
		if (this.isShow) {
			if (this.background) this.background.transition(idx);
			if (this.selector)   this.selector.transition(idx);
			if (this.indicator)  this.indicator.transition(idx);
			if (this.pagination) this.pagination.transition(idx);
		}
		await this.effect.transition(idx, dir);
		if (this.onTransitionEnd) this.onTransitionEnd();
		this.curIdx = idx;
		this.display(idx);
	}

	async display(idx: number) {
		for (const ss of this.sss) ss.display(idx, this.size);
		if (this.size === 1) return;

		const dt = this.sss[idx].getDuration(this.timeDur, this.timeTran, this.randomTiming);
		if (this.stStep) this.stStep.clear();
		this.stStep = asyncTimeout(Math.ceil(dt * 1000), this.step);
		await this.stStep.set();
	}

	async step() {
		if (this.root.classList.contains(CLS_VIEW) && !this.root.classList.contains(CLS_PAUSE)) {
			this.transition(-1, 1);
		} else {
			asyncTimeout(this.timeDur * 1000, this.step).set();
		}
	}

	getIdxDir(idx: number, dir: number): [number, number] {
		if (idx === -1) {
			idx = this.curIdx + dir;
			if (this.size - 1 < idx) idx = 0;
			if (idx < 0) idx = this.size - 1;
		} else if (dir === 0 && this.curIdx !== idx) {
			const r = (this.curIdx < idx) ? idx - this.curIdx : idx + this.size - this.curIdx;
			const l = (idx < this.curIdx) ? this.curIdx - idx : this.curIdx + this.size - idx;
			dir = (l < r) ? -1 : 1;
		}
		return [idx, dir];
	}

}
