import './portfolio.css'
import { CelestialEntity } from './celestialentity'
import { Debug } from './PortfolioDebugger'
import { vShader, fShader } from "./atmosphericGlowShader"
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//Asset paths need to be imported to be linked at compile time. Force everything to be a url using ?url to be safe because I know it works from preview
import zoomInPath from './assets/distantboom.wav?url'
import zoomOutPath from './assets/zoomoutmodified.wav?url'
import backgroundPath from './assets/background.mp3?url'
import skyboxRight from './assets/skyboxwithsun/right.png?url'
import skyboxLeft from './assets/skyboxwithsun/left.png?url'
import skyboxTop from './assets/skyboxwithsun/top.png?url'
import skyboxBottom from './assets/skyboxwithsun/bottom.png?url'
import skyboxFront from './assets/skyboxwithsun/front.png?url'
import skyboxBack from './assets/skyboxwithsun/back.png?url'
import moonTexturePath from './assets/moon.jpg?url'
import moonNormalPath from './assets/moonbumpmap.jpg?url'
import twitterPondPath from './assets/pond/pond.obj?url'
import twitterPondMTLPath from './assets/pond/pond.mtl?url'
import twitterGrassPath from './assets/grass/grass.obj?url'
import twitterGrassMTLPath from './assets/grass/grass.mtl?url'
//import twitterWorkstationMTLPath from './assets/workstation.mtl?url'
//import twitterWorkstationPath from './assets/workstation.obj?url'
import twitterObjPath from './assets/twitter.obj?url'
import beatSaberGlbPath from './assets/block.glb?url'
import mutedPath from './assets/muted.png?url'
import unmutedPath from './assets/unmuted.png?url'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

enum ce { //celestial entities
	spawn,
	blackHole,
	twitter,
	autosage,
	moon
}

let controls: OrbitControls

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let twitter: CelestialEntity //For twitter.obj model
let twitterCloseUp: THREE.Group
let pond: THREE.Object3D
let fox: THREE.Object3D
let moose: THREE.Object3D
let grass: THREE.Object3D
//let newGrass: THREE.Object3D //debug var for testing out new placements

let autosage: CelestialEntity
let autosageCloseUp: THREE.Group

let moon: CelestialEntity

var zoomInAudio = new Audio(zoomInPath);
zoomInAudio.muted = true
zoomInAudio.volume = 0.6
var zoomOutAudio = new Audio(zoomOutPath);
zoomOutAudio.volume = 0.6
zoomOutAudio.muted = true
var backgroundAudio = new Audio(backgroundPath)
backgroundAudio.volume = 0.65
backgroundAudio.muted = true

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
	addStar(){
		let sizeGlow = THREE.MathUtils.randFloat(0.75, 0.95);
		//let sizeCore = sizeGlow / 2
		let color: THREE.Color
		switch(THREE.MathUtils.randInt(1, 8)){
			case 1:
				color = new THREE.Color("#3d33ff")
				break
			case 2:
				color = new THREE.Color("#ffcb54")
				break
			case 3:
				color = new THREE.Color("#70e0e0")
				break
			default: //12.5% chance for blueish, 12.5% orangish, 12.5% for turquise, rest for white
				color = new THREE.Color("white")
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
		let xIsNeg, yIsNeg, zIsNeg;
		xIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		yIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		zIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1

		//Set the closest and farthest stars can be
		const innerBound = 480 //I believe with an inner bound of 250, I got a star to spawn only units in front of my camera's default spawn point
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
		// ? The original twitter world is what is causing that weird glitch where it jumps a few units forward and the close up world vanishes
		// ! close up worlds are not being named for some reason. Their names should be "{noncloseupname} close" but are instead ""

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
		controls.minDistance = 35
		controls.maxDistance = 470
		controls.enableZoom = true
		controls.enablePan = false //Panning isn't allowed as it can break the visuals as well

		//Skybox, Loading Manager (which enforces loading screen)
		let skybox: THREE.Mesh
		const loadManager = new THREE.LoadingManager(() => {
			console.log("Loaded skybox")
			skybox = new THREE.Mesh(skyboxGeom, skyboxMaterials)
			skybox.name = "skybox" //Tag it so we can block mouse clicks from acting on it
			scene.add(skybox)

			//Now that we are sure everything is loaded, add these models to their worlds
			twitterCloseUp.add(pond)
			twitterCloseUp.add(fox)
			twitterCloseUp.add(moose)
			twitter.addGrass(-13.5, 3.7, -9, 0x3e629d, grass);
			twitter.addGrass(-17.6, 2.9, -7, 0x37568a, grass);
			twitter.addGrass(-15.6, 2.9, -6.5, 0x37568a, grass);
			twitter.addGrass(-14.1, 3.4, 9.1, 0x37568a, grass);
			twitter.addGrass(-16.6, 2.8, -7.3, 0x37568a, grass);
			twitter.addGrass(-17.5, 2.8, -8.3, 0x37568a, grass);
			//twitterCloseUp.add(workstation)

			const loadingScreen = document.querySelector('#loading-screen');
			loadingScreen?.classList.add('fade-out')
			loadingScreen?.addEventListener('transitionend', onTransitionEnd)
			//canPlayMusic = true
			camera.position.set(0, 400, 1200)
			controls.enabled = false;
			cameraLock = goToSpawn
			reachedTargetFirstTime = true
		});
		const loader = new THREE.TextureLoader(loadManager);
		let skyboxGeom = new THREE.BoxGeometry(2100, 2100, 2100)
		let skyboxMaterials = [
			new THREE.MeshBasicMaterial({map: loader.load(skyboxRight)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxLeft)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxTop)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxBottom)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxFront)}),
			new THREE.MeshBasicMaterial({map: loader.load(skyboxBack)})
		];
		skyboxMaterials.forEach(x => x.side = THREE.BackSide)

		//Window event listeners
		//let options = {
		//	capture: true,
		//	once: false
		//}
		document.body.addEventListener("touch", onInteract, false) //Some browsers simulate click when touching on device, but this is still needed for the ones that don't
		document.body.addEventListener("click", onInteract, false)
		window.addEventListener("keydown", onKey, false)
		window.addEventListener("resize", onWindowResize, false)

		//Texture and model loading for various worlds
		let moonTexture = new THREE.TextureLoader(loadManager).load(moonTexturePath)
		let moonNormal = new THREE.TextureLoader(loadManager).load(moonNormalPath)

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
					else {
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
		}, undefined, function ( error ) {
			console.error( error );
		});

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
			new THREE.MeshPhysicalMaterial({ color: "black", clearcoat: 0, side: THREE.DoubleSide}), //clearcoat 0 prevents light shine mark on it from distant sun
		)
		blackHoleCore.name = "blackholecore"
		scene.add(blackHoleCore)
		scene.add(blackHole.entity)

		//Load and prep the pond
		new MTLLoader(loadManager).load(twitterPondMTLPath, function(mtl){
			mtl.preload()
			let gLoader = new OBJLoader(loadManager)
			gLoader.setMaterials(mtl)
			gLoader.load(twitterPondPath, function(group){
				pond = group
				pond.scale.set(0.02, 0.02, 0.02)
				pond.rotation.set(0, -8.2, 0)
				pond.position.set(-16.5, 2.8, -4)
				pond.traverse(function(child){
					if(child instanceof THREE.Mesh){
						if(child.name === "Componente_24_001"){ //Base of pool
							child.material = new THREE.MeshStandardMaterial({ color: 0x462E1A, roughness: 0, metalness: 0, flatShading: false})
							//child.material.depthTest = false
							//child.renderOrder = 1
						}
						else{ //Water itself
							child.material = new THREE.MeshStandardMaterial({ color: 0x74ccf4, opacity: 0.6, metalness: 0, flatShading: false})
							child.material.transparent = true
							child.material.depthTest = false
							child.renderOrder = 1
						}
						child.material.side = THREE.DoubleSide
					}
				})
			})
		})

		//Load and prep the moose
		new GLTFLoader(loadManager).load('./assets/moose/scene.gltf', function(gltf){
			moose = gltf.scene
			moose.scale.set(.5, .5, .5)
			moose.position.set(-20.8, 4.5, 9.1)
			moose.rotation.set(0.1, -12.9, 0.1)
		})

		//Load and prep the fox
		new GLTFLoader(loadManager).load('./assets/fox/scene.gltf', function(gltf){
			fox = gltf.scene
			fox.scale.set(0.04, .024, 0.03)
			fox.position.set(-19.8, 3.5, -7.3)
			fox.rotation.set(0, -11.7, 0)
		})

		//Load and prep the grass(es)
		new MTLLoader(loadManager).load(twitterGrassMTLPath, function(mtl){
			mtl.preload()

			let gLoader = new OBJLoader(loadManager)
			gLoader.setMaterials(mtl)
			gLoader.load(twitterGrassPath, function(group){
				grass = group
				grass.scale.set(0.06, 0.06, 0.06)
			})
		})

		// ! Load and prep workstation (Deprecated)
		//let workstation:THREE.Object3D
		//new MTLLoader(loadManager).load(twitterWorkstationMTLPath, function(mtl){
		//	mtl.preload()
		//	let wsLoader = new OBJLoader(loadManager)
		//	wsLoader.setMaterials(mtl)
		//	wsLoader.load(twitterWorkstationPath, function(group){
		//		group.traverse(function(child){
		//			if(child instanceof THREE.Mesh){
		//				child.material.side = THREE.DoubleSide
		//			}
		//		})
		//
		//		//Reposition the workstation and add to the close up entity
		//		group.position.set(-12, 5, 5)
		//		group.rotateY(THREE.MathUtils.DEG2RAD * 200)
		//		group.scale.set(0.001, 0.001, 0.001)
		//		workstation = group
		//	})
		//})

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
			let twitterCloseUpMat = new THREE.MeshStandardMaterial({color: 0x3fbcff, metalness: .4})
			twitterCloseUpMat.side = THREE.BackSide 
			planeCurve(twitterCloseUpGeo, 4)
			//let testTwitterCloseUpGeo = new THREE.WireframeGeometry(twitterCloseUpGeo)
			let twitterCloseUpMesh = new THREE.Mesh(
				twitterCloseUpGeo,
				twitterCloseUpMat
			)
			twitterCloseUp.add(twitterCloseUpMesh)

			twitter.setCloseUp(twitterCloseUp)
			twitterCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90
			twitterCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90
			//twitterCloseUpMesh.material.depthTest = false //Allow others to occlude our world

			makeWings()
			twitter.addTree(-9, 6, -4.75, 0x7796c9);
			twitter.addTree(-12, 6, -5.25, 0x6588c2);
			twitter.addTree(-11, 6, -4.5, 0x6588c2);
			twitter.addTree(-9, 6, 5.05, 0x537abb);
			twitter.addTree(-20.2, 4.8, 10.05, 0x7796c9);
			twitter.addTree(-22.3, 4.8, 10.05, 0x37568a);
			twitter.addTree(-19.9, 4.5, 11.25, 0x37568a);
			twitter.addTree(-24.4, 4, 13.05, 0x37568a);

			//newTree = twitter.addTree(-24.4, 4, 13.05, 0x37568a);

			scene.add(twitter.entity)
		})

		// * Create the moon
		moon = new CelestialEntity("moon", false, 110)
		moon.addMesh(
			new THREE.SphereGeometry(6, 64, 64),
			new THREE.MeshStandardMaterial({map: moonTexture, normalMap: moonNormal})
		)
		// * Design the close up world for moon
		let moonCloseUp = new THREE.Group();
		let moonCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
		let moonCloseUpMat = new THREE.MeshStandardMaterial({map: moonTexture, normalMap: moonNormal})
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

		// * Add some light
		const aL = new THREE.AmbientLight(new THREE.Color("white"), 1)
		scene.add(aL)
		
		// * Provide light from the sun in the far distance
		const pL = new THREE.PointLight(new THREE.Color("white"), .6) //A distance of over 1000 is req'd to reach twitter world 
		pL.position.set(750,325,-1000)
		scene.add(pL)

		// * GridHelper
		if(Debug.mode){
			const gH = new THREE.GridHelper(200, 50)
			gH.name = "gridhelper"
			scene.add(gH)
		} 

		// * Populate the universe with stars
		for(let i = 0; i < 1000; i++) this.addStar()

		//Weird glitches? Can't get stuff to display? Just debug enable and make everything BasicMaterial to guarantee you're doing it right
		//if(debug) scene.overrideMaterial = new MeshBasicMaterial({ color: 'green'})
		// setTimeout(() => {
		// 	cameraLock = {
		// 		isLocked: true,
		// 		name: ce.twitter,
		// 		target: twitter.entity
		// 	}
		// 	changeWorld(ce.twitter, false)
		// 	shouldPinCamera = true
		// }, 2000)
		
		//three.js "game" loop
		const animate = () =>{
			requestAnimationFrame(animate)

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

			if(cameraLock.isLocked) {
				if(shouldPinCamera) this.pinCameraToWorld(cameraLock.target)
				else this.adjustCamera(cameraLock.target)
			}
			renderer.render(scene, camera);
		}
		animate()
	}
}

function onInteract(event:any) {
	event.preventDefault()
	if(event.target == document.getElementById("soundbutton")){
		onVolumeClick();
		return; //bail if click occurred on volume button
	} 
	if(event.target == document.getElementById("backbutton")){
		onBackClick(); //No need to return since this action leaves the webpage
	}
	if(event.target instanceof HTMLAnchorElement){
		window.open(event.target.href, '_blank')
		return; //Bail if click occurs on hyperlink
	}

	//calculate mouse position in normalized device coordinates  (-1 to +1) for both components
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1; //I believe these convert to centered normalized coordinates x,y at 0,0 is exact center of screen
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // height 100, click at 5, -5/100 = -0.05*2 is -slowInc + 1 means click was registered at y = 0.9

	raycaster.setFromCamera(mouse, camera); // update the picking ray with the camera and mouse position
	var intersects = raycaster.intersectObjects(scene.children, true);
	console.log(intersects[0].object.name)
	console.log(intersects[0].object)

	
	if(cameraLock.isLocked && !shouldPinCamera) return //Mouse clicking should have no effect when camera is targeting something
	else if(shouldPinCamera && intersects[0].object.name == "skybox"){
		backOut() //If cam wasn't locked, and shouldPinCamera is true, we are at a close up world.
		return
	}

	/*
	* Because there are so many misfires, and so many things I DON'T want the user to be able to click, I've decided to switch to an approach of
	* only allowing a click if it matches these whitelisted names, instead of blacklisting every name I come across that I don't want to allow + "" (no name) 
	*/
	if(!shouldPinCamera && raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(autosage.entity))){
		console.log("Hit detected on autosage world (not close up)")
		zoomInAudio.play();
		controls.enabled = false;
		cameraLock = {
			isLocked: true,
			target: autosage.entity,
			name: ce.autosage
		}
	}
	else if(!shouldPinCamera && raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(twitter.entity))){
		console.log("Hit detected on twitter world (not close up)")
		// * We intersected on our twitter.obj model which is a THREE.Group and so can't be detected the normal way below
		// * Actually, I think you can intersect on THREE.Group, there is some other weird reason it can't be detected the normal way
		zoomInAudio.play();
		controls.enabled = false;
		cameraLock = {
			isLocked: true,
			target: twitter.entity,
			name: ce.twitter
		}
	}
	else if(!shouldPinCamera && intersects[0].object.name == "moon"){
		zoomInAudio.play();
		controls.enabled = false;
		cameraLock = {
			isLocked: true,
			target: moon.entity,
			name: ce.moon
		}
	}
}

//Routine actions to take when backing out of a world
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
			title.innerHTML = "What Song Is That? (2020)"
			body.innerHTML = "I decided to write and host a twitter bot for fun on my own server, using a Raspberry Pi, for a friend's twitter account. That bot has over a hundred thousand followers now. The success of that bot led me to make my own more sophisticated bot called What Song Is That? It takes requests from users who wish to know what song is playing in a tweet, queries Shazam's API on their behalf and displays its findings cleanly on a website I made for it. Check out <a style=\"text-decoration:none; color:salmon;\" href=\"https://alanmun.github.io/WhatSongIsThat\" target=\"_blank\">whatsong.page</a> for more information."
			break
		case ce.autosage:
			title.innerHTML = "AutoSage (2021)"
			body.innerHTML = "AutoSage is a Python written app for users of BeatSage, an AI driven service made for the popular VR rhythm game Beat Saber. AutoSage simplifies and automates the process of using BeatSage for all of the songs the user wishes to play in Beat Saber. The tool has been updated to be packaged into a Windows executable using PyInstaller, and features a UI built using Tkinter for ease of use. See the tool's repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/autosage\" target=\"_blank\">github.com/alanmun/autosage</a>"
			break
		case ce.moon:
			title.innerHTML = "3D Interactive Portfolio (2021)"
			body.innerHTML = "This portfolio is written in TypeScript using the three.js 3D graphics library and deployed using vite. My work on the AutoSage tool led me to discovering three.js. I was enamoured with the library and had to make something with it. I wanted a cool way to show my personal technological efforts and projects, so I decided to represent them in their own worlds that can be visited by interacting with them. Every project I've undertaken has had a focus on what I stand to learn from it, and I have learned more from undertaking this project than any other personal project I've ever worked on. I had never written three.js code before, my HTML and CSS skills have definitely improved since beginning, and I gave myself an introduction to shaders and 3D modelling in blender by creating the Beat Saber cube that is floating in space. This portfolio remains a continual work in progress as I plan to update it with new worlds for every technological endeavor I go on. See the repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/3D-Interactive-Portfolio\" target=\"_blank\">github.com/alanmun/3D-Interactive-Portfolio</a>"
			break
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

//Creates the left and right wings on the twitter world, adds them to the overall close up twitter group
function makeWings(){
	//Create and define the wings
	let tLeftWing = new THREE.Shape();
	let tRightWing = new THREE.Shape();
	tLeftWing.moveTo(80, 20);
	tLeftWing.lineTo(40, 80);
	tLeftWing.lineTo(80, 80);
	tLeftWing.lineTo(80, 20);
	tRightWing.moveTo(80, 20);
	tRightWing.lineTo(40, 80);
	tRightWing.lineTo(80, 80);
	tRightWing.lineTo(80, 20);
	let tLeftWingGeo = new THREE.ExtrudeGeometry(tLeftWing, {
		depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 
	})
	let tRightWingGeo = new THREE.ExtrudeGeometry(tRightWing, {
		depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 
	})
	let tLeftWingMesh = new THREE.Mesh(
		tLeftWingGeo,
		new THREE.MeshStandardMaterial({color: 0x3372d6, metalness: .4})
	)
	let tRightWingMesh = new THREE.Mesh(
		tRightWingGeo,
		new THREE.MeshStandardMaterial({color: 0x3372d6, metalness: .4})
	)

	//Scale both
	tLeftWingMesh.scale.set(1,1.75,1)
	tRightWingMesh.scale.set(1,1.75,1)

	//Set position and orientation of left wing
	tLeftWingMesh.position.set(-7, -95, 6)
	tLeftWingMesh.rotateX(THREE.MathUtils.DEG2RAD * 0)
	tLeftWingMesh.rotateY(THREE.MathUtils.DEG2RAD * 30)
	tLeftWingMesh.rotateZ(THREE.MathUtils.DEG2RAD * 60)

	//Set position and orientation of right wing
	tRightWingMesh.position.set(-7, -95, -6)
	tRightWingMesh.rotateX(THREE.MathUtils.DEG2RAD * 0)
	tRightWingMesh.rotateY(THREE.MathUtils.DEG2RAD * 330)
	tRightWingMesh.rotateZ(THREE.MathUtils.DEG2RAD * 60)

	//Add to twitterCloseUp
	twitterCloseUp.add(tRightWingMesh);
	twitterCloseUp.add(tLeftWingMesh)
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

	Debug.debuggerKeys(camera, keyCode)
}

function onBackClick(){
	history.back()
}

function onVolumeClick(){
	backgroundAudio.play();
	backgroundAudio.muted = !backgroundAudio.muted;
	zoomOutAudio.muted = !zoomOutAudio.muted;
	zoomInAudio.muted = !zoomInAudio.muted;
	if(zoomOutAudio.muted) (document.getElementById("soundbutton") as HTMLImageElement).src = mutedPath;
	else (document.getElementById("soundbutton") as HTMLImageElement).src = unmutedPath;
}

//For use with loading screen
function onTransitionEnd( event: any ) {
	event.target.remove();	
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

let app = new App()
app.init()