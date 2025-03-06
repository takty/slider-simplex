/**
 * Slide Transition
 *
 * @author Takuto Yanagida
 * @version 2021-06-25
 */

import { asyncTimeout } from './_common';
import { Transition } from './_transition';

export class TransitionSlide extends Transition {

	constructor(size: number, slides: HTMLLIElement[], tranTime: number) {
		super(size, slides, tranTime);

		for (let i = 0; i < this._size; i += 1) {
			this._lis[i].style.transform = 'translateX(' + (i ? 100 : 0) + '%)';
		}
		setTimeout(() => {
			for (let i = 0; i < this._size; i += 1) {
				this._lis[i].style.opacity = '1';
				this._lis[i].style.transition = 'transform ' + this._time + 's';
			}
		}, 10);
	}

	async transition(idx: number, _dir: number): Promise<void> {
		for (let i = 0; i < this._size; i += 1) {
			this._lis[i].style.transform = (i <= idx) ? 'translateX(0%)' : 'translateX(100%)';
		}
		await asyncTimeout(this._time * 1000).set();
	}

}
