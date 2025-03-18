/**
 * Common Functions
 *
 * @author Takuto Yanagida
 * @version 2025-03-18
 */

export function repeatUntil(timeout: number, fn: () => boolean): void {
	const f = () => {
		const finish: boolean = fn();
		if (!finish) {
			setTimeout(f, timeout);
		}
	}
	setTimeout(f, timeout);
}

export function detectTouch(elm: HTMLElement): void {
	if (0 < navigator.maxTouchPoints) {
		elm.addEventListener('pointerenter', (e: PointerEvent): void => {
			const isTouch: boolean = (e.pointerType !== 'mouse');
			elm.classList[isTouch ? 'add' : 'remove']('touch');
		}, { once: true });
	}
}


// -----------------------------------------------------------------------------


export function callAfterDocumentReady(fn: () => void): void {
	if ('loading' === document.readyState) {
		document.addEventListener('DOMContentLoaded', fn);
	} else {
		setTimeout(fn, 0);
	}
}


// -----------------------------------------------------------------------------


export interface AsyncTimeoutHandle {
	set  : () => Promise<void>;
	clear: () => void;
};

export function asyncTimeout(ms: number, fn: () => Promise<void>): AsyncTimeoutHandle {
	let tid: number | null = null;
	let res: () => void;
	return {
		set: () => new Promise((r) => {
			res = r
			tid = setTimeout(async () => {
				tid = null;
				await fn();
				r();
			}, ms);
		}),
		clear: (): void => {
			if (tid) {
				clearTimeout(tid);
				tid = null;
				res();
			}
		}
	};
}

export async function wait(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}


// -----------------------------------------------------------------------------


export function initializeViewportDetection(root: HTMLElement, cls: string, offset: number): void {
	const io = new IntersectionObserver((es) => {
		for (const e of es) root.classList[e.isIntersecting ? 'add' : 'remove'](cls);
	}, { rootMargin: `${offset}px 0px` });
	io.observe(root);

	document.addEventListener('visibilitychange', (): void => {
		const v: boolean = ('hidden' !== document.visibilityState);
		if (v) {
			const r = root.getBoundingClientRect();
			const h: number = window.innerHeight;
			if ((0 < r.top && r.top < h) || (0 < r.bottom && r.bottom < h)) {
				root.classList.add(cls);
			}
		} else {
			root.classList.remove(cls);
		}
	});
}
