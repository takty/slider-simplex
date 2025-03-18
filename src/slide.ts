/**
 * Slide
 *
 * @author Takuto Yanagida
 * @version 2025-03-18
 */

import { Caption } from './caption';
import { Mount, MountImage, MountVideo } from './mount';

const CLS_PRE_DISPLAY = 'pre-display';
const CLS_DISPLAY     = 'display';

export class Slide {

	#mnt: Mount;
	#cap: Caption | null;

	constructor(li: HTMLLIElement, useCaption: boolean = true) {
		this.#cap = useCaption ? Caption.create(li) : null;
		if (li.querySelector(':scope > video, :scope > a > video')) {
			this.#mnt  = new MountVideo(li);
		} else {
			this.#mnt  = new MountImage(li);
		}
	}

	getType(): string {
		return this.#mnt.getType();
	}

	onResize(): boolean {
		if (!this.#mnt.onResize()) return false;
		if (this.#cap) this.#cap.onResize();
		return true;
	}

	onPreDisplay(isCur: boolean): void {
		this.#mnt.setState(CLS_PRE_DISPLAY, isCur);
		if (this.#cap) {
			this.#cap.setState(CLS_PRE_DISPLAY, isCur);
		}
	}

	transition(isCur: boolean, size: number): void {
		this.#mnt.transition(isCur, size);
	}

	display(isCur: boolean): void {
		this.#mnt.setState(CLS_DISPLAY, isCur);
		if (this.#cap) {
			this.#cap.setState(CLS_DISPLAY, isCur);
		}
		this.#mnt.display(isCur);
	}

	getDuration(timeDur: number, timeTran: number, doRandom: boolean): number {
		return this.#mnt.getDuration(timeDur, timeTran, doRandom);
	}

}
