/**
 * Pagination
 *
 * @author Takuto Yanagida
 * @version 2025-03-22
 */

const CLS_PAGINATION = 'pagination';
const CLS_VISIBLE    = 'visible';

type Fn = (idx: number, dir: -1 | 0 | 1) => void;

export class Pagination {

	#rs: HTMLElement[] = [];

	constructor(root: HTMLElement, size: number, fn: Fn, forced: boolean = true) {
		let base: HTMLElement = root.querySelector('.' + CLS_PAGINATION) as HTMLElement;
		if (!base && forced) {
			base = document.createElement('div');
			base.classList.add(CLS_PAGINATION);
			root.appendChild(base);
		}
		if (!base) {
			return;
		}
		const e: HTMLElement = this.createElement(base);
		const dir = size === 2 ? 1 : 0;
		for (let i: number = 0; i < size; i += 1) {
			e.appendChild(this.createBullet(fn, i, dir));
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

	private createBullet(fn: Fn, i: number, dir: -1 | 0 | 1): HTMLElement {
		const r: HTMLElement = document.createElement('li');
		r.addEventListener('click', (): void => fn(i, dir));
		this.#rs.push(r);
		return r;
	}

	transition(i: number): void {
		for (const r of this.#rs) {
			r.classList.remove(CLS_VISIBLE);
		}
		if (this.#rs[i]) {
			this.#rs[i].classList.add(CLS_VISIBLE);
		}
	}

}
