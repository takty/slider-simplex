/**
 * Slide
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

import { Caption } from './caption';
import { Mount } from './mount';
import { MountImage } from "./mount-image";
import { MountVideo } from "./mount-video";

const DS_KEY_STATE = 'state';

export class Slide {

	readonly #li : HTMLElement;
	readonly #idx: number;
	readonly #mnt: Mount;
	readonly #cap: Caption | null;

	constructor(li: HTMLElement, idx: number, totalSize: number) {
		this.#li  = li;
		this.#idx = idx;

		this.#cap = Caption.create(li);
		const hasVideo = li.querySelector<HTMLVideoElement>(':scope > video, :scope > a > video');
		this.#mnt = hasVideo ? new MountVideo(li, totalSize) : new MountImage(li);
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
		this.#cap?.onStateChanged(state, prev);
	}

	onResize(): void {
		this.#cap?.onResize();
	}

	isLoaded(): Promise<boolean> {
		return this.#mnt.isLoaded();
	}

	getDuration(timeDur: number, timeTran: number, randomRate: number): number {
		return this.#mnt.getDuration(timeDur, timeTran, randomRate);
	}

}
