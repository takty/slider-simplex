/**
 * Backgrounds
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

const CLS_BG      = 'background';
const CLS_VISIBLE = 'visible';

export class Background {

	#bs: HTMLElement[] = [];

	constructor(root: HTMLElement, lis: HTMLElement[]) {
		const base: HTMLElement = document.createElement('div');
		base.classList.add(CLS_BG);
		root.insertBefore(base, root.firstChild);

		this.#bs = lis.map(li => {
			const img: HTMLImageElement | null = li.querySelector<HTMLImageElement>('img');
			const bg: HTMLElement = img ? img.cloneNode(false) as HTMLElement : document.createElement('div');
			base.appendChild(bg);
			return bg;
		});
	}

	transition(idx: number): void {
		this.#bs.forEach((t, i) => {
			t.classList.toggle(CLS_VISIBLE, i === idx);
		});
	}

}
