/**
 * Transition
 *
 * @author Takuto Yanagida
 * @version 2025-04-16
 */

import { Slide } from './slide';

export const S_DISPLAY = 'display';
export const S_IN      = 'in';
export const S_OUT     = 'out';

export const CP_MOTION     = '--m';
export const CP_VISIBILITY = '--v';

export abstract class Transition {

	abstract transition(_idx: number, _dir: number): void;

	abstract isTransitioning(): boolean;

}

export type Item = {
	s: Slide,
	m: number,
	v: number,
};
