/**
 * Slide
 *
 * @author Takuto Yanagida
 * @version 2025-03-26
 */

import { Caption } from './caption';
import { Mount, MountImage, MountVideo } from './mount';

const DS_KEY_STATE = 'state';

export class Slide {

	#li : HTMLElement;
	#idx: number;
	#mnt: Mount;
	#cap: Caption | null;

	constructor(li: HTMLElement, idx: number, totalSize: number) {
		this.#li  = li;
		this.#idx = idx;

		this.#cap = Caption.create(li);
		if (li.querySelector(':scope > video, :scope > a > video')) {
			this.#mnt  = new MountVideo(li, totalSize);
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

	setState(state: string): void {
		const prev: string = this.#li.dataset?.[DS_KEY_STATE] ?? '';
		if (prev === state) return;

		this.#li.dataset[DS_KEY_STATE] = state;
		this.#mnt.onStateChanged(state, prev);
		if (this.#cap) {
			this.#cap.onStateChanged(state, prev);
		}
	}

	onResize(): void {
		if (this.#cap) this.#cap.onResize();
	}

	isLoaded(): Promise<boolean> {
		return this.#mnt.isLoaded();
	}

	getDuration(timeDur: number, timeTran: number, randomRate: number): number {
		return this.#mnt.getDuration(timeDur, timeTran, randomRate);
	}

}
