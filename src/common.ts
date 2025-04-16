/**
 * Common Functions
 *
 * @author Takuto Yanagida
 * @version 2025-04-15
 */

export function wrapAround(n: number, size: number): number {
	return size <= n ? n - size : (n < 0 ? size + n : n);
}

export function snapToBinary(n: number, e: number = 0.0001): number {
	if (n < e)     return 0;
	if (1 - e < n) return 1;
	return n;
}


// -----------------------------------------------------------------------------


export function detectTouch(elm: HTMLElement): void {
	if (0 < navigator.maxTouchPoints) {
		elm.addEventListener('pointerenter', (e: PointerEvent): void => {
			const isTouch: boolean = (e.pointerType !== 'mouse');
			elm.classList.toggle('touch', isTouch);
		});
	}
}


// -----------------------------------------------------------------------------


export function repeatAnimationFrame(fn: (timestamp: number, deltaTime: number) => void): void {
	let tl: number = 0;
	const cb: FrameRequestCallback = (t: number): void => {
		if (tl !== 0) {
			fn(t, t - tl);
		}
		tl = t;
		window.requestAnimationFrame(cb);
	}
	window.requestAnimationFrame(cb);

}

export function callAfterDocumentReady(fn: () => void): void {
	if ('loading' === document.readyState) {
		document.addEventListener('DOMContentLoaded', fn);
	} else {
		setTimeout(fn, 0);
	}
}


// -----------------------------------------------------------------------------


export function initializeViewportDetection(root: HTMLElement, cls: string, offset: number): void {
	const io = new IntersectionObserver((es: IntersectionObserverEntry[]): void => {
		for (const e of es) {
			root.classList.toggle(cls, e.isIntersecting);
		}
	}, { rootMargin: `${offset}px 0px` });
	io.observe(root);

	document.addEventListener('visibilitychange', (): void => {
		const v: boolean = 'visible' === document.visibilityState;
		if (v) {
			const r: DOMRect = root.getBoundingClientRect();
			const h: number  = window.innerHeight;
			if (r.top < h && 0 < r.bottom) {
				root.classList.add(cls);
			}
		} else {
			root.classList.remove(cls);
		}
	});
}


// -----------------------------------------------------------------------------


export function waitForAllImages(is: HTMLImageElement[]): Promise<boolean> {
	return Promise.all(
		is.map((i: HTMLImageElement): Promise<void> => {
			if (i.complete && i.naturalWidth !== 0) {
				return Promise.resolve();
			}
			return new Promise<void>((resolve, reject) => {
				i.addEventListener('load', (): void => resolve(), { once: true });
				i.addEventListener('error', (): void => reject(new Error('Image failed to load')), { once: true });
			});
		})
	).then(
		(): boolean => true,
		(): boolean => false
	);
}

export function waitForAllVideos(vs: HTMLVideoElement[]): Promise<boolean> {
	return Promise.all(
		vs.map((v: HTMLVideoElement): Promise<void> => {
			if (v.readyState >= 1) {  // HAVE_METADATA
				return Promise.resolve();
			}
			return new Promise<void>((resolve, reject) => {
				v.addEventListener('loadedmetadata', (): void => resolve(), { once: true });
				v.addEventListener('error', (): void => reject(new Error('Video failed to load metadata')), { once: true });
			});
		})
	).then(
		(): boolean => true,
		(): boolean => false
	);
}
