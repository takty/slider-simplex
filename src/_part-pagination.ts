/**
 * Pagination
 *
 * @author Takuto Yanagida
 * @version 2025-03-13
 */

const CLS_PAGINATION = 'pagination';
const CLS_VISIBLE    = 'visible';

type Fn = (idx: number, dir: number) => Promise<void>;

export class Pagination {

	static create(root: HTMLElement, size: number, fn: Fn): Pagination | null {
		if (1 === size) {
			return null;
		}
		return new Pagination(root, size, fn);
	}

	#rs: HTMLElement[] = [];

	constructor(root: HTMLElement, size: number, fn: Fn) {
		let e: HTMLElement = this.createElement(root);
		const dir = size === 2 ? 1 : 0;
		for (let i: number = 0; i < size; i += 1) {
			e.appendChild(this.createBullet(fn, i, dir));
		}
	}

	private createElement(root: HTMLElement): HTMLElement {
		let e: HTMLElement | null = root.querySelector(':scope > ol') as HTMLElement | null;
		if (!e) {
			e = document.createElement('ol');
			root.appendChild(e);
		}
		e.classList.add(CLS_PAGINATION);
		return e;
	}

	private createBullet(fn: Fn, i: number, dir: number): HTMLElement {
		const r: HTMLElement = document.createElement('li');
		r.addEventListener('click', (): Promise<void> => fn(i, dir));
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
