/**
 * Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-27
 */

import { repeatAnimationFrame, wrapAround } from './common';
import { Slide } from './slide';

const S_DISPLAY = 'display';
const S_IN      = 'in';
const S_OUT     = 'out';

export abstract class Transition {

	abstract transition(_idx: number, _dir: number): void;

	abstract isTransitioning(): boolean;

}

type Item = {
	s: Slide,
	v: number,
};


// -----------------------------------------------------------------------------


export class TransitionFade extends Transition {

	#its            : Item[];
	#current        : number = 0;
	#beforeFirstStep: boolean = false;

	constructor(ss: Slide[], tranTime: number) {
		super();

		this.#its = this.createItems(ss);

		this.update();
		repeatAnimationFrame((_t: number, dt: number): void => this.step(dt, tranTime));
	}

	private createItems(ss: Slide[]): Item[] {
		const its: Item[] = [];

		for (let i: number = 0; i < ss.length; i += 1) {
			its.push({
				s: ss[i],
				v: i === 0 ? 1 : 0,
			});
		}
		return its;
	}

	private update(): void {
		for (const it of this.#its) {
			it.s.getBase().style.opacity = `${it.v.toFixed(4)}`;
		}
	}

	transition(idx: number, _dir: number): void {
		this.#current         = idx;
		this.#beforeFirstStep = true;
	}

	isTransitioning(): boolean {
		if (this.#beforeFirstStep) {
			return true;
		}
		for (const it of this.#its) {
			if (it.s.getIndex() === this.#current) {
				if (it.v < 1) return true;
			} else {
				if (0 < it.v) return true;
			}
		}
		return false;
	}

	private step(dt: number, tranTime: number): void {
		this.#beforeFirstStep = false;

		const r: number = dt / (tranTime * 1000);
		for (const it of this.#its) {
			const isCur: boolean = it.s.getIndex() === this.#current;
			if (isCur) {
				it.v = Math.min(1, it.v + r);
			} else {
				it.v = Math.max(0, it.v - r);
			}
			if (it.v < 0.01) it.v = 0;
			if (0.99 < it.v) it.v = 1;
			it.s.setState(this.getState(isCur, it.v));
		}
		this.update();
	}

	private getState(isCur: boolean, v: number): string {
		if (isCur && 0 < v && v < 1) return S_IN;
		if (!isCur && 0 < v && v < 1) return S_OUT;
		if (v === 1) return S_DISPLAY;
		return '';
	}

}


// -----------------------------------------------------------------------------


export class TransitionSlide extends Transition {

	#its            : Item[];
	#current        : number = 0;
	#beforeFirstStep: boolean = false;

	constructor(ss: Slide[], tranTime: number) {
		super();

		this.#its = this.createItems(ss);

		this.update();
		repeatAnimationFrame((_t: number, dt: number): void => this.step(dt, tranTime));
	}

	private createItems(ss: Slide[]): Item[] {
		const its: Item[] = [];

		for (let i: number = 0; i < ss.length; i += 1) {
			its.push({
				s: ss[i],
				v: i === 0 ? 0 : 1,
			});
		}
		return its;
	}

	private update(): void {
		for (const it of this.#its) {
			it.s.getBase().style.transform = `translateX(${(it.v * 100).toFixed(2)}%)`;
		}
	}

	transition(idx: number, _dir: number): void {
		this.#current         = idx;
		this.#beforeFirstStep = true;
	}

	isTransitioning(): boolean {
		if (this.#beforeFirstStep) {
			return true;
		}
		for (const it of this.#its) {
			if (it.s.getIndex() <= this.#current) {
				if (0 < it.v) return true;
			} else {
				if (it.v < 1) return true;
			}
		}
		return false;
	}

	private step(dt: number, tranTime: number): void {
		this.#beforeFirstStep = false;

		const r: number = dt / (tranTime * 1000);
		for (const it of this.#its) {
			let l: number = r;
			if (this.#current === it.s.getIndex() && Math.abs(it.v) < 0.1) {
				l = r * Math.sin(Math.abs(it.v) * 10 * (Math.PI / 2));
			}
			if (this.#current !== it.s.getIndex() && Math.abs(it.v) > 0.9) {
				l = r * Math.sin(Math.abs(1 - it.v) * 10 * (Math.PI / 2));
			}
			if (it.s.getIndex() <= this.#current) {
				it.v = Math.max(0, it.v - l);
			} else {
				it.v = Math.min(1, it.v + l);
			}
			if (it.v < 0.01) it.v = 0;
			if (0.99 < it.v) it.v = 1;
		}
		let isTransitioning: boolean = false;
		for (let i: number = this.#its.length - 1; 0 <= i; i -= 1) {
			const it: Item = this.#its[i];
			if (0 < it.v && it.v < 1) {
				isTransitioning = true;
			}
			const isCur: boolean = it.s.getIndex() === this.#current;
			it.s.setState(this.getState(isCur, it.v, isTransitioning));
		}
		this.update();
	}

	private getState(isCur: boolean, v: number, isTransitioning: boolean): string {
		if (isCur && isTransitioning) return S_IN;
		if (!isCur && isTransitioning) return S_OUT;
		if (isCur && !isTransitioning && v === 0) return S_DISPLAY;
		return '';
	}

}


// -----------------------------------------------------------------------------


export class TransitionScroll extends Transition {

	#its    : Item[];
	#current: number = 0;
	#shift  : number = 0;
	#speed  : number = 0;

	#sideSize: number = 2;

	constructor(ss: Slide[], tranTime: number) {
		super();

		this.#its = this.createItems(ss);

		this.update();
		repeatAnimationFrame((_t: number, dt: number): void => this.step(dt, tranTime));
	}

	private createItems(ss: Slide[]): Item[] {
		const its: Item[] = [];
		const off: number = Math.floor(ss.length / 2);

		for (let i: number = 0; i < ss.length; i += 1) {
			its.push({
				s: ss.at(i - off) as Slide,
				v: i - off,
			});
		}
		return its;
	}

	private update(): void {
		for (const it of this.#its) {
			it.s.getBase().style.transform = `translateX(${it.v * 100}%)`;
		}
	}

	transition(idx: number, dir: number): void {
		this.#current = idx;
		let off: number = this.getCurrent();

		let minDx: number = Number.MAX_VALUE;
		let tar: Item | null= null;

		if (0 <= dir) {
			for (let i: number = 0; i < this.#its.length; i += 1) {
				const it = this.#its.at(wrapAround(i + off, this.#its.length)) as Item;
				if (it.s.getIndex() === idx && (dir === 0 || 0 < it.v) && Math.abs(it.v) < minDx) {
					minDx = Math.abs(it.v);
					tar   = it;
				}
			}
		} else if (dir < 0) {
			for (let i: number = this.#its.length - 1; 0 <= i; i -= 1) {
				const it = this.#its.at(wrapAround(i + off, this.#its.length)) as Item;
				if (it.s.getIndex() === idx && it.v < 0 && Math.abs(it.v) < minDx) {
					minDx = Math.abs(it.v);
					tar   = it;
				}
			}
		}
		if (!tar) {
			for (let i: number = 0; i < this.#its.length; i += 1) {
				const it = this.#its.at(wrapAround(i + off, this.#its.length)) as Item;
				if (it.s.getIndex() === idx && Math.abs(it.v) < minDx) {
					minDx = Math.abs(it.v);
					tar   = it;
				}
			}
		}
		if (tar) {
			this.#shift = tar.v;
			this.#speed = Math.pow(Math.max(1, Math.abs(this.#shift)), 2);
		}
	}

	isTransitioning(): boolean {
		return this.#shift !== 0;
	}

	private getCurrent(): number {
		let minDx: number = Number.MAX_VALUE;
		let cur  : number = 0;

		for (let i: number = 0; i < this.#its.length; i += 1) {
			const it = this.#its.at(i) as Item;
			if (Math.abs(it.v) < minDx) {
				minDx = Math.abs(it.v);
				cur   = i;
			}
		}
		return cur;
	}

	private step(dt: number, tranTime: number): void {
		let r: number = this.#speed * dt / (tranTime * 1000);
		if (Math.abs(this.#shift) < 0.1) {
			r *= Math.sin(Math.abs(this.#shift) * 10 * (Math.PI / 2));
		}
		const doFit: boolean = Math.abs(this.#shift) < r;
		if (this.#shift < 0) {
			r = Math.min(r, -this.#shift);
			this.#shift += r;
			for (const it of this.#its) {
				it.v += r;
			}
			if (this.#sideSize + 0.5 < (this.#its.at(-1) as Item).v) {
				const it = this.#its.pop() as Item;
				it.v = (this.#its.at(0) as Item).v - 1;
				this.#its.unshift(it);
			}
		} else if (0 < this.#shift) {
			r = Math.min(r, this.#shift);
			this.#shift -= r;
			for (const it of this.#its) {
				it.v -= r;
			}
			if ((this.#its.at(0) as Item).v < -(this.#sideSize + 0.5)) {
				const it = this.#its.shift() as Item;
				it.v = (this.#its.at(-1) as Item).v + 1;
				this.#its.push(it);
			}
		}
		if (doFit) {
			this.#shift = 0;
			for (const it of this.#its) {
				it.v = Math.round(it.v);
			}
		}

		const ul = this.#its[0].s.getBase().parentElement as HTMLElement;
		for (const it of this.#its) {
			let e: number = getOverlapRatio(it.s.getBase(), ul);
			if (e < 0.01) e = 0;
			if (0.99 < e) e = 1;
			const isCur: boolean = it.s.getIndex() === this.#current;
			it.s.setState(this.getState(isCur, e));
		}
		this.update();
	}

	private getState(isCur: boolean, e: number): string {
		if (isCur && 0 < e && e < 1) return S_IN;
		if (!isCur && 0 < e && e < 1) return S_OUT;
		if (isCur && e === 1) return S_DISPLAY;
		return '';
	}

}

function getOverlapRatio(target: HTMLElement, base: HTMLElement): number {
	const rt: DOMRect = target.getBoundingClientRect();
	const rb: DOMRect = base.getBoundingClientRect();
	const x0: number  = Math.max(rt.left, rb.left);
	const x1: number  = Math.min(rt.right, rb.right);
	return Math.max(0, x1 - x0) / rt.width;
}
