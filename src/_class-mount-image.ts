/**
 * Image Mount
 *
 * @author Takuto Yanagida
 * @version 2025-03-15
 */

import { Mount } from './_class-mount';

const CLS_IMAGE  = 'image';
const CLS_SCROLL = 'scroll';
const CLS_DUAL   = 'dual';

const RANDOM_RATE = 10;

export class MountImage extends Mount {

	constructor(li: HTMLLIElement) {
		super(li);
		this.elm.classList.add(CLS_IMAGE);

		if (li.classList.contains(CLS_SCROLL)) {
			this.elm.classList.add(CLS_SCROLL);
		}

		const is = li.querySelectorAll(':scope > img, :scope > a > img');
		if (is.length) {
			this.elm.appendChild(is[0]);
			if (1 < is.length) {
				this.elm.classList.add(CLS_DUAL);
				this.elm.appendChild(is[1]);
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
