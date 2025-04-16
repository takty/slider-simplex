/**
 * Pagination
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

const CLS_PAGINATION = 'pagination';
const CLS_VISIBLE    = 'visible';

type Fn = (idx: number, dir: -1 | 0 | 1) => void;

export class Pagination {

	#rs: HTMLElement[] = [];

	constructor(root: HTMLElement, size: number, fn: Fn, forced: boolean = true) {
		let base = root.querySelector('.' + CLS_PAGINATION);
		if (!base && forced) {
			base = document.createElement('div');
			base.classList.add(CLS_PAGINATION);
			root.appendChild(base);
		}
		if (!base) return;

		const e: HTMLOListElement = base.querySelector<HTMLOListElement>(':scope > ol') ?? base.appendChild(document.createElement('ol'))
		const dir = size === 2 ? 1 : 0;

		for (let i: number = 0; i < size; i += 1) {
			e.appendChild(this.createBullet(fn, i, dir));
		}
	}

	private createBullet(fn: Fn, i: number, dir: -1 | 0 | 1): HTMLElement {
		const r: HTMLElement = document.createElement('li');
		r.addEventListener('click', (): void => fn(i, dir));
		this.#rs.push(r);
		return r;
	}

	transition(idx: number): void {
		this.#rs.forEach((t, i) => {
			t.classList.toggle(CLS_VISIBLE, i === idx);
		});
	}

}
