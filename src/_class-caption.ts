/**
 * Caption
 *
 * @author Takuto Yanagida
 * @version 2025-03-14
 */

const CLS_CAPTION = 'caption';

const CLS_SUBTITLE = 'subtitle';
const CLS_CIRCLE   = 'circle';
const CLS_LINE     = 'line';
const CLS_CUSTOM   = 'custom';

export class Caption {

	static create(li: HTMLElement): Caption | null {
		const elm: HTMLElement | null = li.querySelector(':scope > div, :scope > a > div');
		if (elm) {
			 return new Caption(elm as HTMLElement);
		}
		return null;
	}

	#e: HTMLElement;
	#type: string = CLS_SUBTITLE;

	constructor(e: HTMLElement) {
		this.#e = e;

		if (!e.classList.contains(CLS_CAPTION)) {
			e.classList.add(CLS_CAPTION);
		}
		if (!e.classList.contains(CLS_LINE) && !e.classList.contains(CLS_CIRCLE) && !e.classList.contains(CLS_CUSTOM)) {
			e.classList.add(CLS_SUBTITLE);
		}
		if (e.classList.contains(CLS_LINE))     this.#type = CLS_LINE;
		if (e.classList.contains(CLS_CIRCLE))   this.#type = CLS_CIRCLE;
		if (e.classList.contains(CLS_SUBTITLE)) this.#type = CLS_SUBTITLE;
		if (e.classList.contains(CLS_CUSTOM))   this.#type = CLS_CUSTOM;

		this.#wrap(e);
		for (const d of e.querySelectorAll(':scope > div')) {
			this.#wrapWithSpan(d as HTMLElement);
		}
	}

	#wrap(elm: HTMLElement): void {
		const ns: Node[] = [];

		for (const n of Array.from(elm.childNodes)) {
			if (1 === n.nodeType) {  // ELEMENT_NODE
				if ('DIV' === (n as Element).tagName) {
					this.#wrapAndReplaceNodes(elm, ns, n);
				} else if ('BR' === (n as Element).tagName) {
					this.#wrapAndReplaceNodes(elm, ns, n);
					elm.removeChild(n);
				} else {
					ns.push(n);
				}
			} else {
				const str: string = (n as Text).nodeValue?.trim() ?? '';
				if (str.length) {
					ns.push(n);
				}
			}
		}
		this.#wrapAndReplaceNodes(elm, ns, null);
	}

	#wrapAndReplaceNodes(e: Node, cs: Node[], ref: Node | null): void {
		if (cs.length) {
			const div: HTMLElement = document.createElement('div');
			for (const c of cs) {
				div.appendChild(e.removeChild(c));
			}
			e.insertBefore(div, ref);
			cs.length = 0;
		}
	}

	#wrapWithSpan(e: HTMLElement): void {
		const span: HTMLElement = document.createElement('span');
		for (const c of Array.from(e.childNodes)) {
			span.appendChild(e.removeChild(c));
		}
		span.innerHTML = span.innerHTML.trim();
		e.appendChild(span);
	}

	setState(state: string, flag: boolean): void {
		if (flag) {
			this.#e.classList.add(state);
		} else {
			this.#e.classList.remove(state);
		}
	}

	onResize(): void {
		if (window.innerWidth < 600) {
			this.#e.classList.remove(this.#type);
			this.#e.classList.add(CLS_SUBTITLE);
		} else {
			this.#e.classList.remove(CLS_SUBTITLE);
			this.#e.classList.add(this.#type);
		}
	}
}
