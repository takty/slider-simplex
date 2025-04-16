/**
 * Slider Simplex
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

import { getStylePropertyBool, getStylePropertyFloat, getStylePropertyString, getStylePropertyTime } from './custom-property';
import { detectTouch, repeatAnimationFrame, initializeViewportDetection, callAfterDocumentReady, wrapAround } from './common';

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

const CP_EFFECT_TYPE      = '--effect-type';
const CP_DURATION_TIME    = '--duration-time';
const CP_TRANSITION_TIME  = '--transition-time';

const CP_RANDOMIZE_TIMING = '--randomize-timing';
const CP_RANDOM_RATE      = '--random-rate';

const CP_SHOW_BACKGROUND  = '--show-background';
const CP_SHOW_SIDE_SLIDE  = '--show-side-slide';

const CP_CREATE_NAVIGATION = '--create-navigation';
const CP_CREATE_PAGINATION = '--create-pagination';
const CP_CREATE_SELECTOR   = '--create-selector';

const CP_VIEW_OFFSET = '--view-offset';

export class SliderSimplex {

	static create(id: string | null): SliderSimplex | null {
		if (id) {
			const r: HTMLElement | null = document.getElementById(id);
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

	readonly #root: HTMLElement;

	readonly #effectType      : string
	readonly #timeDur         : number
	readonly #timeTran        : number
	readonly #randomRate      : number

	readonly #showBackground  : boolean;
	readonly #showSideSlide   : boolean;

	readonly #createNavigation: boolean;
	readonly #createPagination: boolean;
	readonly #createSelector  : boolean;

	#lis    : HTMLLIElement[] = [];
	#size   : number = 0;
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
		this.#timeDur          = getStylePropertyTime(this.#root, CP_DURATION_TIME, 8000);
		this.#timeTran         = getStylePropertyTime(this.#root, CP_TRANSITION_TIME, 1000);

		const rt: boolean | null = getStylePropertyBool(this.#root, CP_RANDOMIZE_TIMING, null);
		this.#randomRate         = rt === false ? 0 : getStylePropertyFloat(root, CP_RANDOM_RATE, rt === true ? 10 : 0);

		this.#showBackground   = getStylePropertyBool(this.#root, CP_SHOW_BACKGROUND, false);
		this.#showSideSlide    = getStylePropertyBool(this.#root, CP_SHOW_SIDE_SLIDE, false);

		this.#createNavigation = getStylePropertyBool(this.#root, CP_CREATE_NAVIGATION);
		this.#createPagination = getStylePropertyBool(this.#root, CP_CREATE_PAGINATION);
		this.#createSelector   = getStylePropertyBool(this.#root, CP_CREATE_SELECTOR);

		const viewOffset: number = getStylePropertyFloat(this.#root, CP_VIEW_OFFSET, 100);

		// ----

		const ul   = this.#root.querySelector<HTMLElement>('.' + CLS_SLIDES);
		if (!ul) {
			console.error(`Slider Simplex (#${this.#root.id}): no slides`);
			return;
		}
		this.#lis  = Array.from(ul.getElementsByTagName('li'));
		this.#size = this.#lis.length;

		if (this.#size === 0) {
			console.error(`Slider Simplex (#${this.#root.id}): no list items`);
			return;
		}

		for (const li of this.#lis) {
			li.dataset.effectType = li.dataset.effectType ?? this.#effectType;
		}
		if (this.#showBackground) {
			this.#background = new Background(this.#root, this.#lis);
		}
		if (this.#showSideSlide) {
			ul.dataset.showSideSlide = 'true';
		}
		this.initSlides();
		detectTouch(this.#root);
		initializeViewportDetection(this.#root, CLS_VIEW, viewOffset);
		callAfterDocumentReady((): Promise<void> => this.start());
	}

	getController() {
		return {
			move: (idx: number): void => this.transition(idx, this.#size === 2 ? 1 : 0),
			next: (): void => this.transition((this.#curIdx === this.#size - 1) ? 0               : (this.#curIdx + 1),  1),
			prev: (): void => this.transition((this.#curIdx === 0            ) ? (this.#size - 1) : (this.#curIdx - 1), -1),

			onTransitionEnd: (fn: () => void): void => { this.#onTransitionEnd = fn; }
		};
	}


	// -------------------------------------------------------------------------


	private initSlides(): void {
		if (this.#effectType === 'scroll' && 1 < this.#size && this.#size < 5) {
			this.cloneLis();
			if (this.#size === 2) {
				this.cloneLis();
			}
		}
		const isScroll: boolean = this.#root.classList.contains(CLS_SCROLL);

		this.#slides = this.#lis.map((li, i) => {
			if (isScroll) li.classList.add(CLS_SCROLL);
			return new Slide(li, i % this.#size, this.#size);
		});

		const ro = new ResizeObserver((): void => {
			for (const s of this.#slides) {
				s.onResize();
			}
		});
		ro.observe(this.#root);

		switch (this.#effectType) {
			default      :  // Fallthrough intended
			case 'fade'  : this.#effect = new TransitionFade(this.#slides, this.#timeTran); break;
			case 'slide' : this.#effect = new TransitionSlide(this.#slides, this.#timeTran); break;
			case 'scroll': this.#effect = new TransitionScroll(this.#slides, this.#timeTran); break;
		}
	}

	private cloneLis(): void {
		for (let i: number = 0; i < this.#size; i += 1) {
			const li: HTMLLIElement = this.#lis[i]!;
			const nls = li.cloneNode(true) as HTMLLIElement;
			this.#lis.push(nls);
			li.parentNode?.appendChild(nls);
		}
	}

	private async start(): Promise<void> {
		if (1 < this.#size) {
			const fn = (idx: number, dir: -1 | 0 | 1) => this.transition(idx, dir);

			new Navigation(this.#root, this.#timeTran, fn, this.#createNavigation);
			this.#pagination = new Pagination(this.#root, this.#size, fn, this.#createPagination);
			this.#selector   = new Selector(this.#root, this.#lis, this.#size, fn, this.#createSelector);
		}
		this.#indicator = new Indicator(this.#root, this.#size);

		const rs: boolean[] = await Promise.all(this.#slides.map((s: Slide): any => s.isLoaded()));
		if (rs.every((result: any): boolean => result === true)) {
			this.transition(0, 0);
			setTimeout((): void => {
				this.#root.classList.add(CLS_START);
				repeatAnimationFrame((_t: number, _dt: number): void => this.step());
			}, 200);
			console.log(`Slider Simplex (#${this.#root.id}): successfully started`);
		} else {
			console.log(`Slider Simplex (#${this.#root.id}): failed to load media`);
		}
	}


	// -------------------------------------------------------------------------


	private transition(idx: number, dir: -1 | 0 | 1): void {
		if (idx === -1) {
			idx = wrapAround(this.#curIdx + dir, this.#size);
		}
		this.#background?.transition(idx);
		this.#pagination?.transition(idx);
		this.#indicator?.transition(idx);
		this.#selector?.transition(idx);

		this.#effect.transition(idx, dir);
		this.#curIdx    = idx;
		this.#isWaiting = true;

		if (1 < this.#size) {
			const dt: number = this.#slides[idx]?.getDuration(this.#timeDur, this.#timeTran, this.#randomRate) ?? this.#timeDur;
			this.#nextStepTime = window.performance.now() + dt;
		}
	}

	private step(): void {
		if (this.#isWaiting && !this.#effect.isTransitioning()) {
			this.#onTransitionEnd?.();
			this.#isWaiting = false;
		}
		if (window.performance.now() < this.#nextStepTime) {
			return;
		}
		if (!this.#root.classList.contains(CLS_VIEW) || this.#root.classList.contains(CLS_PAUSE)) {
			this.#nextStepTime = window.performance.now() + 100;
			return;
		}
		this.#nextStepTime = Number.MAX_VALUE;
		this.transition(-1, 1);
	}

}
