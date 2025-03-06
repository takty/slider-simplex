/**
 * Slide
 *
 * @author Takuto Yanagida
 * @version 2022-11-03
 */

import { Caption } from './_class-caption';
import { MountPicture } from './_class-mount-picture';
import { MountVideo } from './_class-mount-video';

export class Slide {

	static CLS_SCROLL      = 'scroll';
	static CLS_PRE_DISPLAY = 'pre-display';
	static CLS_DISPLAY     = 'display';

	#idx: number = 0;
	#cap: Caption | null;
	#mnt: MountVideo | MountPicture;
	#type: string = '';

	constructor(li: HTMLLIElement, idx: number, useCaption = true) {
		this.#idx = idx;
		this.#cap = useCaption ? Caption.create(li) : null;

		if (this.#isVideo(li)) {
			this.#mnt  = new MountVideo(li);
			this.#type = 'video';
		} else {
			this.#mnt  = new MountPicture(li);
			this.#type = 'image';
		}
		if (li.classList.contains(Slide.CLS_SCROLL)) {
			this.#mnt.getElement().classList.add(Slide.CLS_SCROLL);
		}
		li.insertBefore(this.#mnt.getElement(), li.firstChild);
		const e = li.querySelector('a') ?? li;
		e.insertBefore(this.#mnt.getElement(), e.firstChild);
	}

	getType(): string {
		return this.#type;
	}

	#isVideo(li: HTMLLIElement): boolean {
		if (li.dataset.video) return true;
		const v = li.querySelector(':scope > video, :scope > a > video');
		return null !== v;
	}

	onResize(): boolean {
		if ('video' === this.#type && !this.#mnt.onResize()) return false;
		if (this.#cap) this.#cap.onResize();
		return true;
	}

	onPreDisplay(cur: number, size: number): void {
		const m = ((this.#idx % size) === cur) ? 'add' : 'remove';
		this.#mnt.getElement().classList[m](Slide.CLS_PRE_DISPLAY);
		if (this.#cap) this.#cap.getElement().classList[m](Slide.CLS_PRE_DISPLAY);
	}

	transition(cur: number, size: number): void {
		this.#mnt.transition((this.#idx % size) === cur, size);
	}

	display(cur: number, size: number): void {
		const m = ((this.#idx % size) === cur) ? 'add' : 'remove';
		this.#mnt.getElement().classList[m](Slide.CLS_DISPLAY);
		if (this.#cap) this.#cap.getElement().classList[m](Slide.CLS_DISPLAY);

		this.#mnt.display((this.#idx % size) === cur);
	}

	getDuration(timeDur: number, timeTran: number, doRandom: boolean): number {
		return this.#mnt.getDuration(timeDur, timeTran, doRandom);
	}

}