/**
 * Mount - Image
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

import { waitForAllImages } from './common';
import { Mount, CLS_IMAGE, CLS_SCROLL, CLS_DUAL } from './mount';

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
