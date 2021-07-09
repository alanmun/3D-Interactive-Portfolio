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
const CAM_START = {
	x: 0,
	y: -27.5, //For some reason the grid and black hole seem to be centered here instead of at 0...
	z: 240
}
type cameraLockType = {
	isLocked: boolean,
	target: any
}
let assetsLoaded = 0
const numAssets = 3

function onTextureLoad(){
	console.log("Texture is loaded now")
	assetsLoaded++
}

//Fades out screen. Returns true if completed
function fade(){
	var element = document.getElementById("fader")
	if(element == null) return true

	//Find what alpha was, increment
	const style = getComputedStyle(element)
	var rgb = style.backgroundColor
	var vals = rgb.split(',')
	var oldAlpha = vals[vals.length-1].replace(')', '')
	const newAlpha = (0.03 + parseFloat(oldAlpha)).toString()

	//Set new alpha
	var newRGB = rgb.replace(/[^,]+(?=\))/, newAlpha)
	//console.log(newRGB)
	element.style.backgroundColor = newRGB
	if(parseFloat(newAlpha) >= 1) return true
	return false //false if not done
}

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

	adjustCamera(target: THREE.Object3D, fastInc: number = 1, slowInc: number = 0.001){
		const xdiff = camera.position.x - target.position.x
		const ydiff = camera.position.y - target.position.y
		const zdiff = camera.position.z - target.position.z
		
		//Handle x
		console.log("xdiff: " + xdiff + " ydiff: " + ydiff)
		if(xdiff > 20) camera.position.x -= fastInc //Too far away in positive direction
		if(xdiff > 15 && xdiff <= 20) camera.position.x -= xdiff * slowInc //Too far away in positive direction

		if(xdiff < -20) camera.position.x += fastInc //Too far away in negative direction
		if(xdiff < -15 && xdiff >= -20) camera.position.x += xdiff * slowInc //Too far away in negative direction
		
		//if(xdiff < 15 && xdiff > -15) camera.position.x = target.position.x + xdiff

		//Handle y
		if(ydiff > 20) camera.position.y -= fastInc //Too far away in positive direction
		if(ydiff > 15 && ydiff <= 20) camera.position.y -= ydiff * slowInc //Too far away in positive direction

		if(ydiff < -20) camera.position.y += fastInc //Too far away in negative direction
		if(ydiff < -15 && ydiff >= -20) camera.position.y += ydiff * slowInc //Too far away in negative direction

		//if(ydiff < 15 && ydiff > -15) camera.position.y = target.position.y + ydiff
		
		//Handle z
		if(zdiff > 20) camera.position.z -= fastInc //Too far away in positive direction
		if(zdiff > 15 && zdiff <= 20) camera.position.z -= zdiff * slowInc //Too far away in positive direction

		if(zdiff < -20) camera.position.z += fastInc //Too far away in negative direction
		if(zdiff < -15 && zdiff >= -20) camera.position.z += zdiff * slowInc //Too far away in negative direction

		//if(zdiff < 15 && zdiff > -15) camera.position.z = target.position.z + zdiff
	}

	componentDidMount() {

		let debug = false
		let scrollMode = false
		let orbitControlsMode = false

		let cameraLock:cameraLockType = {isLocked: false, target: null} //Instantiate a cameraLock struct

		scene = new THREE.Scene(); //Instantiate the scene

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

		//Set up mouse clicking functionality
		var raycaster = new THREE.Raycaster(); 
		var mouse = new THREE.Vector2();
		var wasClicked = false;

		function onMouseClick(event: THREE.Event) { 
			// calculate mouse position in normalized device coordinates 
			// (-1 to +1) for both components
			wasClicked = true;
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1; //I believe these convert to centered normalized coordinates x,y at 0,0 is exact center of screen
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // height 100, click at 5, -5/100 = -0.05*2 is -slowInc + 1 means click was registered at y = 0.9
		}
		window.addEventListener("mousedown", onMouseClick, false) //If orbit controls are on, they intercept the mouse click and this doesn't work

		//Register listener for and set up callback for space and esc key
		function onBackOutKey(event: any){
			var keyCode = event.which
			if(keyCode == 32 || keyCode == 27){ //Space and Esc respectively
				wasClicked = false; //Turn off checking for raycast hits on any Object3Ds
				let fakeObj = {
					position: CAM_START
				}
				cameraLock.isLocked = true
				cameraLock.target = fakeObj
				zoomOutAudio.play();
			}
		}
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

		if(scrollMode) window.onscroll = moveCamera

		var doneFading: boolean = false
		//three.js "game" loop
		const animate = () =>{
			requestAnimationFrame(animate)
			if(!doneFading) doneFading = fade()
			
			thetaDonut = this.adjustOrbit(torus, 100, thetaDonut, phiDonut)
			thetaMoon = this.adjustOrbit(moon, 150, thetaMoon, phiMoon)
			// var arr1 = this.adjustOrbit(torus, 100, thetaDonut, phiDonut)
			// var arr2 = this.adjustOrbit(moon, 150, thetaMoon, phiMoon)

			// thetaDonut = arr1[0]
			// phiDonut = arr1[1]
			// thetaMoon = arr2[0]
			// phiMoon = arr2[1]

			torus.rotation.z += 0.001
			torus.rotation.x += 0.01
			torus.rotation.y += 0.005

			//moon.rotation.z += 0.001
			moon.rotation.x += 0.001
			moon.rotation.y += 0.001

			if(orbitControlsMode) controls.update()

			//ray cast detect objects on mouse click
			if(wasClicked) {
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
						wasClicked = false;
						//playSoundEffect()
						(obj as any).material.color.set(0xff0000); //Unfortunately TS doesn't like Object3Ds
						break //I guess? What am I even going to do with two intersects lol
					}
				}
			}

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
					<span id="fader"></span>
					<div id="text">
						Here's some fucken text
					</div>
				</main>
			</>
		)
	}
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root') //Inject the above App Component into our root div in index.html
)
