/**
 * Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-25
 */

import { repeatAnimationFrame, wrapAround } from './common';
import { Slide } from './slide';

const CLS_PRE_DISPLAY = 'pre-display';
const CLS_DISPLAY     = 'display';

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
			it.s.getBase().style.opacity       = `${it.v}`;
			it.s.getBase().style.pointerEvents = (it.v === 1) ? 'auto' : 'none';
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
			if (it.s.getIndex() === this.#current) {
				it.v = Math.min(1, it.v + r);
			} else {
				it.v = Math.max(0, it.v - r);
			}
			it.s.setState(CLS_PRE_DISPLAY, 0 < it.v && it.v < 1);
			it.s.setState(CLS_DISPLAY, it.v === 1);
		}
		this.update();
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
			it.s.getBase().style.transform = `translateX(${it.v * 100}%)`;
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
			if (it.s.getIndex() <= this.#current) {
				it.v = Math.max(0, it.v - r);
			} else {
				it.v = Math.min(1, it.v + r);
			}
		}
		let isTransitioning: boolean = false;
		for (let i: number = this.#its.length - 1; 0 <= i; i -= 1) {
			const it: Item = this.#its[i];
			if (0 < it.v && it.v < 1) {
				isTransitioning = true;
			}
			it.s.setState(CLS_PRE_DISPLAY, 0 < it.v && it.v < 1);

			if (it.s.getIndex() === this.#current) {
				it.s.setState(CLS_DISPLAY, !isTransitioning && it.v === 0);
			}
		}
		this.update();
	}

}


// -----------------------------------------------------------------------------


export class TransitionScroll extends Transition {

	#its  : Item[];
	#shift: number = 0;
	#speed: number = 0;

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
		let off: number = this.getCurrent();

		let minDx: number = Number.MAX_VALUE;
		let tar: Item | null= null;

		if (0 <= dir) {
			for (let i: number = 0; i < this.#its.length; i += 1) {
				const it = this.#its.at(wrapAround(i + off, this.#its.length)) as Item;
				if (it.s.getIndex() === idx) {
					if ((dir === 0 || 0 < it.v) && Math.abs(it.v) < minDx) {
						minDx = Math.abs(it.v);
						tar   = it;
					}
				}
			}
		} else if (dir < 0) {
			for (let i: number = this.#its.length - 1; 0 <= i; i -= 1) {
				const it = this.#its.at(wrapAround(i + off, this.#its.length)) as Item;
				if (it.s.getIndex() === idx) {
					if (it.v < 0 && Math.abs(it.v) < minDx) {
						minDx = Math.abs(it.v);
						tar   = it;
					}
				}
			}
		}
		if (tar) {
			this.#shift = tar.v;
			this.#speed = Math.max(1, Math.abs(this.#shift));
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
			r /= (1 + (0.1 - Math.abs(this.#shift)) * 10);
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
			const e: number = getOverlapRatio(it.s.getBase(), ul);
			it.s.setState(CLS_PRE_DISPLAY, 0 < e);
			it.s.setState(CLS_DISPLAY, 0.99 < e);
		}
		this.update();
	}

}

function getOverlapRatio(target: HTMLElement, base: HTMLElement): number {
	const rt: DOMRect = target.getBoundingClientRect();
	const rb: DOMRect = base.getBoundingClientRect();
	const x0: number  = Math.max(rt.left, rb.left);
	const x1: number  = Math.min(rt.right, rb.right);
	return Math.max(0, x1 - x0) / rt.width;
}
