/**
 * Fade Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-18
 */

import { wait } from './_common';
import { Transition } from './_transition';

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
			this._lis[i].style.opacity = (i === idx) ? '1' : '0';
			this._lis[i].style.pointerEvents = (i === idx) ? 'auto' : 'none';
		}
		await wait(this._time * 1000);
	}
}
