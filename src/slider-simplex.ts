/**
 * Slider Simplex
 *
 * @author Takuto Yanagida
 * @version 2025-03-18
 */

import { getStylePropertyBool, getStylePropertyFloat, getStylePropertyString } from './custom-property';

import { repeatUntil, detectTouch, asyncTimeout, AsyncTimeoutHandle, initializeViewportDetection, callAfterDocumentReady } from './_common';
import { Slide } from './_class-slide';
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
const CLS_SLIDES  = 'slides';

const CLS_START   = 'start';
const CLS_VIEW    = 'view';
const CLS_PAUSE   = 'pause';
const CLS_SCROLL  = 'scroll';
const OFFSET_VIEW = 100;

const CP_EFFECT_TYPE      = '--effect-type';
const CP_DURATION_TIME    = '--duration-time';
const CP_TRANSITION_TIME  = '--transition-time';
const CP_RANDOMIZE_TIMING = '--randomize-timing';

const CP_SHOW_BACKGROUND  = '--show-background';
const CP_SHOW_SIDE_SLIDE  = '--show-side-slide';

const CP_CREATE_NAVIGATION = '--create-navigation';
const CP_CREATE_PAGINATION = '--create-pagination';
const CP_CREATE_SELECTOR   = '--create-selector';

export class SliderSimplex {

	static create(id: string | null): SliderSimplex | null {
		if (id) {
			const r: HTMLElement = document.getElementById(id) as HTMLElement;
			if (r) {
				return new SliderSimplex(r);
			}
		} else {
			for (const r of document.getElementsByClassName(NS)) {
				new SliderSimplex(r as HTMLElement);
			}
		}
		return null;
	}

	#root: HTMLElement;

	#effectType      : string
	#timeDur         : number
	#timeTran        : number
	#randomizeTiming : boolean

	#showBackground  : boolean;
	#showSideSlide   : boolean;

	#createNavigation: boolean;
	#createPagination: boolean;
	#createSelector  : boolean;

	#lis    : HTMLLIElement[];
	#size   : number;
	#slides : Slide[] = [];
	#effect!: Transition;

	#onTransitionEnd: (() => void) | null = null;

	#selector  : Selector   | null = null;
	#indicator : Indicator  | null = null;
	#pagination: Pagination | null = null;
	#background: Background | null = null;

	curIdx   : number        = 0;
	stStep   : AsyncTimeoutHandle | null = null;
	lastTime : number        = 0;
	stReserve: number | null = null;

	constructor(root: HTMLElement) {
		this.#root = root;

		this.#effectType       = getStylePropertyString(this.#root, CP_EFFECT_TYPE, 'fade');
		this.#timeDur          = getStylePropertyFloat(this.#root, CP_DURATION_TIME, 8);
		this.#timeTran         = getStylePropertyFloat(this.#root, CP_TRANSITION_TIME, 1);
		this.#randomizeTiming  = getStylePropertyBool(this.#root, CP_RANDOMIZE_TIMING);

		this.#showBackground   = getStylePropertyBool(this.#root, CP_SHOW_BACKGROUND, false);
		this.#showSideSlide    = getStylePropertyBool(this.#root, CP_SHOW_SIDE_SLIDE, false);

		this.#createNavigation = getStylePropertyBool(this.#root, CP_CREATE_NAVIGATION);
		this.#createPagination = getStylePropertyBool(this.#root, CP_CREATE_PAGINATION);
		this.#createSelector   = getStylePropertyBool(this.#root, CP_CREATE_SELECTOR);

		const ul = this.#root.querySelector('.' + CLS_SLIDES) as HTMLElement;

		this.#lis  = Array.from(ul.getElementsByTagName('li'));
		this.#size = this.#lis.length;

		if (this.#showBackground) {
			this.#background = new Background(this.#root, this.#lis);
		}
		if (this.#showSideSlide) {
			ul.style.overflow = 'visible';
		}
		const hasVideo: boolean = this.initSlides();
		if (hasVideo) {
			repeatUntil(100, (): boolean => this.onResizeSlide());
		}
		detectTouch(this.#root);
		initializeViewportDetection(this.#root, CLS_VIEW, OFFSET_VIEW);
		callAfterDocumentReady((): void => this.onLoad());
	}

	getController() {
		const fs = {
			move: (idx: number): Promise<void> => this.transition(idx, this.#size === 2 ? 1 : 0),
			next: (): Promise<void> => this.transition((this.curIdx === this.#size - 1) ? 0               : (this.curIdx + 1),  1),
			prev: (): Promise<void> => this.transition((this.curIdx === 0            ) ? (this.#size - 1) : (this.curIdx - 1), -1),

			onTransitionEnd: (fn: () => void): void => { this.#onTransitionEnd = fn; }
		};
		return fs;
	}


	// -------------------------------------------------------------------------


	private initSlides(): boolean {
		if (this.#effectType === 'scroll' && 1 < this.#size && this.#size < 5) {
			this.cloneLis();
			if (this.#size === 2) {
				this.cloneLis();
			}
		}
		const isScroll: boolean = this.#root.classList.contains(CLS_SCROLL);
		let hasVideo: boolean = false;

		for (const li of this.#lis) {
			if (isScroll) {
				li.classList.add(CLS_SCROLL);
			}
			const slide = new Slide(li);
			if ('video' === slide.getType()) {
				hasVideo = true;
			}
			this.#slides.push(slide);
		}
		const ro = new ResizeObserver((): boolean => this.onResizeSlide());
		ro.observe(this.#root);

		switch (this.#effectType) {
			case 'scroll': this.#effect = new TransitionScroll(this.#size, this.#lis, this.#timeTran); break;
			case 'slide' : this.#effect = new TransitionSlide(this.#size, this.#lis, this.#timeTran); break;
			case 'fade'  :
			default      : this.#effect = new TransitionFade(this.#size, this.#lis, this.#timeTran); break;
		}
		return hasVideo;
	}

	private cloneLis(): void {
		for (let i: number = 0; i < this.#size; i += 1) {
			const li: HTMLLIElement = this.#lis[i];
			const nls = this.#lis[i].cloneNode(true) as HTMLLIElement;
			this.#lis.push(nls);
			li.parentNode?.appendChild(nls);
		}
	}

	private onResizeSlide(): boolean {
		let finish: boolean = true;
		for (const s of this.#slides) {
			if (!s.onResize()) finish = false;
		}
		return finish;
	}

	private onLoad() {
		if (1 < this.#size) {
			const fn = (idx: number, dir: number) => this.transition(idx, dir);

			new Navigation(this.#root, this.#timeTran, fn, this.#createNavigation);
			this.#pagination = new Pagination(this.#root, this.#size, fn, this.#createPagination);
			this.#selector   = new Selector(this.#root, this.#lis, this.#size, fn, this.#createSelector);
		}
		this.#indicator = new Indicator(this.#root, this.#size);

		this.transition(0, 0);
		setTimeout((): void => this.#root.classList.add(CLS_START), 200);
		console.log(`Slider Simplex (#${this.#root.id}): started`);
	}


	// -------------------------------------------------------------------------


	private async transition(idx: number, dir: number): Promise<void> {
		[idx, dir] = this.getIdxDir(idx, dir);

		const t: number = window.performance.now();
		if (dir !== 0 && t - this.lastTime < this.#timeTran * 1000) {
			if (this.stReserve) clearTimeout(this.stReserve);
			this.stReserve = setTimeout((): Promise<void> => this.transition(idx, dir), this.#timeTran * 1000 - (t - this.lastTime));
			return;
		}
		this.lastTime = t;

		for (let i: number = 0; i < this.#slides.length; i += 1) {
			this.#slides[i].onPreDisplay((i % this.#size) === idx);
		}
		for (let i: number = 0; i < this.#slides.length; i += 1) {
			this.#slides[i].transition((i % this.#size) === idx, this.#size);
		}
		if (this.#background) this.#background.transition(idx);
		if (this.#pagination) this.#pagination.transition(idx);
		if (this.#indicator)  this.#indicator.transition(idx);
		if (this.#selector)   this.#selector.transition(idx);

		await this.#effect.transition(idx, dir);
		if (this.#onTransitionEnd) this.#onTransitionEnd();
		this.curIdx = idx;
		this.display(idx);
	}

	private async display(idx: number): Promise<void> {
		for (let i: number = 0; i < this.#slides.length; i += 1) {
			this.#slides[i].display((i % this.#size) === idx);
		}
		if (this.#size === 1) return;

		const dt: number = this.#slides[idx].getDuration(this.#timeDur, this.#timeTran, this.#randomizeTiming);
		if (this.stStep) {
			this.stStep.clear();
		}
		this.stStep = asyncTimeout(Math.ceil(dt * 1000), (): Promise<void> => this.step());
		await this.stStep.set();
	}

	private async step(): Promise<void> {
		if (this.#root.classList.contains(CLS_VIEW) && !this.#root.classList.contains(CLS_PAUSE)) {
			this.transition(-1, 1);
		} else {
			asyncTimeout(this.#timeDur * 1000, (): Promise<void> => this.step()).set();
		}
	}

	private getIdxDir(idx: number, dir: number): [number, number] {
		if (idx === -1) {
			idx = this.curIdx + dir;
			if (this.#size - 1 < idx) idx = 0;
			if (idx < 0) idx = this.#size - 1;
		} else if (dir === 0 && this.curIdx !== idx) {
			const r: number = (this.curIdx < idx) ? idx - this.curIdx : idx + this.#size - this.curIdx;
			const l: number = (idx < this.curIdx) ? this.curIdx - idx : this.curIdx + this.#size - idx;
			dir = (l < r) ? -1 : 1;
		}
		return [idx, dir];
	}

}
