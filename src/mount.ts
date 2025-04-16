/**
 * Mount
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

export const CLS_IMAGE = 'image';
export const CLS_VIDEO = 'video';

export const CLS_SCROLL = 'scroll';
export const CLS_DUAL   = 'dual';

const DS_KEY_STATE = 'state';

export abstract class Mount {

	protected base: HTMLElement;

	constructor(li: HTMLElement) {
		this.base = document.createElement('div');
		const e: HTMLElement = li.querySelector('a') ?? li;
		e.insertBefore(this.base, e.firstChild);
	}

	abstract isLoaded(): Promise<boolean>;

	onStateChanged(state: string, _prev: string): void {
		this.base.dataset[DS_KEY_STATE] = state;
	}

	getDuration(timeDur: number, _timeTran: number, _randomRate: number): number {
		return timeDur;
	}

}

