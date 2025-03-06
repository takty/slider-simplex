/**
 * Thumbnails
 *
 * @author Takuto Yanagida
 * @version 2021-06-24
 */

const CLS_VISIBLE = 'visible';

const thumbs: HTMLElement[] = [];

export function initThumbnails(id: string, size: number): void {
	if (size === 1) return;
	for (let i = 0; i < size; i += 1) {
		const tid = id + '-' + i;
		let it = document.querySelector('*[data-id="' + tid + '"]') as HTMLElement;
		if (!it) it = document.getElementById(tid) as HTMLElement;
		thumbs.push(it);
	}
}

export function transitionThumbnails(idx: number): void {
	for (const t of thumbs) {
		if (t) t.classList.remove(CLS_VISIBLE);
	}
	if (thumbs[idx]) thumbs[idx].classList.add(CLS_VISIBLE);
}
