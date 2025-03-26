/**
 * Mount
 *
 * @author Takuto Yanagida
 * @version 2025-03-26
 */

const CLS_IMAGE = 'image';
const CLS_VIDEO = 'video';

const CLS_SCROLL = 'scroll';
const CLS_DUAL   = 'dual';

const RANDOM_RATE = 10;

const DS_KEY_STATE = 'state';

export abstract class Mount {

	protected base: HTMLElement;

	constructor(li: HTMLElement) {
		this.base = document.createElement('div');
		const e: HTMLElement = li.querySelector('a') ?? li;
		e.insertBefore(this.base, e.firstChild);
	}

	onStateChanged(state: string, _prev: string): void {
		this.base.dataset[DS_KEY_STATE] = state;
	}

	getDuration(timeDur: number, _timeTran: number, _doRandom: boolean): number {
		return timeDur;
	}

}


// -----------------------------------------------------------------------------


export class MountImage extends Mount {

	constructor(li: HTMLElement) {
		super(li);
		this.base.classList.add(CLS_IMAGE);

		if (li.classList.contains(CLS_SCROLL)) {
			this.base.classList.add(CLS_SCROLL);
		}

		const is = li.querySelectorAll(':scope > img, :scope > a > img');
		if (is.length) {
			this.base.appendChild(is[0]);
			if (1 < is.length) {
				this.base.classList.add(CLS_DUAL);
				this.base.appendChild(is[1]);
			}
		}
	}

	getDuration(timeDur: number, _timeTran: number, doRandom: boolean): number {
		if (doRandom) {
			const f: number = (1 + 0.01 * RANDOM_RATE * (1 - Math.random() * 2));
			return timeDur * f;
		}
		return timeDur;
	}

}


// -----------------------------------------------------------------------------


export class MountVideo extends Mount {

	#video!: HTMLVideoElement;

	constructor(li: HTMLElement, totalSize: number) {
		super(li);
		this.base.classList.add(CLS_VIDEO);

		const vs = li.querySelectorAll(':scope > video, :scope > a > video');
		if (1 === vs.length) {
			const v = vs[0] as HTMLVideoElement;
			v.muted       = true;
			v.playsInline = true;
			v.setAttribute('muted', 'true');
			v.setAttribute('playsinline', 'true');
			if (totalSize === 1) {
				v.setAttribute('loop', 'true');
			}
			this.#video = v;
			this.base.appendChild(v);
		}
	}

	onStateChanged(state: string, prev: string): void {
		super.onStateChanged(state, prev);

		if (prev === '' && (state === 'in' || state === 'display')) {
			if (this.#video.paused) {
				this.#video.setAttribute('autoplay', 'true');
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

	getDuration(_timeDur: number, timeTran: number, _doRandom: boolean): number {
		return this.#video.duration - timeTran * 2;
	}

}
