/**
 * Mount - Video
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

import { waitForAllVideos } from './common';
import { Mount, CLS_VIDEO } from './mount';

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
