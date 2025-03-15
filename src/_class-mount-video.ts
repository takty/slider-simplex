/**
 * Video Mount
 *
 * @author Takuto Yanagida
 * @version 2025-03-15
 */

import { Mount } from './_class-mount';

const CLS_VIDEO = 'video';

export class MountVideo extends Mount {

	#video!: HTMLVideoElement;
	#ar    : number | null = null;

	constructor(li: HTMLLIElement) {
		super(li);
		this.elm.classList.add(CLS_VIDEO);

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
			this.elm.appendChild(v);
		}
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
		const arFrame = this.elm.clientWidth / this.elm.clientHeight;
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
