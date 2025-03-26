/**
 * Caption
 *
 * @author Takuto Yanagida
 * @version 2025-03-26
 */

const CLS_CAPTION = 'caption';

const CLS_SUBTITLE = 'subtitle';
const CLS_CIRCLE   = 'circle';
const CLS_LINE     = 'line';
const CLS_CUSTOM   = 'custom';

const DS_KEY_STATE = 'state';

export class Caption {

	static create(li: HTMLElement): Caption | null {
		const elm: HTMLElement | null = li.querySelector(':scope > div, :scope > a > div');
		if (elm) {
			 return new Caption(elm as HTMLElement);
		}
		return null;
	}

	#base: HTMLElement;
	#type: string = CLS_SUBTITLE;

	constructor(base: HTMLElement) {
		this.#base = base;

		if (!base.classList.contains(CLS_CAPTION)) {
			base.classList.add(CLS_CAPTION);
		}
		if (!base.classList.contains(CLS_LINE) && !base.classList.contains(CLS_CIRCLE) && !base.classList.contains(CLS_CUSTOM)) {
			base.classList.add(CLS_SUBTITLE);
		}
		if (base.classList.contains(CLS_LINE))     this.#type = CLS_LINE;
		if (base.classList.contains(CLS_CIRCLE))   this.#type = CLS_CIRCLE;
		if (base.classList.contains(CLS_SUBTITLE)) this.#type = CLS_SUBTITLE;
		if (base.classList.contains(CLS_CUSTOM))   this.#type = CLS_CUSTOM;

		this.wrap(base);
		for (const d of base.querySelectorAll(':scope > div')) {
			this.wrapWithSpan(d as HTMLElement);
		}
	}

	private wrap(elm: HTMLElement): void {
		const ns: Node[] = [];

		for (const n of Array.from(elm.childNodes)) {
			if (1 === n.nodeType) {  // ELEMENT_NODE
				if ('DIV' === (n as Element).tagName) {
					this.wrapAndReplaceNodes(elm, ns, n);
				} else if ('BR' === (n as Element).tagName) {
					this.wrapAndReplaceNodes(elm, ns, n);
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
		this.wrapAndReplaceNodes(elm, ns, null);
	}

	private wrapAndReplaceNodes(e: Node, cs: Node[], ref: Node | null): void {
		if (cs.length) {
			const div: HTMLElement = document.createElement('div');
			for (const c of cs) {
				div.appendChild(e.removeChild(c));
			}
			e.insertBefore(div, ref);
			cs.length = 0;
		}
	}

	private wrapWithSpan(e: HTMLElement): void {
		const span: HTMLElement = document.createElement('span');
		for (const c of Array.from(e.childNodes)) {
			span.appendChild(e.removeChild(c));
		}
		span.innerHTML = span.innerHTML.trim();
		e.appendChild(span);
	}

	onStateChanged(state: string, _prev: string): void {
		this.#base.dataset[DS_KEY_STATE] = state;
	}

	onResize(): void {
		if (window.innerWidth < 600) {
			this.#base.classList.remove(this.#type);
			this.#base.classList.add(CLS_SUBTITLE);
		} else {
			this.#base.classList.remove(CLS_SUBTITLE);
			this.#base.classList.add(this.#type);
		}
	}

}
