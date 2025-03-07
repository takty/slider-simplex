/**
 * Caption
 *
 * @author Takuto Yanagida
 * @version 2022-11-03
 */

export class Caption {

	static CLS_CAP = '-caption';

	static CLS_SUBTITLE = 'subtitle';
	static CLS_CIRCLE   = 'circle';
	static CLS_LINE     = 'line';

	static create(li: HTMLLIElement) {
		const elm = li.querySelector(':scope > div, :scope > a > div');
		return elm ? new Caption(elm as HTMLDivElement) : null;
	}

	#elm: HTMLDivElement;
	#caption: string = Caption.CLS_SUBTITLE;

	constructor(elm: HTMLDivElement) {
		this.#elm = elm;

		if ('' === elm.className) {
			elm.classList.add(Caption.CLS_CAP);
			elm.classList.add(Caption.CLS_SUBTITLE);
		}
		if (!elm.classList.contains(Caption.CLS_LINE) && !elm.classList.contains(Caption.CLS_CIRCLE)) {
			elm.classList.add(Caption.CLS_SUBTITLE);
		}
		if (elm.classList.contains(Caption.CLS_LINE))     this.#caption = Caption.CLS_LINE;
		if (elm.classList.contains(Caption.CLS_CIRCLE))   this.#caption = Caption.CLS_CIRCLE;
		if (elm.classList.contains(Caption.CLS_SUBTITLE)) this.#caption = Caption.CLS_SUBTITLE;

		const ds = elm.querySelectorAll(':scope > div');
		for (const d of ds) this.#wrapText(d as HTMLDivElement);
		this.#wrapText(elm);
		this.#wrapDiv(elm);
	}

	#wrapText(elm: HTMLDivElement) {
		for (const n of Array.from(elm.childNodes)) {
			if (3 === n.nodeType) {  // TEXT_NODE
				const str = (n as Text).nodeValue?.trim() ?? '';
				if ('' !== str) {
					const e = document.createElement('span');
					e.appendChild(document.createTextNode(str));
					n.parentNode?.replaceChild(e, n);
				}
			}
		}
	}

	#wrapDiv(elm: HTMLDivElement) {
		const tags = [];
		for (const n of Array.from(elm.childNodes)) {
			if (1 === n.nodeType) {  // ELEMENT_NODE
				if ('DIV' === (n as Element).tagName) {
					if (tags.length) {
						const e = document.createElement('div');
						for (const t of tags) e.appendChild(elm.removeChild(t));
						elm.insertBefore(e, n);
						tags.length = 0;
					}
				} else {
					tags.push(n);
				}
			}
		}
		if (tags.length) {
			const e = document.createElement('div');
			for (const t of tags) e.appendChild(elm.removeChild(t));
			elm.appendChild(e);
		}
	}

	getElement(): HTMLDivElement {
		return this.#elm;
	}

	onResize() {
		if (window.innerWidth < 600) {
			this.#elm.classList.remove(this.#caption);
			this.#elm.classList.add(Caption.CLS_SUBTITLE);
		} else {
			this.#elm.classList.remove(Caption.CLS_SUBTITLE);
			this.#elm.classList.add(this.#caption);
		}
	}
}
