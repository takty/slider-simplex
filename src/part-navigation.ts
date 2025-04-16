/**
 * Navigation Buttons
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

const CLS_NAVIGATION = 'navigation';
const CLS_ACTIVE     = 'active';
const CLS_TOUCH      = 'touch';

const DX_FLICK: number = 32;

type Fn = (idx: number, dir: -1 | 0 | 1) => void;

export class Navigation {

	#fs!: (() => void)[];
	#bs!: HTMLElement[];

	constructor(root: HTMLElement, timeTran: number, fn: Fn, forced: boolean = true) {
		let base = root.querySelector<HTMLElement>('.' + CLS_NAVIGATION);
		if (!base && forced) {
			base = document.createElement('div');
			base.classList.add(CLS_NAVIGATION);
			root.appendChild(base);
		}
		if (!base) return;

		this.#fs = [
			(): void => fn(-1, -1),
			(): void => fn(-1,  1),
		];
		this.#bs = this.createButtons(base);

		base.addEventListener('mouseenter', (): void => this.setActive(!root.classList.contains(CLS_TOUCH)));
		base.addEventListener('mouseleave', (): void => this.setActive(false));

		this.initializeFlick(root, timeTran / 2);
	}

	private createButtons(base: HTMLElement): HTMLButtonElement[] {
		let bs: HTMLButtonElement[] = Array.from(base.querySelectorAll<HTMLButtonElement>(':scope > button'));

		if (bs.length !== 2) {
			const b0: HTMLButtonElement = document.createElement('button');
			const b1: HTMLButtonElement = document.createElement('button');
			base.appendChild(b0);
			base.appendChild(b1);
			bs = [b0, b1];
		}
		bs.forEach((b, i) => {
			b.classList.add(CLS_NAVIGATION);
			b.addEventListener('click', (): void => this.doClick(i));
		});
		return bs;
	}

	private doClick(dir: number): void {
		this.#fs[dir]?.();
	}

	private setActive(flag: boolean): void {
		for (const b of this.#bs) {
			b.classList.toggle(CLS_ACTIVE, flag);
		}
	}

	private initializeFlick(base: HTMLElement, delay: number): void {
		const sts: [number, number] = [0, 0];
		let px: number | null = null;

		base.addEventListener('touchstart', (e: TouchEvent): void => {
			if (e.touches.length === 1) {
				px = e.touches[0]?.pageX ?? null;
			} else {
				px = null;
			}
		}, { passive: true });
		base.addEventListener('touchmove', (e: TouchEvent): void => {
			if (px === null || e.touches.length !== 1) return;

			const dir: number = this.getFlickDir(px, e.touches[0]);
			if (dir !== -1) {
				if (e.cancelable) {
					e.preventDefault();
				}
				this.#fs[dir]?.();

				const b = this.#bs[dir];
				if (b) {
					clearTimeout(sts[dir]);
					b.classList.add(CLS_ACTIVE);
					sts[dir] = setTimeout((): void => b.classList.remove(CLS_ACTIVE), delay);
				}
				px = null;
			}
		}, { passive: false });

		const resetTouch = (): void => {
			px = null;
		};
		base.addEventListener('touchend', resetTouch, { passive: true });
		base.addEventListener('touchcancel', resetTouch, { passive: true });
	}

	private getFlickDir(px: number, t: Touch | undefined): number {
		if (px === null || !t) return -1;

		const x: number = t.pageX;
		if (px + DX_FLICK < x) return 0;  // ->
		if (x < px - DX_FLICK) return 1;  // <-
		return -1;
	}

}
