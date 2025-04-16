/**
 * Transition - Slide
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

import { repeatAnimationFrame, snapToBinary } from './common';
import type { Slide } from './slide';
import { Transition, CP_MOTION, CP_VISIBILITY, S_IN, S_OUT, S_DISPLAY } from './transition';
import type { Item } from './transition';

export class TransitionSlide extends Transition {

	#timeTran       : number;
	#its            : Item[];
	#current        : number = 0;
	#beforeFirstStep: boolean = false;

	constructor(ss: Slide[], timeTran: number) {
		super();
		this.#timeTran = timeTran;

		this.#its = ss.map((s, i) => ({
			s: s,
			m: i === 0 ? 0 : 1,
			v: 0,
		}));
		this.update();
		repeatAnimationFrame((_t: number, dt: number): void => this.step(dt));
	}

	private update(): void {
		for (const it of this.#its) {
			it.s.getBase().style.setProperty(CP_MOTION, `${(it.m * 100).toFixed(2)}%`);
			it.s.getBase().style.setProperty(CP_VISIBILITY, `${(it.v * 100).toFixed(2)}%`);
		}
	}

	transition(idx: number, _dir: number): void {
		this.#current         = idx;
		this.#beforeFirstStep = true;
	}

	isTransitioning(): boolean {
		if (this.#beforeFirstStep) return true;
		return this.#its.some(it => (it.s.getIndex() <= this.#current && 0 < it.m) ||
			(it.s.getIndex() > this.#current && it.m < 1)
		);
	}

	private step(dt: number): void {
		this.#beforeFirstStep = false;

		const r: number = dt / this.#timeTran;
		for (const it of this.#its) {
			let l: number = r;
			if (this.#current === it.s.getIndex() && Math.abs(it.m) < 0.1) {
				l = r * Math.sin(Math.abs(it.m) * 10 * (Math.PI / 2));
			}
			if (this.#current !== it.s.getIndex() && Math.abs(it.m) > 0.9) {
				l = r * Math.sin(Math.abs(1 - it.m) * 10 * (Math.PI / 2));
			}
			if (it.s.getIndex() <= this.#current) {
				it.m = Math.max(0, it.m - l);
			} else {
				it.m = Math.min(1, it.m + l);
			}
			it.m = snapToBinary(it.m);
		}
		let isTransitioning: boolean = false;
		let maxArea: number = 0;
		for (let i: number = this.#its.length - 1; 0 <= i; i -= 1) {
			const it: Item = this.#its[i]!;
			if (0 < it.m && it.m < 1) {
				isTransitioning = true;
			}
			const isCur: boolean = it.s.getIndex() === this.#current;
			it.s.setState(this.getState(isCur, it.m, isTransitioning));

			const a: number = 1 - it.m;
			if (maxArea < a) {
				it.v = snapToBinary(a - maxArea);
				maxArea = a;
			} else {
				it.v = 0;
			}
		}
		this.update();
	}

	private getState(isCur: boolean, m: number, isTransitioning: boolean): string {
		if (isTransitioning) return isCur ? S_IN : S_OUT;
		if (isCur && m === 0) return S_DISPLAY;
		return '';
	}

}
