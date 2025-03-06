/**
 * Common Functions
 *
 * @author Takuto Yanagida
 * @version 2022-08-01
 */


const resizeListeners: (() => void)[] = [];

export function onResize(fn: () => void, doFirst = false): void {
	if (doFirst) fn();
	resizeListeners.push(throttle(fn));
}

export function onLoad(fn: () => void): void {
	if ('loading' === document.readyState) {
		document.addEventListener('DOMContentLoaded', fn);
	} else {
		setTimeout(fn, 0);
	}
}


// -----------------------------------------------------------------------------


export function initResizeEventHandler(): void {
	window.addEventListener('resize', () => { for (const l of resizeListeners) l(); }, { passive: true });
}

export function throttle(fn: () => void): () => void {
	let isRunning: boolean = false;
	function run() {
		isRunning = false;
		fn();
	}
	return () => {
		if (isRunning) return;
		isRunning = true;
		requestAnimationFrame(run);
	};
}

export function asyncTimeout(ms: number, fn: () => void = () => {}): { set: () => Promise<void>, clear: () => void } {
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
		clear: () => {
			if (tid) {
				clearTimeout(tid);
				tid = null;
				res();
			}
		}
	};
}


// -----------------------------------------------------------------------------


export function initViewportDetection(root: HTMLElement, cls: string, offset: number): void {
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
