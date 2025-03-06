/**
 * Mount Video
 *
 * @author Takuto Yanagida
 * @version 2025-03-05
 */

export class MountVideo {

	static NS = 'slider-simplex';

	static CLS_VIDEO = MountVideo.NS + '-video';

	#elm   : HTMLDivElement;
	#video!: HTMLVideoElement;
	#ar    : number | null = null;

	constructor(li: HTMLLIElement) {
		this.#elm = document.createElement('div');
		this.#elm.classList.add(MountVideo.CLS_VIDEO);

		const vs = li.querySelectorAll(':scope > video, :scope > a > video');
		if (1 === vs.length) {
			const v = vs[0];
			this.#initialize(v as HTMLVideoElement);
			this.#elm.appendChild(v);
			this.#video = v as HTMLVideoElement;
		} else if (li.dataset.video) {
			const v: HTMLVideoElement = this.#createVideo(li);
			this.#initialize(v);
			this.#elm.appendChild(v);
			this.#video = v;
		}
	}

	#createVideo(li: HTMLLIElement): HTMLVideoElement {
		const v: HTMLVideoElement  = document.createElement('video');
		const s: HTMLSourceElement = document.createElement('source');
		s.setAttribute('src', li.dataset.video as string);
		v.appendChild(s);
		return v;
	}

	#initialize(v: HTMLVideoElement): void {
		v.muted       = true;
		v.playsInline = true;
		v.setAttribute('muted', 'true');
		v.setAttribute('playsinline', 'true');
		v.addEventListener('loadedmetadata', (): void => {
			const ar = v.clientWidth / v.clientHeight;
			this.#ar = (0 | (ar * 1000)) / 1000;
		});
	}

	getElement(): HTMLDivElement {
		return this.#elm;
	}

	transition(isCur: boolean, size: number): void {
		if (isCur) {
			this.#video.setAttribute('autoplay', 'true');
			this.#video.play();
			if (size === 1) this.#video.setAttribute('loop', 'true');
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
		const arFrame = this.#elm.clientWidth / this.#elm.clientHeight;
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
