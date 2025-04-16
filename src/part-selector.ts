/**
 * Thumbnails
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

const CLS_SELECTOR = 'selector';
const CLS_VISIBLE  = 'visible';

type Fn = (idx: number, dir: -1 | 0 | 1) => void;

export class Selector {

	#ts: HTMLElement[] = [];

	constructor(root: HTMLElement, lis: HTMLElement[], size: number, fn: Fn, forced: boolean = true) {
		let base: HTMLElement | null = root.querySelector<HTMLElement>('.' + CLS_SELECTOR);
		if (!base && forced) {
			base = document.createElement('div');
			base.classList.add(CLS_SELECTOR);
			root.appendChild(base);
		}
		if (!base) return;

		const e: HTMLOListElement = base.querySelector<HTMLOListElement>(':scope > ol') ?? base.appendChild(document.createElement('ol'));
		const dir = size === 2 ? 1 : 0;

		for (let i: number = 0; i < size; i += 1) {
			e.appendChild(this.createThumbnail(lis[i]!, fn, i, dir));
		}
	}

	private createThumbnail(li: HTMLElement, fn: Fn, i: number, dir: -1 | 0 | 1): HTMLElement {
		const r: HTMLElement = document.createElement('li');

		const img: HTMLImageElement | null = li.querySelector<HTMLImageElement>('img');
		const th : HTMLElement = img ? img.cloneNode(false) as HTMLElement : document.createElement('div');
		r.appendChild(th);

		r.addEventListener('click', (): void => fn(i, dir));
		this.#ts.push(r);
		return r;
	}

	transition(idx: number): void {
		this.#ts.forEach((t, i) => {
			t.classList.toggle(CLS_VISIBLE, i === idx);
		});
	}

}
