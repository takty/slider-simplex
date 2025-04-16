/**
 * Transition - Fade
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

import { repeatAnimationFrame, snapToBinary } from './common';
import type { Slide } from './slide';
import { Transition, CP_VISIBILITY, S_IN, S_OUT, S_DISPLAY } from './transition';
import type { Item } from './transition';

export class TransitionFade extends Transition {

	#timeTran       : number;
	#its            : Item[];
	#current        : number = 0;
	#beforeFirstStep: boolean = false;

	constructor(ss: Slide[], timeTran: number) {
		super();
		this.#timeTran = timeTran;

		this.#its = ss.map((s, i) => ({
			s: s,
			m: 0,
			v: i === 0 ? 1 : 0,
		}));
		this.update();
		repeatAnimationFrame((_t: number, dt: number): void => this.step(dt));
	}

	private update(): void {
		for (const it of this.#its) {
			it.s.getBase().style.setProperty(CP_VISIBILITY, `${(it.v * 100).toFixed(2)}%`);
		}
	}

	transition(idx: number, _dir: number): void {
		this.#current         = idx;
		this.#beforeFirstStep = true;
	}

	isTransitioning(): boolean {
		if (this.#beforeFirstStep) return true;
		return this.#its.some(it => (it.s.getIndex() === this.#current && it.v < 1) ||
			(it.s.getIndex() !== this.#current && 0 < it.v)
		);
	}

	private step(dt: number): void {
		this.#beforeFirstStep = false;

		const r: number = dt / this.#timeTran;
		for (const it of this.#its) {
			const isCur: boolean = it.s.getIndex() === this.#current;
			if (isCur) {
				it.v = Math.min(1, it.v + r);
			} else {
				it.v = Math.max(0, it.v - r);
			}
			it.v = snapToBinary(it.v);
			it.s.setState(this.getState(isCur, it.v));
		}
		this.update();
	}

	private getState(isCur: boolean, v: number): string {
		if (v === 1) return S_DISPLAY;
		if (0 < v) return isCur ? S_IN : S_OUT;
		return '';
	}

}
