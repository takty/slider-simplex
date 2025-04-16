/**
 * Transition
 *
 * @author Takuto Yanagida
 * @version 2025-04-15
 */

import { repeatAnimationFrame, wrapAround, snapToBinary } from './common';
import { Slide } from './slide';

const S_DISPLAY = 'display';
const S_IN      = 'in';
const S_OUT     = 'out';

const CP_MOTION     = '--m';
const CP_VISIBILITY = '--v';

export abstract class Transition {

	abstract transition(_idx: number, _dir: number): void;

	abstract isTransitioning(): boolean;

}

type Item = {
	s: Slide,
	m: number,
	v: number,
};


// -----------------------------------------------------------------------------


export class TransitionFade extends Transition {

	#tranTime       : number;
	#its            : Item[];
	#current        : number = 0;
	#beforeFirstStep: boolean = false;

	constructor(ss: Slide[], tranTime: number) {
		super();
		this.#tranTime = tranTime;

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
		return this.#its.some(it =>
			(it.s.getIndex() === this.#current && it.v < 1) ||
			(it.s.getIndex() !== this.#current && 0 < it.v)
		);
	}

	private step(dt: number): void {
		this.#beforeFirstStep = false;

		const r: number = dt / (this.#tranTime * 1000);
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


// -----------------------------------------------------------------------------


export class TransitionSlide extends Transition {

	#tranTime       : number;
	#its            : Item[];
	#current        : number = 0;
	#beforeFirstStep: boolean = false;

	constructor(ss: Slide[], tranTime: number) {
		super();
		this.#tranTime = tranTime;

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
			it.s.getBase().style.setProperty(CP_MOTION,     `${(it.m * 100).toFixed(2)}%`);
			it.s.getBase().style.setProperty(CP_VISIBILITY, `${(it.v * 100).toFixed(2)}%`);
		}
	}

	transition(idx: number, _dir: number): void {
		this.#current         = idx;
		this.#beforeFirstStep = true;
	}

	isTransitioning(): boolean {
		if (this.#beforeFirstStep) return true;
		return this.#its.some(it =>
			(it.s.getIndex() <= this.#current && 0 < it.m) ||
			(it.s.getIndex() > this.#current && it.m < 1)
		);
	}

	private step(dt: number): void {
		this.#beforeFirstStep = false;

		const r: number = dt / (this.#tranTime * 1000);
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
				it.v    = snapToBinary(a - maxArea);
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


// -----------------------------------------------------------------------------


export class TransitionScroll extends Transition {

	#its     : Item[];
	#tranTime: number;
	#current : number = 0;
	#shift   : number = 0;
	#speed   : number = 0;

	#sideSize: number = 2;

	constructor(ss: Slide[], tranTime: number) {
		super();
		this.#tranTime = tranTime;

		const off: number = Math.floor(ss.length / 2);
		this.#its = ss.map((_s, i) => ({
			s: ss[wrapAround(i - off, ss.length)]!,
			m: i - off,
			v: 0,
		}));
		this.update();
		repeatAnimationFrame((_t: number, dt: number): void => this.step(dt));
	}

	private update(): void {
		for (const it of this.#its) {
			it.s.getBase().style.setProperty(CP_MOTION,     `${(it.m * 100).toFixed(2)}%`);
			it.s.getBase().style.setProperty(CP_VISIBILITY, `${(it.v * 100).toFixed(2)}%`);
		}
	}

	transition(idx: number, dir: number): void {
		this.#current = idx;
		let off: number = this.getCurrent();

		let minDx: number = Number.MAX_VALUE;
		let tar: Item | null= null;

		if (0 <= dir) {  // Forward or unspecified
			for (let i: number = 0; i < this.#its.length; i += 1) {
				const it = this.#its[wrapAround(i + off, this.#its.length)]!;
				if (it.s.getIndex() === idx && (dir === 0 || 0 < it.m) && Math.abs(it.m) < minDx) {
					minDx = Math.abs(it.m);
					tar   = it;
				}
			}
		} else {  // Backward
			for (let i: number = this.#its.length - 1; 0 <= i; i -= 1) {
				const it = this.#its[wrapAround(i + off, this.#its.length)]!;
				if (it.s.getIndex() === idx && it.m < 0 && Math.abs(it.m) < minDx) {
					minDx = Math.abs(it.m);
					tar   = it;
				}
			}
		}
		if (!tar) {
			for (let i: number = 0; i < this.#its.length; i += 1) {
				const it = this.#its[wrapAround(i + off, this.#its.length)]!;
				if (it.s.getIndex() === idx && Math.abs(it.m) < minDx) {
					minDx = Math.abs(it.m);
					tar   = it;
				}
			}
		}
		if (tar) {
			this.#shift = tar.m;
			this.#speed = Math.pow(Math.max(1, Math.abs(this.#shift)), 2);
		} else {
			this.#shift = 0;
			this.#speed = 1;
		}
	}

	isTransitioning(): boolean {
		return this.#shift !== 0;
	}

	private getCurrent(): number {
		let minDx: number = Number.MAX_VALUE;
		let cur  : number = 0;

		for (let i: number = 0; i < this.#its.length; i += 1) {
			const it = this.#its[i]!;
			if (Math.abs(it.m) < minDx) {
				minDx = Math.abs(it.m);
				cur   = i;
			}
		}
		return cur;
	}

	private step(dt: number): void {
		let r: number = this.#speed * dt / (this.#tranTime * 1000);
		if (Math.abs(this.#shift) < 0.1) {
			r *= Math.sin(Math.abs(this.#shift) * 10 * (Math.PI / 2)) / this.#speed;
		}
		const d: number = Math.sign(this.#shift) * Math.min(r, Math.abs(this.#shift));
		this.#shift -= d;

		for (const it of this.#its) {
			it.m -= d;
		}

		const it0: Item = this.#its[0]!;
		const ltN: Item = this.#its[this.#its.length - 1]!;
		if (d < 0 && this.#sideSize + 0.5 < ltN.m) {
			const it = this.#its.pop() as Item;
			it.m = it0.m - 1;
			this.#its.unshift(it);
		} else if (0 < d && it0.m < -(this.#sideSize + 0.5)) {
			const it = this.#its.shift() as Item;
			it.m = ltN.m + 1;
			this.#its.push(it);
		}
		if (Math.abs(this.#shift) < 0.001) {
			for (const it of this.#its) {
				it.m = Math.round(it.m - this.#shift);
			}
			this.#shift = 0;
		}

		const ul = this.#its[0]?.s.getBase().parentElement;
		if (!ul) return;

		for (const it of this.#its) {
			const e: number = snapToBinary(getOverlapRatio(it.s.getBase(), ul));
			const isCur: boolean = it.s.getIndex() === this.#current;
			it.s.setState(this.getState(isCur, e));
			it.v = e;
		}
		this.update();
	}

	private getState(isCur: boolean, e: number): string {
		if (isCur && e === 1) return S_DISPLAY;
		if (0 < e && e < 1) return isCur ? S_IN : S_OUT;
		return '';
	}

}

function getOverlapRatio(target: HTMLElement, base: HTMLElement): number {
	const rt: DOMRect = target.getBoundingClientRect();
	const rb: DOMRect = base.getBoundingClientRect();
	const x0: number  = Math.max(rt.left, rb.left);
	const x1: number  = Math.min(rt.right, rb.right);
	return 0 < rt.width ? Math.max(0, x1 - x0) / rt.width : 0;
}
