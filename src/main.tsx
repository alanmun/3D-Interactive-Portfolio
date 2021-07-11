import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Color, MathUtils } from 'three';
import { randFloat } from 'three/src/math/MathUtils'

let scene: THREE.Scene;
let camera: THREE.Camera;
let renderer: THREE.WebGLRenderer;
var zoomOutAudio = new Audio('src/assets/zoomout.wav');
zoomOutAudio.volume = 0.9
var backgroundAudio = new Audio('src/assets/background.wav')
backgroundAudio.volume = 0.65

//Used by adjustCamera, persisting across calls to know if we are close in the z, x, or y coord, and the second three tell if we were already close
var xIsClose = false
var yIsClose = false
var zIsClose = false
var alreadyFadedThisTarget = false //Prevents accidental fading when still close to a target

//Set up mouse clicking functionality
var raycaster = new THREE.Raycaster(); 
var mouse = new THREE.Vector2(); //2D representation of where a mouse click occurs
const CAM_START = {
	x: 0,
	y: -27.5, //For some reason the grid and black hole seem to be centered here instead of at 0...
	z: 240
}
type cameraLockType = {
	isLocked: boolean,
	target: any
}
let cameraLock:cameraLockType = {isLocked: false, target: null} //Instantiate a cameraLock struct

class App extends Component {

	addStar(){
		const starGeo = new THREE.SphereGeometry(0.25, 24, 24)
		const starMat = new THREE.MeshStandardMaterial({color: new Color("white")})
		const star = new THREE.Mesh(starGeo, starMat)

		let x,y,z;
		let xIsNeg, yIsNeg, zIsNeg
		xIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		yIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		zIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		const outerBound = 300

		if(xIsNeg == -1) x = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else x = THREE.MathUtils.randFloat(15, outerBound)
		if(yIsNeg == -1) y = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else y = THREE.MathUtils.randFloat(15, outerBound)
		if(zIsNeg == -1) z = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else z = THREE.MathUtils.randFloat(15, outerBound)

		star.position.set(x, y, z);
		scene.add(star)
	}

	addCelestialEntity(pos: THREE.Vector3, size: number, texture: any, bumpMap: any, metalness: number){

		const celestialEntity = new THREE.Mesh(
			new THREE.SphereGeometry(size, 128, 128),
			new THREE.MeshStandardMaterial({map: texture, metalness: metalness})
		)
		celestialEntity.material.normalMap = bumpMap
		if(texture == null) celestialEntity.material.color = new Color("black") //if there is a texture, color covers over it
		celestialEntity.position.set(pos.x, pos.y, pos.z)
		scene.add(celestialEntity)
		return celestialEntity
	}

	//Adjust the orbit of an entity, distance specifies how far away and theta is what degree it is with respect to what it orbits
	adjustOrbit(entity: THREE.Mesh, distance: number, theta: number, phi: number) {
		/*
		(0,r) ends up at x = rsin(Theta), y = rcos(Theta) for a circle

		For a sphere:
		x = ρsin(ϕ)cos(θ)
		y = ρsin(ϕ)sin(θ)
		z = ρcos(ϕ)
		ρ = r/sin(ϕ)
		*/
		const alpha = 0.005
		entity.position.x = distance*Math.sin(theta)
		entity.position.y = distance*Math.cos(theta)
		//entity.position.z = distance*Math.sin(theta)
		theta += (0.0025 / (alpha*distance)) //orbiting speed is a function of distance from celestial mass
		if(theta >= 360) theta = 0

		return theta

		// const alpha = 0.005
		// const p = distance/Math.sin(phi)
		// entity.position.x = p * Math.sin(phi) * Math.cos(theta)
		// entity.position.y = p * Math.sin(phi) * Math.sin(theta)
		// entity.position.z = p * Math.cos(phi)

		// phi += (0.0025 / (alpha*distance)) //orbiting speed is a function of distance from celestial mass
		// theta += (0.0025 / (alpha*distance)) //orbiting speed is a function of distance from celestial mass
		// if(phi >= 360) phi = 0
		// if(theta >= 360) theta = 0

		// return new Array(theta, phi)
	}

	adjustCamera(target: THREE.Object3D, fastInc: number = 0.08, slowInc: number = 0.05){
		const xdiff = camera.position.x - target.position.x
		const ydiff = camera.position.y - target.position.y
		const zdiff = camera.position.z - target.position.z
		var xMatched = false
		var yMatched = false
		var zMatched = false

		//Might be able to simplify bottom code to not have a positive and negative version, by comparing with abs(diff), and always += the diff, no abs after +=
		
		//Handle x
		console.log("xdiff: " + xdiff + " ydiff: " + ydiff + "zdiff: " + zdiff)
		if(xdiff > 16) camera.position.x -= xdiff * fastInc //Too far away in positive direction
		if(xdiff > 3 && xdiff <= 16) {
			camera.position.x -= xdiff * slowInc //Too far away in positive direction
			xIsClose = true
		}
		if(xdiff >= 0 && xdiff <= 3){
			camera.position.x = target.position.x
			xIsClose = true
			xMatched = true
		} 

		if(xdiff < -16) camera.position.x += Math.abs(xdiff) * fastInc //Too far away in negative direction
		if(xdiff < -3 && xdiff >= -16) {
			camera.position.x += Math.abs(xdiff) * slowInc //Too far away in negative direction
			xIsClose = true
		}
		if(xdiff >= -3 && xdiff <= 0) { //Only perform this block once per target, and we don't make this false again until you are back at original spawn
			camera.position.x = target.position.x
			xIsClose = true
			xMatched = true
		}

		//Handle y
		if(ydiff > 16) camera.position.y -= ydiff * fastInc //Too far away in positive direction
		if(ydiff > 3 && ydiff <= 16) {
			camera.position.y -= ydiff * slowInc //Too far away in positive direction
			yIsClose = true
		}
		if(ydiff >= 0 && ydiff <= 3) {
			camera.position.y = target.position.y
			yIsClose = true
			yMatched = true
		}

		if(ydiff < -16) camera.position.y += Math.abs(ydiff) * fastInc //Too far away in negative direction
		if(ydiff < -3 && ydiff >= -16) {
			camera.position.y += Math.abs(ydiff) * slowInc //Too far away in negative direction
			yIsClose = true
		}
		if(ydiff >= -3 && ydiff <= 0) {
			camera.position.y = target.position.y
			yIsClose = true
			yMatched = true
		}
		
		//Handle z
		if(zdiff > 16) camera.position.z -= zdiff * fastInc //Too far away in positive direction
		if(zdiff > 3 && zdiff <= 16) {
			camera.position.z -= zdiff * slowInc //Too far away in positive direction
			zIsClose = true
		}
		if(zdiff >= 0 && zdiff <= 3) {
			camera.position.z = target.position.z
			zIsClose = true
			zMatched = true
		}

		if(zdiff < -16) camera.position.z += Math.abs(zdiff) * fastInc //Too far away in negative direction
		if(zdiff < -3 && zdiff >= -16) {
			camera.position.z += Math.abs(zdiff) * slowInc //Too far away in negative direction
			zIsClose = true
		}
		if(zdiff >= -3 && zdiff <= 0) {
			camera.position.z = target.position.z
			zIsClose = true
			zMatched = true
		}

		//Special case to see if camera is at the original spawn point, disable target lock
		if(camera.position.x == CAM_START.x && camera.position.y == CAM_START.y && camera.position.z == CAM_START.z){
			cameraLock = {isLocked: false, target: null}
			console.log("Matched: " + camera.position.x + "  " + CAM_START.x)
			xIsClose = false
			yIsClose = false
			zIsClose = false
			alreadyFadedThisTarget = false
		} 
		else if(xIsClose && yIsClose && zIsClose) {
			if(alreadyFadedThisTarget == false) fade()
			alreadyFadedThisTarget = true
		}
		//else if(xMatched && yMatched && zMatched) cameraLock = {isLocked: false, target: null} //This may not be necessary...

	}

	componentDidMount() {

		let debug = false
		let scrollMode = false
		let orbitControlsMode = false

		scene = new THREE.Scene(); //Instantiate the scene

		document.body.addEventListener("mousemove", function () {
			backgroundAudio.play() //Do not start music until mouse is moved. Chrome does not allow audio to autoplay for spam reasons
		})

		//Start loading in any textures
		let spaceTexture = new THREE.TextureLoader().loadAsync('src/assets/pillarsofcreation.jpg', onTextureLoad)
		spaceTexture.then(value => {
			console.log("space texture loaded")
			scene.background = value
		})

		let moonTexture = new THREE.TextureLoader().load('src/assets/moon.jpg')
		let moonNormal = new THREE.TextureLoader().load('src/assets/moonbumpmap.jpg')

		//Instantiate and set up camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
		camera.position.z = CAM_START.z //Move camera back so its not in center of scene
		camera.position.y = CAM_START.y //Move camera back so its not in center of scene

		window.addEventListener("mousedown", onMouseClick, false) //If orbit controls are on, they intercept the mouse click and this doesn't work
		window.addEventListener("keydown", onBackOutKey, false)

		//Instantiate and set up renderer
		renderer = new THREE.WebGLRenderer({
				canvas: document.querySelector('#bg') as HTMLCanvasElement,
		})
		renderer.setPixelRatio(window.devicePixelRatio) //
		renderer.setSize(window.innerWidth, window.innerHeight) //Fullscreen
		document.body.appendChild(renderer.domElement); //Add renderer to the dom, which is responsible for drawing camera and scene

		//define some Geometry
		const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
		const material = new THREE.MeshStandardMaterial({color: 0xFF6347, wireframe: false});
		const torus = new THREE.Mesh(geometry, material);
		scene.add(torus)

		//Add some light
		const pL = new THREE.PointLight(new Color("black"))
		const lH = new THREE.PointLightHelper(pL)
		pL.position.set(5,5,5)
		scene.add(pL)
		if(debug) scene.add(lH)

		const aL = new THREE.AmbientLight(new Color("white"))
		scene.add(aL)

		//GridHelper
		const gH = new THREE.GridHelper(200, 50)
		if(debug) scene.add(gH)

		//Move around in the scene with your mouse!
		let controls: OrbitControls
		if(orbitControlsMode) controls = new OrbitControls(camera, renderer.domElement);

		//Populate the universe
		Array(500).fill(0).forEach(this.addStar) //with stars

		let blackHole = this.addCelestialEntity(new THREE.Vector3(0, 0, 0), 9, null, null, 1.0) //with a black hole so massive everything orbits around it

		let moon = this.addCelestialEntity(new THREE.Vector3(0, 0, 0), 18, moonTexture, moonNormal, 0.0) //with a moon!
		console.log(moon.material.map) //Neither of these are loaded at this point, yet map works fine.
		console.log(moon.material.normalMap)

		let thetaDonut: number = 0 //degrees
		let phiDonut = 0
		let thetaMoon: number = 90
		let phiMoon = 0

		if(scrollMode) window.onscroll = moveCamera
		
		//three.js "game" loop
		const animate = () =>{
			requestAnimationFrame(animate)
			
			//Adjust orbits
			thetaDonut = this.adjustOrbit(torus, 100, thetaDonut, phiDonut)
			thetaMoon = this.adjustOrbit(moon, 150, thetaMoon, phiMoon)

			//Adjust rotations
			torus.rotation.z += 0.001
			torus.rotation.x += 0.01
			torus.rotation.y += 0.005
			//moon.rotation.z += 0.001
			moon.rotation.x += 0.001
			moon.rotation.y += 0.001

			if(orbitControlsMode) controls.update()

			if(cameraLock.isLocked) this.adjustCamera(cameraLock.target)

			renderer.render(scene, camera);
		}

		animate()
	}

	render() {
		return (
			<>
				<canvas id="bg"></canvas>
				<main>
					{/* <span id="fader"></span> */}
					<div id="text">
						Here's some fucken text
					</div>
				</main>
			</>
		)
	}
}

function onMouseClick(event: THREE.Event) { 
	// calculate mouse position in normalized device coordinates 
	// (-1 to +1) for both components
	//Potential Issue: window resizes seem to confuse three.js and it doesn't know where things are anymore. If you open up console when it wasn't 
	//opened, that resizes the window and shifts the black hole over, but where it was originally located is where three js reports an object intersection
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1; //I believe these convert to centered normalized coordinates x,y at 0,0 is exact center of screen
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // height 100, click at 5, -5/100 = -0.05*2 is -slowInc + 1 means click was registered at y = 0.9

	raycaster.setFromCamera(mouse, camera); // update the picking ray with the camera and mouse position
	raycaster.intersectObjects(scene.children); // calculate objects intersecting the picking ray   
	var intersects = raycaster.intersectObjects(scene.children);
	for(var i = 0; i < intersects.length; i++){
		if(intersects[i].object as THREE.Mesh) {
			//This code may be firing by accident if camera is too close to an Object3D
			let obj = intersects[i].object as THREE.Mesh;
			console.log(typeof(obj));
			cameraLock.isLocked = true;
			cameraLock.target = obj;
			//playSoundEffect()
			//(obj as any).material.color.set(0xff0000); //Unfortunately TS doesn't like Object3Ds
			break //I guess? What am I even going to do with two intersects lol
		}
	}
}

//Register listener for and set up callback for space and esc key
function onBackOutKey(event: any){
	var keyCode = event.which
	if(keyCode == 32 || keyCode == 27){ //Space and Esc respectively
		fade(); //Ask fade function to fade us again
		cameraLock.isLocked = true
		cameraLock.target = { position: CAM_START }
		zoomOutAudio.play();
	}
}

//Tell the DOM to move our camera whenever the user scrolls
function moveCamera() {
	cameraLock.isLocked = false //turn off camera lock on
	console.log(cameraLock.isLocked)

	const top = document.body.getBoundingClientRect().top //Find out the top of the user's viewport (screen basically)
	camera.position.z = (top * 0.05) + CAM_START.z
	//camera.position.x = top * -0.002
	camera.position.y = (top * -0.05) + CAM_START.y
	console.log("Top is now equal to " + top)
	console.log("Camera x: " + camera.position.x)
	console.log("Camera y: " + camera.position.y)
	console.log("Camera z: " + camera.position.z)
}

function onTextureLoad(){
	console.log("Texture is loaded now")
}

//Fades out screen.
function fade(){
	var canvas = document.getElementById("bg");
	if(canvas != null){
		var computedStyle = getComputedStyle(canvas)
		var oldOpacity = computedStyle.opacity  //Unwrap as oldOpacity is an optional that could be null if canvas doesn't exist, undefined if opacity was never defined
		if(oldOpacity === "1") canvas.style.opacity = "0"
		else if(oldOpacity === "0") canvas.style.opacity = "1" 
	}
	return false
}


// function fade(){
// 	var element = document.getElementById("fader")
// 	if(element == null) return true

// 	//Find what alpha was, increment
// 	const style = getComputedStyle(element)
// 	var rgb = style.backgroundColor
// 	var vals = rgb.split(',')
// 	var oldAlpha = vals[vals.length-1].replace(')', '')
// 	const newAlpha = (0.03 + parseFloat(oldAlpha)).toString()

// 	//Set new alpha
// 	var newRGB = rgb.replace(/[^,]+(?=\))/, newAlpha)
// 	//console.log(newRGB)
// 	element.style.backgroundColor = newRGB
// 	if(parseFloat(newAlpha) >= 1) return true
// 	return false //false if not done
// }

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root') //Inject the above App Component into our root div in index.html
)
