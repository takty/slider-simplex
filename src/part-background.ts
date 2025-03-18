/**
 * Backgrounds
 *
 * @author Takuto Yanagida
 * @version 2025-03-13
 */

const CLS_BG      = 'background';
const CLS_VISIBLE = 'visible';

export class Background {

	#bs: HTMLElement[] = [];

	constructor(root: HTMLElement, lis: HTMLElement[]) {
		const base: HTMLElement = document.createElement('div');
		base.classList.add(CLS_BG);
		root.insertBefore(base, root.firstChild);

		for (const li of lis) {
			let bg: HTMLElement;

			const img: HTMLElement = li.querySelector('img') as HTMLElement;
			if (img) {
				bg = img.cloneNode(false) as HTMLElement;
			} else {
				bg = document.createElement('div');
			}
			base.appendChild(bg);
			this.#bs.push(bg);
		}
	}

	transition(i: number): void {
		for (const r of this.#bs) {
			r.classList.remove(CLS_VISIBLE);
		}
		if (this.#bs[i]) {
			this.#bs[i].classList.add(CLS_VISIBLE);
		}
	}

}
