/**
 * Slide Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-18
 */

import { wait } from './_common';
import { Transition } from './_transition';

export class TransitionSlide extends Transition {

	constructor(size: number, lis: HTMLLIElement[], tranTime: number) {
		super(size, lis, tranTime);

		for (let i: number = 0; i < this._size; i += 1) {
			this._lis[i].style.transform = 'translateX(' + (i ? 100 : 0) + '%)';
		}
		setTimeout((): void => {
			for (let i: number = 0; i < this._size; i += 1) {
				this._lis[i].style.opacity = '1';
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
