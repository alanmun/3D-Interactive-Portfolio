//Various helper functions and variables go here, that don't really fit anywhere else or are best put here to be reused 
//by multiple scripts.

//Celestial entities as enums for clean referencing
export enum CE { 
	spawn,
	blackHole,
	twitter,
	autosage,
	moon,
	finn
}

//This enum is used for both zoom direction (zoom in, zoom out) and fade direction (fade in fade out)
export enum Direction {
    in,
    out
}

//For use with loading screen
export function onTransitionEnd(event: any) {
	event.target.remove();	
}

export type Spawn = null;