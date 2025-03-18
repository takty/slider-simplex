/**
 * Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-18
 */

import { wait } from './common';

export abstract class Transition {

	protected _size: number;
	protected _lis : HTMLLIElement[];
	protected _time: number;

	constructor(size: number, lis: HTMLLIElement[], tranTime: number) {
		this._size = size;
		this._lis  = lis;
		this._time = tranTime;
	}

	abstract transition(idx: number, dir: number): Promise<void>;

}


// -----------------------------------------------------------------------------


export class TransitionFade extends Transition {

	constructor(size: number, lis: HTMLLIElement[], tranTime: number) {
		super(size, lis, tranTime);

		for (let i: number = 0; i < this._size; i += 1) {
			this._lis[i].style.opacity = (i === 0) ? '1' : '0';
		}
		setTimeout((): void => {
			for (let i: number = 0; i < this._size; i += 1) {
				this._lis[i].style.transition = 'opacity ' + this._time + 's';
			}
		}, 10);
	}

	async transition(idx: number, _dir: number): Promise<void> {
		for (let i: number = 0; i < this._size; i += 1) {
			this._lis[i].style.opacity       = (i === idx) ? '1' : '0';
			this._lis[i].style.pointerEvents = (i === idx) ? 'auto' : 'none';
		}
		await wait(this._time * 1000);
	}
}


// -----------------------------------------------------------------------------


export class TransitionSlide extends Transition {

	constructor(size: number, lis: HTMLLIElement[], tranTime: number) {
		super(size, lis, tranTime);

		for (let i: number = 0; i < this._size; i += 1) {
			this._lis[i].style.transform = 'translateX(' + (i ? 100 : 0) + '%)';
		}
		setTimeout((): void => {
			for (let i: number = 0; i < this._size; i += 1) {
				this._lis[i].style.opacity    = '1';
				this._lis[i].style.transition = 'transform ' + this._time + 's';
			}
		}, 10);
	}

	async transition(idx: number, _dir: number): Promise<void> {
		for (let i: number = 0; i < this._size; i += 1) {
			this._lis[i].style.transform = (i <= idx) ? 'translateX(0%)' : 'translateX(100%)';
		}
		await wait(this._time * 1000);
	}

}


// -----------------------------------------------------------------------------


export class TransitionScroll extends Transition {

	_cur   : number  = 0;
	_curPsd: number  = 0;
	_doing : boolean = false;

	_queue: ((cur: number, curPsd: number) => Promise<[number, number]>)[] = [];

	constructor(size: number, lis: HTMLLIElement[], tranTime: number) {
		super(size, lis, tranTime);

		const ps: number[] = this.calcPosition(0, 1);
		for (let i: number = 0; i < this._lis.length; i += 1) {
			this._lis[i].style.opacity   = '1';
			this._lis[i].style.transform = `translateX(${ps[i] * 100}%)`;
		}
	}

	async transition(idx: number, dir: number): Promise<void> {
		this._queue.push((cur: number, curPsd: number) => this.doTransition(cur, curPsd, idx, dir));
		if (this._doing) return;
		this._doing = true;
		while (this._queue.length) {
			const fn = this._queue.shift() as (cur: number, curPsd: number) => Promise<[number, number]>;
			[this._cur, this._curPsd] = (await fn(this._cur, this._curPsd)) as [number, number];
		}
		this._doing = false;
	}

	private async doTransition(curIdx: number, curIdxPsd: number, idx: number, dir: number): Promise<[number, number]> {
		if (0 === dir && curIdx !== idx) {
			const r: number = (curIdx < idx) ? idx - curIdx : idx + this._size - curIdx;
			const l: number = (idx < curIdx) ? curIdx - idx : curIdx + this._size - idx;
			dir = (l < r) ? -1 : 1;
		}
		let ps: number[] = this.calcPosition(curIdxPsd, dir);
		for (let i: number = 0; i < this._lis.length; i += 1) {
			this._lis[i].style.transition = '';
			this._lis[i].style.transform  = `translateX(${ps[i] * 100}%)`;
		}
		await wait(100);

		let d: number = 0;
		if (dir ===  1) d = idx - curIdx;
		if (dir === -1) d = curIdx - idx;
		if (d < 0) d += this._size;

		let idxPsd: number = curIdxPsd;
		for (let i: number = 0; i < d; i += 1) {
			[ps, idxPsd] = this.shift(ps, idxPsd, dir, this._time / d, this.getTransition(d, i));
			await wait(Math.floor(this._time * 1000 / d));
		}
		return [idx, idxPsd];
	}

	private getTransition(d: number, i: number) {
		if (d === 1) return 'ease';
		if (d === 2) {
			if (i === 0) return 'ease-in';
			if (i === 1) return 'ease-out';
		}
		return 'linear';
	}

	private shift(curPs: number[], curIdxPsd: number, dir: number, time: number, tf = 'ease'): [number[], number] {
		const lenPsd: number = this._lis.length;

		let idxPsd: number = curIdxPsd + dir;
		if (lenPsd - 1 < idxPsd) idxPsd = 0;
		if (idxPsd < 0) idxPsd = lenPsd - 1;

		const ps: number[] = this.calcPosition(idxPsd, dir);

		for (let i: number = 0; i < lenPsd; i += 1) {
			const t: string = (Math.abs(curPs[i] - ps[i]) === 1) ? `transform ${time}s ${tf}` : '';
			this._lis[i].style.transition = t;
			this._lis[i].style.transform  = `translateX(${ps[i] * 100}%)`;
		}
		return [ps, idxPsd];
	}

	private calcPosition(idxPsd: number, dir: number): number[] {
		const lenPsd: number = this._lis.length;
		const ps     = new Array(lenPsd);

		const hs: number = (dir !== -1) ? Math.ceil((lenPsd - 1) / 2) : Math.floor((lenPsd - 1) / 2);
		const rs: number = lenPsd - 1 - hs;

		for (let i: number = 1; i <= hs; i += 1) {
			let j: number = idxPsd + i;
			if (lenPsd - 1 < j) j -= lenPsd;
			ps[j] = i;
		}
		for (let i: number = 1; i <= rs; i += 1) {
			let j: number = idxPsd - i;
			if (j < 0) j += lenPsd;
			ps[j] = -i;
		}
		ps[idxPsd] = 0;
		return ps;
	}

}
