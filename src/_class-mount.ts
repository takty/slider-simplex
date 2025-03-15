/**
 * Mount
 *
 * @author Takuto Yanagida
 * @version 2025-03-15
 */

export class Mount {

	protected elm: HTMLDivElement;

	constructor(li: HTMLLIElement) {
		this.elm = document.createElement('div');
		const e: HTMLElement = li.querySelector('a') ?? li;
		e.insertBefore(this.elm, e.firstChild);
	}

	setState(state: string, flag: boolean): void {
		if (flag) {
			this.elm.classList.add(state);
		} else {
			this.elm.classList.remove(state);
		}
	}

	transition(_isCur: boolean, _size: number): void {
	}

	display(_isCur: boolean): void {
	}

	getDuration(timeDur: number, _timeTran: number, _doRandom: boolean): number {
		return timeDur;
	}

	onResize(): boolean {
		return true;
	}

}
