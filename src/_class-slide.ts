/**
 * Slide
 *
 * @author Takuto Yanagida
 * @version 2025-03-17
 */

import { Caption } from './_class-caption';
import { Mount } from './_class-mount';
import { MountImage } from './_class-mount-image';
import { MountVideo } from './_class-mount-video';

const CLS_PRE_DISPLAY = 'pre-display';
const CLS_DISPLAY     = 'display';

export class Slide {

	#cap : Caption | null;
	#mnt : Mount;
	#type: string = '';

	constructor(li: HTMLLIElement, useCaption = true) {
		this.#cap = useCaption ? Caption.create(li) : null;

		if (li.querySelector(':scope > video, :scope > a > video')) {
			this.#mnt  = new MountVideo(li);
			this.#type = 'video';
		} else {
			this.#mnt  = new MountImage(li);
			this.#type = 'image';
		}
	}

	getType(): string {
		return this.#type;
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
