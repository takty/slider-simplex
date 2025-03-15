/**
 * Navigation Buttons
 *
 * @author Takuto Yanagida
 * @version 2025-03-13
 */

const CLS_NAVIGATION = 'navigation';
const CLS_ACTIVE     = 'active';
const CLS_DISABLED   = 'disabled';

const DX_FLICK: number = 32;

type Fn = (idx: number, dir: number) => Promise<void>;

export class Navigation {

	static create(root: HTMLElement, size: number, fn: Fn, timeTran: number): void {
		if (1 === size) {
			return;
		}
		new Navigation(root, timeTran, fn);
	}

	#fs: (() => Promise<void>)[];
	#bs: HTMLElement[];

	constructor(root: HTMLElement, timeTran: number, fn: Fn) {
		const frame = root.querySelector(':scope > div.frame') as HTMLElement | null;

		this.#fs = [
			async (): Promise<void> => await fn(-1, -1),
			async (): Promise<void> => await fn(-1,  1),
		];
		this.#bs = this.createButtons(root, frame);

		if (frame) {
			frame.addEventListener('mouseenter', (): void => this.setActive(!root.classList.contains('touch')));
			frame.addEventListener('mouseleave', (): void => this.setActive(false));

			if (window.ontouchstart === null) {
				this.initializeFlick(frame, timeTran * 1000 / 2);
			}
		}
	}

	private createButtons(root: HTMLElement, frame: HTMLElement | null): HTMLElement[] {
		let bs: HTMLElement[] = root.querySelectorAll(':scope > div > button') as any as HTMLElement[];
		if (bs.length !== 2 && frame) {
			const b0: HTMLElement = document.createElement('button');
			const b1: HTMLElement = document.createElement('button');
			frame.appendChild(b0);
			frame.appendChild(b1);
			bs = [b0, b1];
		}
		for (let i: number = 0; i < 2; i += 1) {
			bs[i].classList.add(CLS_NAVIGATION);
			bs[i].addEventListener('click', async (): Promise<void> => this.doClick(i));
		}
		return bs;
	}

	private async doClick(dir: number): Promise<void> {
		this.#bs[0].classList.add(CLS_DISABLED);
		this.#bs[1].classList.add(CLS_DISABLED);
		await this.#fs[dir]();
		this.#bs[0].classList.remove(CLS_DISABLED);
		this.#bs[1].classList.remove(CLS_DISABLED);
	}

	private setActive(flag: boolean): void {
		this.#bs[0].classList[flag ? 'add' : 'remove'](CLS_ACTIVE);
		this.#bs[1].classList[flag ? 'add' : 'remove'](CLS_ACTIVE);
	}

	private initializeFlick(frame: HTMLElement, delay: number): void {
		const sts: number[] = [0, 0];
		let px: number = Number.NaN;

		frame.addEventListener('touchstart', (e: TouchEvent): void => {
			px = e.touches[0].pageX;
		});
		frame.addEventListener('touchmove', (e: TouchEvent): void => {
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
		frame.addEventListener('touchend', (): void => {
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
