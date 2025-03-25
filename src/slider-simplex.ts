/**
 * Slider Simplex
 *
 * @author Takuto Yanagida
 * @version 2025-03-25
 */

import { getStylePropertyBool, getStylePropertyFloat, getStylePropertyString } from './custom-property';
import { repeatUntil, detectTouch, repeatAnimationFrame, initializeViewportDetection, callAfterDocumentReady, wrapAround } from './common';

import { Background } from './part-background.js';
import { Navigation } from './part-navigation';
import { Pagination } from './part-pagination';
import { Indicator } from './part-indicator';
import { Selector } from './part-selector.js';

import { Slide } from './slide';
import { Transition, TransitionFade, TransitionSlide, TransitionScroll } from './transition';

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

	#curIdx      : number  = 0;
	#nextStepTime: number  = 0;
	#isWaiting   : boolean = false;

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

		for (const li of this.#lis) {
			li.dataset.effectType = li.dataset.effectType ?? this.#effectType;
		}
		if (this.#showBackground) {
			this.#background = new Background(this.#root, this.#lis);
		}
		if (this.#showSideSlide) {
			ul.style.overflow = 'visible';
		}
		const hasVideo: boolean = this.initSlides();
		// if (hasVideo) {
		// 	repeatUntil(100, (): boolean => this.onResizeSlide());
		// }
		detectTouch(this.#root);
		initializeViewportDetection(this.#root, CLS_VIEW, OFFSET_VIEW);
		callAfterDocumentReady((): void => this.start());
	}

	getController() {
		const fs = {
			move: (idx: number): void => this.transition(idx, this.#size === 2 ? 1 : 0),
			next: (): void => this.transition((this.#curIdx === this.#size - 1) ? 0               : (this.#curIdx + 1),  1),
			prev: (): void => this.transition((this.#curIdx === 0            ) ? (this.#size - 1) : (this.#curIdx - 1), -1),

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

		for (let i: number = 0; i < this.#lis.length; i += 1) {
			const li: HTMLElement = this.#lis[i];
			if (isScroll) {
				li.classList.add(CLS_SCROLL);
			}
			const slide = new Slide(li, i % this.#size);
			if ('video' === slide.getType()) {
				hasVideo = true;
			}
			this.#slides.push(slide);
		}
		const ro = new ResizeObserver((): boolean => this.onResizeSlide());
		ro.observe(this.#root);

		switch (this.#effectType) {
			default      :
			case 'fade'  : this.#effect = new TransitionFade(this.#slides, this.#timeTran); break;
			case 'slide' : this.#effect = new TransitionSlide(this.#slides, this.#timeTran); break;
			case 'scroll': this.#effect = new TransitionScroll(this.#slides, this.#timeTran); break;
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

	private start(): void {
		if (1 < this.#size) {
			const fn = (idx: number, dir: -1 | 0 | 1) => this.transition(idx, dir);

			new Navigation(this.#root, this.#timeTran, fn, this.#createNavigation);
			this.#pagination = new Pagination(this.#root, this.#size, fn, this.#createPagination);
			this.#selector   = new Selector(this.#root, this.#lis, this.#size, fn, this.#createSelector);
		}
		this.#indicator = new Indicator(this.#root, this.#size);

		this.transition(0, 0);
		setTimeout((): void => this.#root.classList.add(CLS_START), 200);
		console.log(`Slider Simplex (#${this.#root.id}): started`);

		repeatAnimationFrame((_t: number, _dt: number): void => this.step());
	}


	// -------------------------------------------------------------------------


	private transition(idx: number, dir: -1 | 0 | 1): void {
		if (idx === -1) {
			idx = wrapAround(this.#curIdx + dir, this.#size);
		}
		for (let i: number = 0; i < this.#slides.length; i += 1) {
			this.#slides[i].transition((i % this.#size) === idx, this.#size);
		}
		if (this.#background) this.#background.transition(idx);
		if (this.#pagination) this.#pagination.transition(idx);
		if (this.#indicator)  this.#indicator.transition(idx);
		if (this.#selector)   this.#selector.transition(idx);

		this.#effect.transition(idx, dir);
		this.#curIdx    = idx;
		this.#isWaiting = true;

		for (let i: number = 0; i < this.#slides.length; i += 1) {
			this.#slides[i].display((i % this.#size) === idx);
		}
		if (1 < this.#size) {
			const dt: number = this.#slides[idx].getDuration(this.#timeDur, this.#timeTran, this.#randomizeTiming);
			this.#nextStepTime = window.performance.now() + (this.#timeTran + dt) * 1000;
		}
	}

	private step(): void {
		if (this.#isWaiting && !this.#effect.isTransitioning()) {
			if (this.#onTransitionEnd) this.#onTransitionEnd();
			this.#isWaiting = false;
		}
		if (window.performance.now() < this.#nextStepTime) {
			return;
		}
		if (!this.#root.classList.contains(CLS_VIEW) || this.#root.classList.contains(CLS_PAUSE)) {
			return;
		}
		this.#nextStepTime = Number.MAX_VALUE;
		this.transition(-1, 1);
	}

}
