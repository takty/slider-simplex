/**
 * Mount
 *
 * @author Takuto Yanagida
 * @version 2025-03-29
 */

import { waitForAllImages, waitForAllVideos } from "./common";

const CLS_IMAGE = 'image';
const CLS_VIDEO = 'video';

const CLS_SCROLL = 'scroll';
const CLS_DUAL   = 'dual';

const DS_KEY_STATE = 'state';

export abstract class Mount {

	protected base: HTMLElement;

	constructor(li: HTMLElement) {
		this.base = document.createElement('div');
		const e: HTMLElement = li.querySelector('a') ?? li;
		e.insertBefore(this.base, e.firstChild);
	}

	abstract isLoaded(): Promise<boolean>;

	onStateChanged(state: string, _prev: string): void {
		this.base.dataset[DS_KEY_STATE] = state;
	}

	getDuration(timeDur: number, _timeTran: number, _randomRate: number): number {
		return timeDur;
	}

}


// -----------------------------------------------------------------------------


export class MountImage extends Mount {

	#isLoaded: Promise<boolean> | null = null;

	constructor(li: HTMLElement) {
		super(li);
		this.base.classList.add(CLS_IMAGE);

		if (li.classList.contains(CLS_SCROLL)) {
			this.base.classList.add(CLS_SCROLL);
		}

		const is: HTMLImageElement[] = Array.from(li.querySelectorAll(':scope > img, :scope > a > img'));
		if (is.length) {
			this.base.appendChild(is[0]);
			if (1 < is.length) {
				this.base.classList.add(CLS_DUAL);
				this.base.appendChild(is[1]);
			}
			this.#isLoaded = waitForAllImages(is);
		}
	}

	async isLoaded(): Promise<boolean> {
		if (this.#isLoaded) {
			return this.#isLoaded;
		} else {
			return false;
		}
	}

	getDuration(timeDur: number, _timeTran: number, randomRate: number = 0): number {
		if (randomRate) {
			const f: number = (1 + 0.01 * randomRate * (1 - Math.random() * 2));
			return timeDur * f;
		}
		return timeDur;
	}

}


// -----------------------------------------------------------------------------


export class MountVideo extends Mount {

	#video!  : HTMLVideoElement;
	#isLoaded: Promise<boolean> | null = null;

	constructor(li: HTMLElement, totalSize: number) {
		super(li);
		this.base.classList.add(CLS_VIDEO);

		const vs: HTMLVideoElement[] = Array.from(li.querySelectorAll(':scope > video, :scope > a > video'));
		if (1 === vs.length) {
			const v: HTMLVideoElement = vs[0];
			v.muted       = true;
			v.playsInline = true;
			if (totalSize === 1) {
				v.loop = true;
			}
			this.#video = v;
			this.base.appendChild(v);
			this.#isLoaded = waitForAllVideos([v]);
		}
	}

	async isLoaded(): Promise<boolean> {
		if (this.#isLoaded) {
			return this.#isLoaded;
		} else {
			return false;
		}
	}

	onStateChanged(state: string, prev: string): void {
		super.onStateChanged(state, prev);

		if (prev === '' && (state === 'in' || state === 'display')) {
			if (this.#video.paused) {
				this.#video.autoplay = true;
				this.#video.play();
			}
		}
		if (prev === 'out' && state === '') {
			if (!this.#video.paused) {
				this.#video.pause();
				this.#video.currentTime = 0;
			}
		}
	}

	getDuration(_timeDur: number, timeTran: number, _randomRate: number): number {
		return this.#video.duration - timeTran * 2;
	}

}
