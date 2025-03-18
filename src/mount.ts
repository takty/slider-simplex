/**
 * Mount
 *
 * @author Takuto Yanagida
 * @version 2025-03-18
 */

const CLS_IMAGE = 'image';
const CLS_VIDEO = 'video';

const CLS_SCROLL = 'scroll';
const CLS_DUAL   = 'dual';

const RANDOM_RATE = 10;

export abstract class Mount {

	protected base: HTMLElement;

	constructor(li: HTMLElement) {
		this.base = document.createElement('div');
		const e: HTMLElement = li.querySelector('a') ?? li;
		e.insertBefore(this.base, e.firstChild);
	}

	setState(state: string, flag: boolean): void {
		if (flag) {
			this.base.classList.add(state);
		} else {
			this.base.classList.remove(state);
		}
	}

	abstract getType(): string;

	transition(_isCur: boolean, _size: number): void {
	}

	display(_isCur: boolean): void {
	}

	getDuration(timeDur: number, _timeTran: number, _doRandom: boolean): number {
		return timeDur;
	}

	onResize(): boolean {
		return true;
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

	getType(): string {
		return 'image';
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
	#ar    : number | null = null;

	constructor(li: HTMLElement) {
		super(li);
		this.base.classList.add(CLS_VIDEO);

		const vs = li.querySelectorAll(':scope > video, :scope > a > video');
		if (1 === vs.length) {
			const v = vs[0] as HTMLVideoElement;
			v.muted       = true;
			v.playsInline = true;
			v.setAttribute('muted', 'true');
			v.setAttribute('playsinline', 'true');
			v.addEventListener('loadedmetadata', (): void => {
				const ar: number = v.clientWidth / v.clientHeight;
				this.#ar = (0 | (ar * 1000)) / 1000;
			});
			this.#video = v;
			this.base.appendChild(v);
		}
	}

	getType(): string {
		return 'video';
	}

	transition(isCur: boolean, size: number): void {
		if (isCur) {
			this.#video.setAttribute('autoplay', 'true');
			this.#video.play();
			if (size === 1) {
				this.#video.setAttribute('loop', 'true');
			}
		}
	}

	display(isCur: boolean): void {
		if (!isCur) {
			this.#video.pause();
			this.#video.currentTime = 0;
		}
	}

	getDuration(_timeDur: number, timeTran: number, _doRandom: boolean): number {
		return this.#video.duration - timeTran;
	}

	onResize(): boolean {
		if (!this.#ar) return false;
		const arFrame = this.base.clientWidth / this.base.clientHeight;
		if (this.#ar < arFrame) {
			this.#video.classList.remove('height');
			this.#video.classList.add('width');
		} else {
			this.#video.classList.remove('width');
			this.#video.classList.add('height');
		}
		return true;
	}

}
