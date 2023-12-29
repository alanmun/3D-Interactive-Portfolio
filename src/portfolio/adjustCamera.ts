//This script handles all logic for moving the three.js camera around
import * as THREE from 'three'
import { Spawn } from './utils'
import { CelestialEntity } from './CelestialEntity'


//3D coordinates for where the camera should spawn at
const CAM_START = {
	x: 0,
	y: 0,//-27.5, //For some reason the grid and black hole seemed to be centered here instead of at 0...
	z: 360
}

//Preset for cameraLock that contains what the values should be for a camera at spawn
const goToSpawn = { isLocked: true, target: { position: CAM_START }, entity: null }

type cameraLockType = {
	isLocked: boolean, // * Whether camera currently is following target or not
	target: any // * The actual target of the camera, usually an Object3D/Group
	entity: CelestialEntity | Spawn // * The higher level conceptual target of the camera
}

export class UniverseCamera {

	public camera: THREE.PerspectiveCamera;
	public cameraLock: cameraLockType = { isLocked: false, target: null, entity: null }
	//Following are used by adjustCamera, persisting across calls to know if we are close in the z, x, or y coord, 
	//and the second three tell if we were already close
	public xIsClose = false
	public yIsClose = false
	public zIsClose = false
	public reachedTargetFirstTime = false //Prevents accidental fading when still close to a target
	public shouldPinCamera = false

	constructor() {
		this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 5000) //Instantiate and set up camera
	}

	public setupCamera(): void {
		this.camera.position.set(0, 400, 1200);
		this.cameraLock = goToSpawn;
		this.reachedTargetFirstTime = true;
	}

	//Actions for camera to perform in the "game" loop of three.js
	public animateCamera(): string {
		if (this.cameraLock.isLocked) {
			if (this.shouldPinCamera) this.pinCameraToWorld(this.cameraLock.target)
			else return this.adjustCamera(this.cameraLock.target);
		}
		return "";
	}

	public setCameraToSpawn() {
		this.cameraLock = goToSpawn;
	}

	//Actions for camera to perform when leaving a world
	public setCameraForLeaving() {
		this.shouldPinCamera = false
		this.camera.rotation.set(0, 0, 0) //radians, this is effectively a 90 degree rotation left
	}

	//Actions for camera to perform when entering a world
	public setCameraForEntering() {
		this.shouldPinCamera = true
		this.camera.rotation.set(0, 1.57, 0) //radians, this is effectively a 90 degree rotation left
	}

	public pinCameraToWorld(target: THREE.Object3D): void {
		this.camera.position.set(target.position.x, (target.position.y + 8), target.position.z) //Was same, same+10, same
	}

	//Returns true if camera has reached its final position
	public adjustCamera(target: THREE.Object3D): string {
		const xdiff = this.camera.position.x - target.position.x
		const ydiff = this.camera.position.y - target.position.y
		const zdiff = this.camera.position.z - target.position.z
		const fastInc = 0.08;
		const medInc = 0.05;
		const slowInc = 0.025;
		const nearlyThere = 0.05; //was going to call this slowestInc but its a similar value to medium Increment, which is kind of confusing

		//Because target isn't an Object3D when going to spawn, it won't have a name property. You can use below to check if target is a celestial
		//entity, or if we're just going back to spawn
		//console.log(target.hasOwnProperty("name"))

		// * The next step for smoother camera adjustments probably is going to be adding a case between 1 and 0.03, that uses _diff to affect the
		// * rate at which it travels to its target. The 0.03 case not using the distance to go in calculating how much to -= by creates a little
		// * bit of lag I think where that snapping effect occurs and maybe y has to catch up with z and x and the camera appears to drop down at
		// * the end. 

		//Handle x
		let absX = Math.abs(xdiff)
		if (absX > 18) this.camera.position.x -= xdiff * fastInc //Too far away in positive direction
		else if (absX > 5) {
			this.camera.position.x -= xdiff * medInc //Too far away in positive direction
			this.xIsClose = true
		}
		else if (absX > 1) {
			this.camera.position.x -= xdiff * slowInc //Too far away in positive direction
			this.xIsClose = true
		}
		else if (absX > 0.03) {
			this.camera.position.x -= Math.sign(xdiff) * nearlyThere
			this.xIsClose = true
		}
		else if (absX >= 0) {
			this.camera.position.x = target.position.x
			this.xIsClose = true
		}

		//Handle y
		let absY = Math.abs(ydiff);
		if (absY > 18) this.camera.position.y -= ydiff * fastInc //Too far away in positive direction
		else if (absY > 5) {
			this.camera.position.y -= ydiff * medInc //Too far away in positive direction
			this.yIsClose = true
		}
		else if (absY > 1) {
			this.camera.position.y -= ydiff * slowInc //Too far away in positive direction
			this.yIsClose = true
		}
		else if (absY > 0.03) {
			this.camera.position.y -= Math.sign(ydiff) * nearlyThere
			this.yIsClose = true
		}
		else if (absY >= 0) {
			this.camera.position.y = target.position.y
			this.yIsClose = true
		}

		//Handle z
		let absZ = Math.abs(zdiff);
		if (absZ > 18) this.camera.position.z -= zdiff * fastInc //Too far away in positive direction
		else if (absZ > 5) {
			this.camera.position.z -= zdiff * medInc //Too far away in positive direction
			this.zIsClose = true
		}
		else if (absZ > 1) {
			this.camera.position.z -= zdiff * slowInc //Too far away in positive direction
			this.zIsClose = true
		}
		else if (absZ > 0.03) {
			this.camera.position.z -= Math.sign(zdiff) * nearlyThere
			this.zIsClose = true
		}
		else if (absZ >= 0) {
			this.camera.position.z = target.position.z
			this.zIsClose = true
		}

		//Special case to see if camera is at the original spawn point, disable target lock
		if (this.camera.position.x == CAM_START.x && this.camera.position.y == CAM_START.y && this.camera.position.z == CAM_START.z) {
			this.cameraLock = { isLocked: false, target: null, entity: null }
			console.log("Matched at spawn: " + this.camera.position.x + "  " + CAM_START.x)
			this.xIsClose = false
			this.yIsClose = false
			this.zIsClose = false
			this.reachedTargetFirstTime = false
			return "approached spawn";
		}
		else if (this.xIsClose && this.yIsClose && this.zIsClose && !this.reachedTargetFirstTime) { //We are approaching something that isn't the original spawn point
			this.reachedTargetFirstTime = true
			return "approached world";
		}
		return "";
	}
}