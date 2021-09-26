import './index.css'
import { CelestialEntity } from './celestialentity'
import { vShader, fShader } from "./atmosphericGlowShader";
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Color } from 'three';

//Asset paths need to be imported to be linked at compile time. Force everything to be a url using ?url to be safe because I know it works from preview
import zoomOutPath from './assets/zoomout.wav?url'
import backgroundPath from './assets/background.mp3?url'
import skyboxRight from './assets/skyboxwithsun/right.png?url'
import skyboxLeft from './assets/skyboxwithsun/left.png?url'
import skyboxTop from './assets/skyboxwithsun/top.png?url'
import skyboxBottom from './assets/skyboxwithsun/bottom.png?url'
import skyboxFront from './assets/skyboxwithsun/front.png?url'
import skyboxBack from './assets/skyboxwithsun/back.png?url'
import moonTexturePath from './assets/moon.jpg?url'
import moonNormalPath from './assets/moonbumpmap.jpg?url'
import twitterTexturePath from './assets/rockmoss.jpg?url'
import twitterNormalPath from './assets/rockmossnormal.jpg?url'
import twitterRoughnessPath from './assets/rockmossroughness.jpg?url'
import twitterObjPath from './assets/twitter.obj?url'
import beatSaberGlbPath from './assets/block.glb?url'

enum ce { //celestial entities
	spawn,
	blackHole,
	twitter,
	autosage,
	moon
}

let loadedTotal = 0
let debug = false //dev mode
let controls: OrbitControls

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let twitter: CelestialEntity //For twitter.obj model
let twitterCloseUp: THREE.Group

let autosage: CelestialEntity
let autosageCloseUp: THREE.Group

let moon: CelestialEntity

let canPlayMusic: boolean = false
var zoomOutAudio = new Audio(zoomOutPath);
zoomOutAudio.volume = 0.8
var backgroundAudio = new Audio(backgroundPath)
backgroundAudio.volume = 0.65

//Used by adjustCamera, persisting across calls to know if we are close in the z, x, or y coord, and the second three tell if we were already close
var xIsClose = false
var yIsClose = false
var zIsClose = false
var reachedTargetFirstTime = false //Prevents accidental fading when still close to a target
var shouldPinCamera = false

//Set up mouse clicking functionality
var raycaster = new THREE.Raycaster(); 
var mouse = new THREE.Vector2(); //2D representation of where a mouse click occurs
const CAM_START = {
	x: 0,
	y: 0,//-27.5, //For some reason the grid and black hole seemed to be centered here instead of at 0...
	z: 360
}
type cameraLockType = {
	isLocked: boolean,
	target: any
	name: ce
}
let cameraLock:cameraLockType = {isLocked: false, target: null, name: ce.spawn} //Instantiate a cameraLock struct
const goToSpawn = {isLocked: true, target: { position: CAM_START }, name: ce.spawn}

class App {

	//Adds a star in a random spot, if negZOnly is passed in as true, it won't put any stars in pos z, helping to "background" the stars better
	addStar(negZOnly=false){
		let sizeGlow = THREE.MathUtils.randFloat(0.75, 0.95);
		//let sizeCore = sizeGlow / 2
		let color: THREE.Color
		switch(THREE.MathUtils.randInt(1, 8)){
			case 1:
				color = new Color("#2407FF")
				break
			case 2:
				color = new Color("#FFB200")
				break
			default: //12.5% chance for blueish, 12.5% orangish, 75% chance for white
				color = new Color("white")
				break 
		}
		// const core = new THREE.Mesh(
		// 	new THREE.SphereGeometry(sizeCore, 16, 16),
		// 	new THREE.MeshBasicMaterial({ color: color})
		// )
		const glowGeo = new THREE.SphereGeometry(sizeGlow, 16, 16)
		const glowMat = new THREE.ShaderMaterial({
			uniforms: {
				glowColor: {
					value: color
				},
				"p": {
					value: 3
				},
				"c": {
					value: 0.5
				},
				viewVector: { value: camera.position}
			},
			vertexShader: vShader,
			fragmentShader: fShader,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			transparent: true
		}) //MeshBasicMaterials do not cast shadows, good for tiny star balls
		const star = new THREE.Mesh(glowGeo, glowMat) //new THREE.Group() 
		//star.add(new THREE.Mesh(glowGeo, glowMat))
		//star.add(core)

		let x,y,z;
		let xIsNeg, yIsNeg, zIsNeg
		xIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		yIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		if(!negZOnly) zIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		else zIsNeg = -1

		//Set the closest and farthest stars can be
		const innerBound = 380 //I believe with an inner bound of 250, I got a star to spawn only units in front of my camera's default spawn point
		const outerBound = 700

		x = THREE.MathUtils.randFloat(0, xIsNeg * outerBound)
		z = THREE.MathUtils.randFloat(0, zIsNeg * outerBound)
		if(Math.abs(z) > innerBound || Math.abs(x) > innerBound) //Ignore bounding rules, if x or z accidentally abide by them
			y = THREE.MathUtils.randFloat(0, yIsNeg * outerBound)
		else //This way, we get a nice box in the center of our system devoid of star clutter and they stick to the edges of the world only
			y = THREE.MathUtils.randFloat(yIsNeg * innerBound, yIsNeg * outerBound) 
		star.position.set(x, y, z);
		star.name = "star"

		// star.matrixAutoUpdate = false       //I should be doing this to avoid checking for matrix changes in these objects every frame, but for
		// star.matrixWorldNeedsUpdate = true //some reason matrixAutoUpdate is not letting stars spawn even though its what I set for the black
											 //hole and black hole still works fine
		scene.add(star)
	}

	pinCameraToWorld(target: THREE.Object3D){
		//console.log(camera.rotation.x)
		//console.log(camera.rotation.y)
		camera.position.set(target.position.x, (target.position.y + 8), target.position.z) //Was same, same+10, same
	}

	adjustCamera(target: THREE.Object3D){
		const xdiff = camera.position.x - target.position.x
		const ydiff = camera.position.y - target.position.y
		const zdiff = camera.position.z - target.position.z
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
		if(absX > 18) camera.position.x -= xdiff * fastInc //Too far away in positive direction
		else if(absX > 5) {
			camera.position.x -= xdiff * medInc //Too far away in positive direction
			xIsClose = true
		}
		else if(absX > 1){
			camera.position.x -= xdiff * slowInc //Too far away in positive direction
			xIsClose = true
		}
		else if(absX > 0.03){
			camera.position.x -=  Math.sign(xdiff) * nearlyThere
			xIsClose = true
		}
		else if(absX >= 0){
			camera.position.x = target.position.x
			xIsClose = true
		}

		//Handle y
		let absY = Math.abs(ydiff);
		if(absY > 18) camera.position.y -= ydiff * fastInc //Too far away in positive direction
		else if(absY > 5) {
			camera.position.y -= ydiff * medInc //Too far away in positive direction
			yIsClose = true
		}
		else if(absY > 1) {
			camera.position.y -= ydiff * slowInc //Too far away in positive direction
			yIsClose = true
		}
		else if(absY > 0.03){
			camera.position.y -=  Math.sign(ydiff) * nearlyThere
			yIsClose = true
		}
		else if(absY >= 0) {
			camera.position.y = target.position.y
			yIsClose = true
		}
		
		//Handle z
		let absZ = Math.abs(zdiff);
		if(absZ > 18) camera.position.z -= zdiff * fastInc //Too far away in positive direction
		else if(absZ > 5) {
			camera.position.z -= zdiff * medInc //Too far away in positive direction
			zIsClose = true
		}
		else if(absZ > 1) {
			camera.position.z -= zdiff * slowInc //Too far away in positive direction
			zIsClose = true
		}
		else if(absZ > 0.03){
			camera.position.z -= Math.sign(zdiff) * nearlyThere
			zIsClose = true
		}
		else if(absZ >= 0) {
			camera.position.z = target.position.z
			zIsClose = true
		}

		//Special case to see if camera is at the original spawn point, disable target lock
		if(camera.position.x == CAM_START.x && camera.position.y == CAM_START.y && camera.position.z == CAM_START.z){
			cameraLock = {isLocked: false, target: null, name: ce.spawn}
			controls.enabled = true;
			console.log("Matched at spawn: " + camera.position.x + "  " + CAM_START.x)
			xIsClose = false
			yIsClose = false
			zIsClose = false
			reachedTargetFirstTime = false
		} 
		else if(xIsClose && yIsClose && zIsClose && !reachedTargetFirstTime) { //We are approaching something that isn't the original spawn point
			fade()
			setTimeout(function(){
				changeWorld(cameraLock.name, false)
				fade(false)
			}, 1000)
			reachedTargetFirstTime = true
		}
	}

	init() {
		// * The original twitter world is what is causing that weird glitch where it jumps a few units forward and the close up world vanishes

		scene = new THREE.Scene(); //Instantiate the scene
		camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.1, 5000) //Instantiate and set up camera
		
		renderer = new THREE.WebGLRenderer({ //Instantiate and set up renderer
			canvas: document.querySelector('#bg') as HTMLCanvasElement,
			logarithmicDepthBuffer: false, //This is causing issues with atmospheric glow. Stars use it so they are entirely invisible because of this.
			antialias: true
		})
		renderer.setPixelRatio(window.devicePixelRatio) //
		renderer.setSize(window.innerWidth, window.innerHeight) //Fullscreen
		document.body.appendChild(renderer.domElement); //Add renderer to the dom, which is responsible for drawing camera and scene
		
		controls = new OrbitControls(camera, renderer.domElement); //Move around in the scene with your mouse!
		controls.rotateSpeed = 0.45
		console.log(controls.rotateSpeed)
		controls.minDistance = 50
		controls.maxDistance = 370
		controls.enableZoom = true //Zooming isn't allowed as it can break the visuals
		controls.enablePan = false //Panning isn't allowed as it can break the visuals as well

		document.body.addEventListener("mousemove", function () {
			if(canPlayMusic) backgroundAudio.play() //Do not start music until mouse is moved. Chrome does not allow audio to autoplay for spam reasons
		})
		document.body.addEventListener("touchmove", function () {
			if(canPlayMusic) backgroundAudio.play()
		})

		//Skybox, Loading Manager (which enforces loading screen)
		let skybox: THREE.Mesh
		const loadManager = new THREE.LoadingManager(() => {
			console.log("Loaded: " + loadedTotal)
			//if(loadedTotal >= 0){
			console.log("Loaded skybox")
			skybox = new THREE.Mesh(skyboxGeom, skyboxMaterials)
			skybox.name = "skybox" //Tag it so we can block mouse clicks from acting on it
			scene.add(skybox)

			const loadingScreen = document.querySelector('#loading-screen');
			loadingScreen?.classList.add('fade-out')
			loadingScreen?.addEventListener('transitionend', onTransitionEnd)
			canPlayMusic = true
			camera.position.set(0, 400, 1200)
			controls.enabled = false;
			cameraLock = goToSpawn
			reachedTargetFirstTime = true
			//}
		});
		const loader = new THREE.TextureLoader(loadManager);
		let skyboxGeom = new THREE.BoxGeometry(2100, 2100, 2100)
		let skyboxMaterials = [
			new THREE.MeshBasicMaterial({map: loader.load(skyboxRight, onTextureLoad)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxLeft, onTextureLoad)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxTop, onTextureLoad)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxBottom, onTextureLoad)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxFront, onTextureLoad)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxBack, onTextureLoad)})
		];
		skyboxMaterials.forEach(x => x.side = THREE.BackSide)

		//Texture loading for various worlds
		let moonTexture = new THREE.TextureLoader(loadManager).load(moonTexturePath, onTextureLoad)
		let moonNormal = new THREE.TextureLoader(loadManager).load(moonNormalPath, onTextureLoad)
		let twitterTexture = new THREE.TextureLoader(loadManager).load(twitterTexturePath, onTextureLoad)
		let twitterNormal = new THREE.TextureLoader(loadManager).load(twitterNormalPath, onTextureLoad)
		let twitterRoughness = new THREE.TextureLoader(loadManager).load(twitterRoughnessPath, onTextureLoad) 

		//Window event listeners
		window.addEventListener("click", onMouseClick, false) //If orbit controls are on, they intercept the mouse click and this doesn't work
		window.addEventListener("keydown", onKey, false)
		window.addEventListener("resize", onWindowResize, false)

		// * Create the autosage planet, which is currently represented by a torus until I can add a beat saber block
		new GLTFLoader(loadManager).load(beatSaberGlbPath, function(obj){
			//Create celestial entity object for autosage and add to scene
			autosage = new CelestialEntity("autosage", true, 85, obj.scene);
			let block: THREE.Group = autosage.entity;
			block.scale.set(7,7,7) //5,5,5 is a good value

			let foundCube = true
			block.traverse(function(child){
				if(child instanceof THREE.Mesh){
					//console.log(child)
					if(foundCube) {
						foundCube = false //First child it finds is the cube itself instead of the arrow
						child.material = new THREE.MeshPhongMaterial({ color: "#cc0000", shininess: 1, flatShading: true})
					}
					else{
						child.material = new THREE.MeshPhongMaterial({ color: "#ffffff", flatShading: true, side: THREE.DoubleSide}) 
						//Flat shading might fix z fighting without having to resort to logarithmicDepthBuffer 
						//which breaks any entities that use shaders
					}
				}
			})

			scene.add(autosage.entity)

			//Initialize close up world for autosage
			autosageCloseUp = new THREE.Group();
			const roundedRectShape = new THREE.Shape();
			( function roundedRect( ctx, x, y, width, height, radius ) {
				ctx.moveTo( x, y + radius );
				ctx.lineTo( x, y + height - radius );
				ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
				ctx.lineTo( x + width - radius, y + height );
				ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
				ctx.lineTo( x + width, y + radius );
				ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
				ctx.lineTo( x + radius, y );
				ctx.quadraticCurveTo( x, y, x, y + radius );
			} )( roundedRectShape, 0, 0, 50, 100, 10 );
			let autosageCloseUpGeo = new THREE.ShapeGeometry(roundedRectShape) //new THREE.PlaneGeometry(64, 96, 32, 32)
			autosageCloseUpGeo.center()
			let autosageCloseUpMat = new THREE.MeshStandardMaterial({color: "red", metalness: 0.1})
			autosageCloseUpMat.side = THREE.BackSide 
			let autosageCloseUpMesh = new THREE.Mesh(
				autosageCloseUpGeo,
				autosageCloseUpMat
			)
			autosageCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90
			autosageCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90
			autosageCloseUp.add(autosageCloseUpMesh)
			autosage.setCloseUp(autosageCloseUp)
			
			//Create copies of the original block and use them as decorations
			let miniblock1 = new THREE.Group()
			miniblock1 = block.clone(true)
			miniblock1.position.set(-40,1,-15)
			miniblock1.scale.set(1,1,1)
			miniblock1.name = "miniblock1"
			miniblock1.rotation.y += THREE.MathUtils.DEG2RAD * 60;
			(miniblock1.children[0] as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: "#0007cc", shininess: 1, flatShading: true});
			autosageCloseUp.add(miniblock1)
			let miniblock2 = miniblock1.clone(true)
			miniblock2.position.set(-40,1,-12.5)
			miniblock2.rotation.y += THREE.MathUtils.DEG2RAD * 30;
			(miniblock1.children[0] as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: "#cc00c9", shininess: 1, flatShading: true});
			autosageCloseUp.add(miniblock2)
			let miniblock3 = miniblock1.clone(true)
			miniblock3.position.set(-35,1,15);
			miniblock3.rotation.x -= THREE.MathUtils.DEG2RAD * 90;
			miniblock3.rotation.y += THREE.MathUtils.DEG2RAD * 30;
			(miniblock3.children[0] as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: "#11a10a", shininess: 1, flatShading: true});
			autosageCloseUp.add(miniblock3)
			console.log(autosageCloseUp)
			//scene.add(autosageCloseUp)
		}, undefined, function ( error ) {
			console.error( error );
		});
		

		//Add some light
		const aL = new THREE.AmbientLight(new Color("white"), 1)
		scene.add(aL)
		// const aL2 = new THREE.AmbientLight(new Color("white"))
		// planetScene.add(aL2)

		//GridHelper
		if(debug){
			const gH = new THREE.GridHelper(200, 50)
			gH.name = "gridhelper"
			scene.add(gH)
		} 

		//Populate the universe
		for(let i = 0; i < 600; i++) this.addStar() //with stars

		// * Create the black hole
		let bh: number = 0
		let blackHole = new CelestialEntity("blackhole", false, 0)
		blackHole.addMesh(
			new THREE.SphereGeometry(6, 128, 128),
			//new THREE.MeshStandardMaterial({ color: "black", roughness: 0, metalness: 1, flatShading: false})
			new THREE.ShaderMaterial({
				uniforms: {
					glowColor: {
						value: new THREE.Vector3(0.1, 0.1, 0.1) //Color is overwritten by reverberate function
					},
					"p": {
						value: 6
					},
					"c": {
						value: 0.25
					},
					viewVector: { value: camera.position}
				},
				vertexShader: vShader,
				fragmentShader: fShader,
				side: THREE.BackSide,
				blending: THREE.AdditiveBlending,
				transparent: true
			})
		)
		/* TODO: Maybe I should merge this into one black hole THREE.Group, right now I'm lazy and don't care to figure out how to traverse and select
		   the mesh with shader material on it so I can modify that one in reverberate()
		*/
		let blackHoleCore = new THREE.Mesh(
			new THREE.SphereGeometry(4.75, 128, 128), //Was 4.75 in radius
			new THREE.MeshPhysicalMaterial({ color: "black", clearcoat: 1, side: THREE.DoubleSide}),
		)
		blackHoleCore.name = "blackholecore"
		scene.add(blackHoleCore)
		scene.add(blackHole.entity)

		// ! (Deprecated) Create star that belongs to solar system and provides light to the system
		// let systemStar = new CelestialEntity("sun", true, 90)
		// let systemStarTexture = new THREE.TextureLoader().load('./assets/8k_sun.jpg')
		// const pL = new THREE.PointLight(new Color("white"), 2, 0) //light source
		// if(debug) {
		// 	const lH = new THREE.PointLightHelper(pL) //debugging tool
		// 	scene.add(lH) //Debugging object doesn't need to be part of the group
		// }
		// systemStar.addMesh(
		// 	new THREE.SphereGeometry(),
		// 	new THREE.MeshStandardMaterial({ color: "gold", map: systemStarTexture})
		// )
		//Create a star that belongs to this solar system
		// systemStar.add(pL) //Add our source of light to this group, so it is bound to the system's star and moves with it
		// scene.add(systemStar)
		// ! End Deprecated 


		// * Create the twitter planet from an .obj model
		new OBJLoader(loadManager).load(twitterObjPath, function(group){
			group.traverse(function(child){
				if(child instanceof THREE.Mesh){
					//console.log(child)
					child.material = new THREE.MeshStandardMaterial({ color: 0x3fbcff, roughness: 0, metalness: 0, flatShading: false})
					child.rotation.y += 7.5 //For start up sake I like to start it at this rotation so it looks more presentable, not that important
				}
			})
			//console.log(twitter)
			twitter = new CelestialEntity("twitter", true, 45, group)

			// * Design the close up world for twitter
			twitterCloseUp = new THREE.Group();
			let twitterCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
			let twitterCloseUpMat = new THREE.MeshStandardMaterial({map: twitterTexture, roughnessMap: twitterRoughness, bumpMap: twitterNormal})
			twitterCloseUpMat.side = THREE.BackSide 
			planeCurve(twitterCloseUpGeo, 4)
			let twitterCloseUpMesh = new THREE.Mesh(
				twitterCloseUpGeo,
				twitterCloseUpMat
			)
			twitterCloseUp.add(twitterCloseUpMesh)

			twitter.setCloseUp(twitterCloseUp)
			twitterCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90
			twitterCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90
			for(let i = 0; i < 10; i++) twitter.addTree();

			scene.add(twitter.entity)
			//twitter.cameraIsAt = true
			onTextureLoad()
		})

		// * Create the moon
		moon = new CelestialEntity("moon", false, 110)
		moon.addMesh(
			new THREE.SphereGeometry(6, 64, 64),
			new THREE.MeshStandardMaterial({map: moonTexture})
		)
		// * Design the close up world for moon
		let moonCloseUp = new THREE.Group();
		let moonCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
		let moonCloseUpMat = new THREE.MeshStandardMaterial({map: moonTexture, bumpMap: moonNormal})
		moonCloseUpMat.side = THREE.BackSide 
		planeCurve(moonCloseUpGeo, 4)
		let moonCloseUpMesh = new THREE.Mesh(
			moonCloseUpGeo,
			moonCloseUpMat
		)
		moonCloseUp.add(moonCloseUpMesh)
		moon.setCloseUp(moonCloseUp)
		moonCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90
		moonCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90
		scene.add(moon.entity)

		//Weird glitches? Can't get stuff to display? Just debug enable and make everything BasicMaterial to guarantee you're doing it right
		//if(debug) scene.overrideMaterial = new MeshBasicMaterial({ color: 'green'})
		
		//three.js "game" loop
		const animate = () =>{
			requestAnimationFrame(animate)

			// if(introSequenceDone){
			// 	if(camera.position.distanceTo(blackHoleCore.position) > 370) {
					
			// 		console.log("Out of bounds", camera.position)
			// 	}
			// 	// if(camera.position.x > OUT_OF_BOUNDS.x) camera.position.x = OUT_OF_BOUNDS.x - 10
			// 	// if(camera.position.x < -1*OUT_OF_BOUNDS.x) camera.position.x = (-1 * OUT_OF_BOUNDS.x) + 10
			// 	// if(camera.position.y > OUT_OF_BOUNDS.y) camera.position.y = OUT_OF_BOUNDS.y - 10
			// 	// if(camera.position.y > OUT_OF_BOUNDS.y) camera.position.y = (-1 * OUT_OF_BOUNDS.y) + 10
			// 	// if(camera.position.z > OUT_OF_BOUNDS.z) camera.position.z = OUT_OF_BOUNDS.z - 10
			// 	// if(camera.position.z > OUT_OF_BOUNDS.z) camera.position.z = (-1 * OUT_OF_BOUNDS.z) + 10
			// }

			//Black Hole shader manipulation
			bh = blackHole.reverberate(bh)
			
			//Adjust orbits
			autosage.adjustOrbit()
			moon.adjustOrbit()
			twitter.adjustOrbit()

			//Adjust rotations
			autosage.rotate(0.001, 0.001, 0.01) //autosage.rotate(0.01, 0.005, 0.001)
			moon.rotate(0.001, 0.001, 0)
			twitter.rotate(0, 0, 0.002)

			//This below thing is annoying. If camera moves and you have update in game loop, it keeps trying to control the camera for you
			//if(orbitControlsMode) controls.update() //Adding an else after if(cameraLock.isLocked) and putting this there doesn't work, I should revisit this

			if(cameraLock.isLocked) {
				if(shouldPinCamera) this.pinCameraToWorld(cameraLock.target)
				else this.adjustCamera(cameraLock.target)
			}
			renderer.render(scene, camera);
		}
		animate()
	}
}

function onMouseClick(event: THREE.Event) { 
	//calculate mouse position in normalized device coordinates  (-1 to +1) for both components
	if(cameraLock.isLocked && !shouldPinCamera) return //Mouse clicking should have no effect when camera is targeting something
	else if(shouldPinCamera){
		backOut() //If cam wasn't locked, and shouldPinCamera is true, we are at a close up world.
		return
	}

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1; //I believe these convert to centered normalized coordinates x,y at 0,0 is exact center of screen
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // height 100, click at 5, -5/100 = -0.05*2 is -slowInc + 1 means click was registered at y = 0.9

	raycaster.setFromCamera(mouse, camera); // update the picking ray with the camera and mouse position
	if(!shouldPinCamera && raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(autosage.entity))){
		console.log("Hit detected on autosage world (not close up)")
		controls.enabled = false;
		cameraLock = {
			isLocked: true,
			target: autosage.entity,
			name: ce.autosage
		}
		return
	}
	if(!shouldPinCamera && raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(twitter.entity))){
		console.log("Hit detected on twitter world (not close up)")
		// * We intersected on our twitter.obj model which is a THREE.Group and so can't be detected the normal way below
		// * Actually, I think you can intersect on THREE.Group, there is some other weird reason it can't be detected the normal way
		controls.enabled = false;
		cameraLock = {
			isLocked: true,
			target: twitter.entity,
			name: ce.twitter
		}
		return
	}
	//This is busted for some reason, Cannot read property 'updateWorldMatrix' of undefined' did not look into it yet
	// if(raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(systemStar.entity))){
	// 	cameraLock.isLocked = true;
	// 	cameraLock.target = systemStar.entity;
	// 	return
	// }

	// * Check for intersections on any mesh. Because intersectObjects() sorts the result by distance, closest first, we don't need to iterate 
	// * through. We only want the closest hit
	var intersects = raycaster.intersectObjects(scene.children);

	console.log(intersects[0].object.name)

	//These clickable things shouldn't be clickable
	if(intersects[0].object.name == "star" ||
	 intersects[0].object.name == "skybox" ||
	 intersects[0].object.name == "blackhole" ||
	 intersects[0].object.name == "blackholecore" ||
	 intersects[0].object.name == "gridhelper" ) return; 
	
	controls.enabled = false;
	cameraLock.isLocked = true;
	cameraLock.target = intersects[0].object;
	if(intersects[0].object.name == "moon") cameraLock.name = ce.moon
	else if(intersects[0].object.name == "autosage") cameraLock.name = ce.autosage
}

//Common actions to take when backing out of a world
function backOut(){
	fade(false); //Ask fade function to fade us again
	changeWorld(cameraLock.name, true)
	cameraLock = goToSpawn
	zoomOutAudio.play();
}

function addText(celestialEntityEnum: ce){
	let div = document.getElementById("portfolioDiv")!
	div.style.visibility = "visible"
	let title = document.getElementById("title")!
	let body = document.getElementById("spanBody")!

	switch(celestialEntityEnum){
		case ce.twitter:
			title.innerHTML = "What Song Is That? Twitter Bot (2020)"
			body.innerHTML = "I decided to write and host a twitter bot for fun on my own server, using a Raspberry Pi, for a friend's twitter account. That bot has over a hundred thousand followers now. The success of that bot led me to make my own more sophisticated bot called What Song Is That? It takes requests from users who wish to know what song is playing in a tweet, queries Shazam's API on their behalf and displays its findings cleanly on a website I made for it. Visit <a style=\"text-decoration:none; color:salmon;\" href=\"https://whatsong.page\" target=\"_blank\">whatsong.page</a> for more information."
			break
		case ce.autosage:
			title.innerHTML = "AutoSage (2021)"
			body.innerHTML = "AutoSage is a Python written tool for users of BeatSage, an AI driven service made for the popular VR rhythm game Beat Saber. AutoSage simplifies and automates the process of using BeatSage for all of the songs the user wishes to play in Beat Saber. See the tool's repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/autosage\" target=\"_blank\">github.com/alanmun/autosage</a>"
			break
		case ce.moon:
			title.innerHTML = "3D Interactive Portfolio (2021)"
			body.innerHTML = "This portfolio is written in typescript using the three.js 3D graphics library and deployed using vite. My work on the AutoSage tool led me to discovering three.js. I was enamoured with the library and had to make something with it. I knew that I had always wanted a cool way to show my personal technological efforts and projects so I decided to represent them in their own worlds that can be visited by interacting with them. I learned more from undertaking this project than any other personal project I've ever worked on. I had never written three.js code before, my HTML and CSS skills have definitely improved since beginning, and I gave myself an introduction to shaders and 3D modelling in blender by creating the Beat Saber cube that is floating in space. This portfolio remains a continual work in progress as I plan to update it with new worlds for every technological endeavor I go on. See the repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/3D-Interactive-Portfolio\" target=\"_blank\">github.com/alanmun/3D-Interactive-Portfolio</a>"
		default:
			console.log("Unknown case in addText")
			break
	}
}

function removeText(){
	let div = document.getElementById("portfolioDiv")!
	div.style.visibility = "hidden"
}

function changeWorld(celestialEntityEnum: ce, leaving: boolean){
	if(leaving){
		shouldPinCamera = false
		camera.rotation.set(0, 0, 0) //radians, this is effectively a 90 degree rotation left
		twitter.distance /= 1
		autosage.distance /= 1.5
		moon.distance /= 2
	}
	else{
		shouldPinCamera = true
		camera.rotation.set(0, 1.57, 0) //radians, this is effectively a 90 degree rotation left
		twitter.distance *= 1
		autosage.distance *= 1.5
		moon.distance *= 2
	}
	switch(celestialEntityEnum){
		case ce.blackHole:
			//TODO: Idk what to even do if you enter a black hole, should just disable this honestly
			break;
		case ce.moon:
			//TODO: Figure something out for moon maybe
			if(leaving){
				moon.swapEntities(scene)
				removeText()
			}
			else{
				moon.swapEntities(scene)
				addText(celestialEntityEnum)
				cameraLock.target = moon.entityCloseUp
			}
			break;
		case ce.twitter:
			if(leaving) {
				twitter.swapEntities(scene)
				removeText()
			}
			else {
				twitter.swapEntities(scene)
				addText(celestialEntityEnum)
				cameraLock.target = twitter.entityCloseUp //switch to the new target
			}
			break;
		case ce.autosage:
			if(leaving){
				autosage.swapEntities(scene)
				removeText()
			}
			else {
				autosage.swapEntities(scene)
				addText(celestialEntityEnum)
				cameraLock.target = autosage.entityCloseUp //switch to the new target
			}
			break;
		default:
			console.log("DEFAULT TRIGGERED!?!?!?!?")
	}
}

//Fades out screen.
function fade(out:boolean=true, speed: string="730ms"){
	var canvas = document.getElementById("bg")!;
	//var computedStyle = getComputedStyle(canvas)

	//Set the speed of fade
	canvas.style.transitionDuration = speed

	//Begin fade
	//var oldOpacity = computedStyle.opacity
	if(out) canvas.style.opacity = "0"
	else canvas.style.opacity = "1"

	return false
}

//Creates curved planes to simulate being on a world. Function authored by prisoner849
function planeCurve(g: THREE.PlaneGeometry, z: number){
	
	let p = g.parameters;
	let hw = p.width * 0.5;
	
	let a = new THREE.Vector2(-hw, 0);
	let b = new THREE.Vector2(0, z);
	let c = new THREE.Vector2(hw, 0);
	
	let ab = new THREE.Vector2().subVectors(a, b);
	let bc = new THREE.Vector2().subVectors(b, c);
	let ac = new THREE.Vector2().subVectors(a, c);
	
	let r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
	
	let center = new THREE.Vector2(0, z - r);
	let baseV = new THREE.Vector2().subVectors(a, center);
	let baseAngle = baseV.angle() - (Math.PI * 0.5);
	let arc = baseAngle * 2;
	
	let uv = g.attributes.uv;
	let pos = g.attributes.position;
	let mainV = new THREE.Vector2();
	for (let i = 0; i < uv.count; i++){
		let uvRatio = 1 - uv.getX(i);
	  let y = pos.getY(i);
	  mainV.copy(c).rotateAround(center, (arc * uvRatio));
	  pos.setXYZ(i, mainV.x, y, -mainV.y);
	}
	
	pos.needsUpdate = true;
}

//Register listener for and set up callback for space and esc key
function onKey(event: any){
	var keyCode = event.which
	if(keyCode == 32 || keyCode == 27){ //Space and Esc respectively
		if(cameraLock.name == ce.spawn) return //Do nothing if cameraLock was last locked onto spawn (prevents zoomout audio file spam etc)
		if(cameraLock.isLocked && !shouldPinCamera) return //space/esc keys should have no effect when camera is targeting something
		backOut();
	}

	if(debug){
		if(keyCode == 37) camera.rotation.y += 0.1 //Left arrow
		if(keyCode == 38) camera.rotation.x += 0.1 //Up arrow
		if(keyCode == 39) camera.rotation.y -= 0.1 //Right arrow
		if(keyCode == 40) camera.rotation.x -= 0.1 //Down arrow
		if(keyCode == 79) {
			controls.enabled = !controls.enabled
		}
	}
}

//For use with loading screen
function onTransitionEnd( event: any ) {
	event.target.remove();	
}

function onTextureLoad(){
	loadedTotal += 1
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

let app = new App()
app.init()