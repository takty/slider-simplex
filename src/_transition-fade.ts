/**
 * Fade Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-15
 */

import { asyncTimeout } from './_common';
import { Transition } from './_transition';

export class TransitionFade extends Transition {

	constructor(size: number, slides: HTMLLIElement[], tranTime: number) {
		super(size, slides, tranTime);

		for (let i = 0; i < this._size; i += 1) {
			this._lis[i].style.opacity = (i === 0) ? '1' : '0';
		}
		setTimeout(() => {
			for (let i = 0; i < this._size; i += 1) {
				this._lis[i].style.transition = 'opacity ' + this._time + 's';
			}
		}, 10);
	}

	async transition(idx: number, _dir: number): Promise<void> {
		for (let i = 0; i < this._size; i += 1) {
			this._lis[i].style.opacity = (i === idx) ? '1' : '0';
			this._lis[i].style.pointerEvents = (i === idx) ? 'auto' : 'none';
		}
		await asyncTimeout(this._time * 1000).set();
	}
}
