/**
 * Thumbnails
 *
 * @author Takuto Yanagida
 * @version 2025-03-15
 */

const CLS_SELECTOR = 'selector';
const CLS_VISIBLE  = 'visible';

type Fn = (idx: number, dir: number) => Promise<void>;

export class Selector {

	#ts: HTMLElement[] = [];

	constructor(root: HTMLElement, lis: HTMLElement[], size: number, fn: Fn, forced: boolean = true) {
		let base: HTMLElement = root.querySelector('.' + CLS_SELECTOR) as HTMLElement;
		if (!base && forced) {
			base = document.createElement('div');
			base.classList.add(CLS_SELECTOR);
			root.appendChild(base);
		}
		if (!base) {
			return;
		}
		const e: HTMLElement = this.createElement(base);
		const dir = size === 2 ? 1 : 0;
		for (let i: number = 0; i < size; i += 1) {
			const li: HTMLElement = lis[i];
			let th: HTMLElement;

			const img: HTMLElement = li.querySelector('img') as HTMLElement;
			if (img) {
				th = img.cloneNode(false) as HTMLElement;
			} else {
				th = document.createElement('div');
			}
			const l: HTMLElement = document.createElement('li');
			l.appendChild(th);
			e.appendChild(l);
			l.addEventListener('click', (): Promise<void> => fn(i, dir));
			this.#ts.push(l);
		}
	}

	private createElement(base: HTMLElement): HTMLElement {
		let e: HTMLElement | null = base.querySelector(':scope > ol') as HTMLElement | null;
		if (!e) {
			e = document.createElement('ol');
			base.appendChild(e);
		}
		return e;
	}

	transition(i: number): void {
		for (const r of this.#ts) {
			r.classList.remove(CLS_VISIBLE);
		}
		if (this.#ts[i]) {
			this.#ts[i].classList.add(CLS_VISIBLE);
		}
	}

}
