/**
 * Slide
 *
 * @author Takuto Yanagida
 * @version 2025-03-23
 */

import { Caption } from './caption';
import { Mount, MountImage, MountVideo } from './mount';

const CLS_PRE_DISPLAY = 'pre-display';
const CLS_DISPLAY     = 'display';

export class Slide {

	#li : HTMLElement;
	#idx: number;
	#mnt: Mount;
	#cap: Caption | null;

	constructor(li: HTMLElement, idx: number, useCaption: boolean = true) {
		this.#li  = li;
		this.#idx = idx;

		this.#cap = useCaption ? Caption.create(li) : null;
		if (li.querySelector(':scope > video, :scope > a > video')) {
			this.#mnt  = new MountVideo(li);
		} else {
			this.#mnt  = new MountImage(li);
		}
	}

	getBase(): HTMLElement {
		return this.#li;
	}

	getIndex(): number {
		return this.#idx;
	}

	getType(): string {
		return this.#mnt.getType();
	}

	setState(state: string, flag: boolean): void {
		if (flag) {
			this.#li.classList.add(state);
		} else {
			this.#li.classList.remove(state);
		}
		this.#mnt.setState(state, flag);
		if (this.#cap) {
			this.#cap.setState(state, flag);
		}
	}

	onResize(): boolean {
		if (!this.#mnt.onResize()) return false;
		if (this.#cap) this.#cap.onResize();
		return true;
	}

	onPreDisplay(isCur: boolean): void {
		this.setState(CLS_PRE_DISPLAY, isCur);
	}

	transition(isCur: boolean, size: number): void {
		this.#mnt.transition(isCur, size);
	}

	display(isCur: boolean): void {
		this.setState(CLS_DISPLAY, isCur);
		this.#mnt.display(isCur);
	}

	getDuration(timeDur: number, timeTran: number, doRandom: boolean): number {
		return this.#mnt.getDuration(timeDur, timeTran, doRandom);
	}

}
