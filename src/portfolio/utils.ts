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

// * Finds any object that has a property called propName in a massive object, and returns references to them in an array you can use to access each at will and modify in the original object (since objects are reference types in js)
export function findAllMatches(obj: any, propName: string) {
  let references: any = [];
	let visited = new WeakSet();

  function traverse(currentObj: any) {
		if(visited.has(currentObj)) return //* Guard against cyclical traversal (infinitely loops and exhausts call stack)
		visited.add(currentObj)

    for(const key in currentObj) {
			if(key === propName){
				references.push(currentObj);
			} else if(currentObj[key] !== null && typeof currentObj[key] === 'object') {
        traverse(currentObj[key]); // Recursively call on the nested object
      }
    }
  }

  traverse(obj);
  return references;
}

export type Spawn = null;