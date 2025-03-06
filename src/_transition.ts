/**
 * Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-06
 */

export abstract class Transition {

	protected _size: number;
	protected _lis : HTMLLIElement[];
	protected _time: number;

	constructor(size: number, slides: HTMLLIElement[], tranTime: number) {
		this._size = size;
		this._lis  = slides;
		this._time = tranTime;
	}

	abstract transition(idx: number, dir: number): Promise<void>;

}
