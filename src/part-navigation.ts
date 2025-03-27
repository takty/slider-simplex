/**
 * Navigation Buttons
 *
 * @author Takuto Yanagida
 * @version 2025-03-28
 */

const CLS_NAVIGATION = 'navigation';
const CLS_ACTIVE     = 'active';

const DX_FLICK: number = 32;

type Fn = (idx: number, dir: -1 | 0 | 1) => void;

export class Navigation {

	#fs!: (() => void)[];
	#bs!: HTMLElement[];

	constructor(root: HTMLElement, timeTran: number, fn: Fn, forced: boolean = true) {
		let base: HTMLElement = root.querySelector('.' + CLS_NAVIGATION) as HTMLElement;
		if (!base && forced) {
			base = document.createElement('div');
			base.classList.add(CLS_NAVIGATION);
			root.appendChild(base);
		}
		if (!base) {
			return;
		}
		this.#fs = [
			(): void => fn(-1, -1),
			(): void => fn(-1,  1),
		];
		this.#bs = this.createButtons(base);

		base.addEventListener('mouseenter', (): void => this.setActive(!root.classList.contains('touch')));
		base.addEventListener('mouseleave', (): void => this.setActive(false));

		this.initializeFlick(root, timeTran * 1000 / 2);
	}

	private createButtons(base: HTMLElement): HTMLElement[] {
		let bs: HTMLElement[] = base.querySelectorAll(':scope > button') as any as HTMLElement[];
		if (bs.length !== 2) {
			const b0: HTMLElement = document.createElement('button');
			const b1: HTMLElement = document.createElement('button');
			base.appendChild(b0);
			base.appendChild(b1);
			bs = [b0, b1];
		}
		for (let i: number = 0; i < 2; i += 1) {
			bs[i].classList.add(CLS_NAVIGATION);
			bs[i].addEventListener('click', (): void => this.doClick(i));
		}
		return bs;
	}

	private doClick(dir: number): void {
		this.#fs[dir]();
	}

	private setActive(flag: boolean): void {
		this.#bs[0].classList[flag ? 'add' : 'remove'](CLS_ACTIVE);
		this.#bs[1].classList[flag ? 'add' : 'remove'](CLS_ACTIVE);
	}

	private initializeFlick(base: HTMLElement, delay: number): void {
		const sts: number[] = [0, 0];
		let px: number = Number.NaN;

		base.addEventListener('touchstart', (e: TouchEvent): void => {
			px = e.touches[0].pageX;
		});
		base.addEventListener('touchmove', (e: TouchEvent): void => {
			const dir: number = this.getFlickDir(px, e);
			if (dir !== -1) {
				if (true === e.cancelable) {
					e.preventDefault();
				}
				this.#fs[dir]();
				if (this.#bs[dir]) {
					clearTimeout(sts[dir]);
					this.#bs[dir].classList.add(CLS_ACTIVE);
					sts[dir] = setTimeout((): void => this.#bs[dir].classList.remove(CLS_ACTIVE), delay);
				}
				px = Number.NaN;
			}
		});
		base.addEventListener('touchend', (): void => {
			px = Number.NaN;
		});
	}

	private getFlickDir(px: number, e: TouchEvent): number {
		if (Number.isNaN(px)) return -1;
		const x: number = e.changedTouches[0].pageX;

		if (px + DX_FLICK < x) return 0;  // ->
		if (x < px - DX_FLICK) return 1;  // <-
		return -1;
	}

}
