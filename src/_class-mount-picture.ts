/**
 * Mount Picture
 *
 * @author Takuto Yanagida
 * @version 2022-11-03
 */

export class MountPicture {

	static NS = 'slider-simplex';

	static CLS_PIC  = MountPicture.NS + '-picture';
	static CLS_DUAL = 'dual';

	static RANDOM_RATE = 10;

	#elm: HTMLDivElement;

	constructor(li: HTMLLIElement) {
		this.#elm = document.createElement('div');
		this.#elm.classList.add(MountPicture.CLS_PIC);

		const is = li.querySelectorAll(':scope > img, :scope > a > img');
		if (is.length) {
			this.#elm.appendChild(is[0]);
			if (1 < is.length) {
				this.#elm.classList.add(MountPicture.CLS_DUAL);
				this.#elm.appendChild(is[1]);
			}
		} else if (li.dataset.img) {
			const i = this.#createImage(li, { src: 'img', srcset: 'imgSrcset', sizes: 'imgSizes' });
			this.#elm.appendChild(i);
			if (li.dataset.imgSub) {
				this.#elm.classList.add(MountPicture.CLS_DUAL);
				const i = this.#createImage(li, { src: 'imgSub', srcset: 'imgSubSrcset', sizes: 'imgSubSizes' });
				this.#elm.appendChild(i);
			}
		}
	}

	#createImage(li: HTMLLIElement, keys: any): HTMLImageElement {
		const i: HTMLImageElement = document.createElement('img');
		i.src = li.dataset[keys.src] as string;

		const srcset = li.dataset[keys.srcset] ?? null;
		const sizes  = li.dataset[keys.sizes]  ?? null;
		if (srcset) i.srcset = srcset;
		if (sizes)  i.sizes  = sizes;
		return i;
	}

	getElement(): HTMLDivElement {
		return this.#elm;
	}

	transition(_isCur: boolean, _size: number): void {
	}

	display(_isCur: boolean): void {
	}

	getDuration(timeDur: number, _timeTran: number, doRandom: boolean): number {
		if (doRandom) {
			const f = (1 + 0.01 * MountPicture.RANDOM_RATE * (1 - Math.random() * 2));
			return timeDur * f;
		}
		return timeDur;
	}

	onResize(): boolean {
		return true;
	}

}
