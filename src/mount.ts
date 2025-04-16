/**
 * Mount
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
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

	#isLoaded: Promise<boolean>;

	constructor(li: HTMLElement) {
		super(li);
		this.base.classList.add(CLS_IMAGE);

		if (li.classList.contains(CLS_SCROLL)) {
			this.base.classList.add(CLS_SCROLL);
		}

		const [is0, is1] = Array.from(li.querySelectorAll<HTMLImageElement>(':scope > img, :scope > a > img'));
		const loaded: HTMLImageElement[] = [];

		if (is0) {
			this.base.appendChild(is0);
			loaded.push(is0);
			if (is1) {
				this.base.classList.add(CLS_DUAL);
				this.base.appendChild(is1);
				loaded.push(is1);
			}
		}
		this.#isLoaded = loaded.length ? waitForAllImages(loaded) : Promise.resolve(false);
	}

	isLoaded(): Promise<boolean> {
		return this.#isLoaded;
	}

	getDuration(timeDur: number, _timeTran: number, randomRate: number = 0): number {
		return randomRate ? (timeDur * (1 + 0.01 * randomRate * (1 - Math.random() * 2))) : timeDur;
	}

}


// -----------------------------------------------------------------------------


export class MountVideo extends Mount {

	#video?  : HTMLVideoElement;
	#isLoaded: Promise<boolean>;

	constructor(li: HTMLElement, totalSize: number) {
		super(li);
		this.base.classList.add(CLS_VIDEO);

		const [vs0] = Array.from(li.querySelectorAll<HTMLVideoElement>(':scope > video, :scope > a > video'));

		if (vs0) {
			vs0.muted       = true;
			vs0.playsInline = true;
			if (totalSize === 1) {
				vs0.loop = true;
			}
			this.#video = vs0;
			this.base.appendChild(vs0);
			this.#isLoaded = waitForAllVideos([vs0]);
		} else {
			this.#isLoaded = Promise.resolve(false);
		}
	}

	isLoaded(): Promise<boolean> {
		return this.#isLoaded;
	}

	onStateChanged(state: string, prev: string): void {
		super.onStateChanged(state, prev);
		if (!this.#video) return;

		if (prev === '' && (state === 'in' || state === 'display') && this.#video.paused) {
			this.#video.autoplay = true;
			this.#video.play();
		}
		if (prev === 'out' && state === '' && !this.#video.paused) {
			this.#video.pause();
			this.#video.currentTime = 0;
		}
	}

	getDuration(_timeDur: number, timeTran: number, _randomRate: number): number {
		return this.#video ? (this.#video.duration * 1000 - timeTran * 2) : 0;
	}

}
