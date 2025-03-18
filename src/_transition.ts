/**
 * Transition
 *
 * @author Takuto Yanagida
 * @version 2025-03-17
 */

export abstract class Transition {

	protected _size: number;
	protected _lis : HTMLLIElement[];
	protected _time: number;

	constructor(size: number, lis: HTMLLIElement[], tranTime: number) {
		this._size = size;
		this._lis  = lis;
		this._time = tranTime;
	}

	abstract transition(idx: number, dir: number): Promise<void>;

}
