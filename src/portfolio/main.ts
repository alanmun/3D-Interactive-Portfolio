//This script is the entrypoint for the 3D Portfolio

import './portfolio.css';
import { UI } from './adjustUI';
import { UniverseCamera } from './adjustCamera';
import { CelestialEntity } from './CelestialEntity';
import { BlackHole } from './BlackHole';
import { AutoSage } from './AutoSage';
import { Moon } from './Moon';
import { Twitter } from './Twitter';
import { Finn } from './Finn';
import { Persona } from './Persona';
import { Debug } from './PortfolioDebugger';
import { Direction, onTransitionEnd } from './utils'
import { vShader, fShader } from "./atmosphericGlowShader"
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

//Asset paths need to be imported to be linked at compile time. Force everything to be a url using ?url to be safe because I know it works from preview
import skyboxRight from './assets/skyboxwithsun/right.png?url'
import skyboxLeft from './assets/skyboxwithsun/left.png?url'
import skyboxTop from './assets/skyboxwithsun/top.png?url'
import skyboxBottom from './assets/skyboxwithsun/bottom.png?url'
import skyboxFront from './assets/skyboxwithsun/front.png?url'
import skyboxBack from './assets/skyboxwithsun/back.png?url'
import twitterPondPath from './assets/pond/pond.obj?url'
import twitterPondMTLPath from './assets/pond/pond.mtl?url'
import twitterGrassPath from './assets/grass/grass.obj?url'
import twitterGrassMTLPath from './assets/grass/grass.mtl?url'
import twitterObjPath from './assets/twitter.obj?url'
import beatSaberGlbPath from './assets/block.glb?url'
const finnGLTFPath = '../assets/leaf/scene.gltf'
import maskPath from './assets/persona/p5_mask.stl?url'

let ub: UniverseBuilder;

let controls: OrbitControls

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

let p5r: CelestialEntity

let finn: CelestialEntity

let autosage: CelestialEntity

let twitter: CelestialEntity //For twitter.obj model
let pond: THREE.Object3D
let fox: THREE.Object3D
let moose: THREE.Object3D
let grass: THREE.Object3D

let moon: CelestialEntity


//Set up mouse clicking functionality
var raycaster = new THREE.Raycaster(); 
var mouse = new THREE.Vector2(); //2D representation of where a mouse click occurs

export class UniverseBuilder {

	private ui = new UI();
	public uc = new UniverseCamera();
	public animate: () => void; //The "game" loop of three.js

	constructor(){
		// ? The original twitter world is what is causing that weird glitch where it jumps a few units forward and the close up world vanishes
		// ! close up worlds are not being named for some reason. Their names should be "{noncloseupname} close" but are instead ""

		scene = new THREE.Scene(); //Instantiate the scene
		
		renderer = new THREE.WebGLRenderer({ //Instantiate and set up renderer
			canvas: document.querySelector('#bg') as HTMLCanvasElement,
			logarithmicDepthBuffer: false, //This is causing issues with atmospheric glow. Stars use it so they are entirely invisible because of this.
			antialias: true
		})
		renderer.setPixelRatio(window.devicePixelRatio) //
		renderer.setSize(window.innerWidth, window.innerHeight) //Fullscreen
		document.body.appendChild(renderer.domElement); //Add renderer to the dom, which is responsible for drawing camera and scene
		
		controls = new OrbitControls(this.uc.camera, renderer.domElement); //Move around in the scene with your mouse!
		controls.rotateSpeed = 0.45
		controls.minDistance = 35
		controls.maxDistance = 470
		controls.enableZoom = true
		controls.enablePan = false //Panning isn't allowed as it can break the visuals as well

		//Skybox, Loading Manager (which enforces loading screen)
		let skybox: THREE.Mesh
		const loadingManager = new THREE.LoadingManager();
		loadingManager.onLoad = () => {
			console.log("Loaded skybox")
			skybox = new THREE.Mesh(skyboxGeom, skyboxMaterials)
			skybox.name = "skybox" //Tag it so we can block mouse clicks from acting on it
			scene.add(skybox);

			const loadingScreen = document.querySelector('#loading-screen');
			loadingScreen?.classList.add('fade-out')
			loadingScreen?.addEventListener('transitionend', onTransitionEnd)
			this.uc.setupCamera();
			controls.enabled = false;

			//Debug.debugCloseUpWorld(this, finn); //* Uncomment this to instantly visit this world for dev purposes
		};
		const loader = new THREE.TextureLoader(loadingManager);
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
		document.body.addEventListener("touch", this.onInteract.bind(this), false) //Some browsers simulate click when touching on device, but this is still needed for the ones that don't
		document.body.addEventListener("click", this.onInteract.bind(this), false)
		window.addEventListener("keydown", this.onKey.bind(this), false)
		window.addEventListener("resize", this.onWindowResize.bind(this), false)

		// * Create Persona 5 Royal Theme planet
		new FBXLoader(loadingManager).load(maskPath, (fbx: THREE.Group) => {
			p5r = new Persona(loadingManager, fbx);
			console.log(fbx);
			scene.add(p5r.entity);
		});

		// * Create Finn planet
		new GLTFLoader(loadingManager).load(finnGLTFPath, function(gltf: any){
			finn = new Finn(loadingManager, gltf.scene);
			scene.add(finn.entity);
		})

		// * Create the autosage planet
		new GLTFLoader(loadingManager).load(beatSaberGlbPath, function(obj){
			//Create celestial entity object for autosage and add to scene
			autosage = new AutoSage(obj.scene);
			scene.add(autosage.entity);
		}, undefined, function ( error ) {
			console.error( error );
		});

		// * Create the black hole
		let blackHole = new BlackHole(new THREE.Mesh(), this.uc.camera, scene)
		/* TODO: Maybe I should merge this into one black hole THREE.Group, right now I'm lazy and don't care to figure out how to traverse and select
			the mesh with shader material on it so I can modify that one in reverberate()
		*/


		//Load and prep the pond
		new MTLLoader(loadingManager).load(twitterPondMTLPath, function(mtl){
			mtl.preload()
			let gLoader = new OBJLoader(loadingManager)
			gLoader.setMaterials(mtl)
			gLoader.load(twitterPondPath, function(group){
				pond = group;
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
				});
				twitter.entityCloseUp.add(pond);
			});
		});

		//Load and position the moose
		new GLTFLoader(loadingManager).load('../assets/moose/scene.gltf', function(gltf){
			moose = gltf.scene;
			moose.scale.set(.5, .5, .5);
			moose.position.set(-20.8, 4.5, 9.1);
			moose.rotation.set(0.1, -12.9, 0.1);
			twitter.entityCloseUp.add(moose);
		})

		//Load and position the fox
		new GLTFLoader(loadingManager).load('../assets/fox/scene.gltf', function(gltf){
			fox = gltf.scene;
			fox.scale.set(0.04, .024, 0.03);
			fox.position.set(-19.8, 3.5, -7.3);
			fox.rotation.set(0, -11.7, 0);
			twitter.entityCloseUp.add(fox);
		})

		// * Create the twitter planet from an .obj model
		new OBJLoader(loadingManager).load(twitterObjPath, function(this: UniverseBuilder, group: THREE.Group){
			group.traverse(function(child){
				if(child instanceof THREE.Mesh){
					//console.log(child)
					child.material = new THREE.MeshStandardMaterial({ color: 0x3fbcff, roughness: 0, metalness: 0, flatShading: false})
					child.rotation.y += 7.5 //For start up sake I like to start it at this rotation so it looks more presentable, not that important
				}
			});

			twitter = new Twitter(group);		
			scene.add(twitter.entity);
		}.bind(this));

		//Load and prep the grass(es)
		new MTLLoader(loadingManager).load(twitterGrassMTLPath, function(mtl){
			mtl.preload();

			let gLoader = new OBJLoader(loadingManager)
			gLoader.setMaterials(mtl)
			gLoader.load(twitterGrassPath, function(group){
				grass = group;
				grass.scale.set(0.06, 0.06, 0.06);
				
				/* 
				TODO: These should ideally occur inside of Twitter.
						but I have problems I need to solve with asynchronicity
						and the objects not being defined yet
				*/
				twitter.addGrass(-13.5, 3.7, -9, 0x3e629d, grass);
				twitter.addGrass(-17.6, 2.9, -7, 0x37568a, grass);
				twitter.addGrass(-15.6, 2.9, -6.5, 0x37568a, grass);
				twitter.addGrass(-14.1, 3.4, 9.1, 0x37568a, grass);
				twitter.addGrass(-16.6, 2.8, -7.3, 0x37568a, grass);
				twitter.addGrass(-17.5, 2.8, -8.3, 0x37568a, grass);
				});
		});

		// * Create the moon
		moon = new Moon(new THREE.Mesh(), loadingManager);
		scene.add(moon.entity);

		// * Add some light
		const aL = new THREE.AmbientLight(new THREE.Color("white"), 0.9)
		scene.add(aL)
		
		// * Provide light from the sun in the far distance
		const pL = new THREE.PointLight(new THREE.Color("white"), .7) 
		pL.position.set(750,325,-1000) //A distance of over 1000 is req'd to reach twitter world 
		scene.add(pL)

		// * Populate the universe with stars
		for(let i = 0; i < 1000; i++) this.addStar()

		// * Post processing
		const composer = new EffectComposer(renderer);
		const renderPass = new RenderPass(scene, this.uc.camera);
		composer.addPass(renderPass);
		const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.2, 0, 0);
		composer.addPass(bloomPass);
		
		//* three.js "game" loop
		this.animate = () =>{
			requestAnimationFrame(this.animate)

			//Black Hole shader manipulation
			blackHole.reverberate();
			
			for(const celestialEntity of [autosage, moon, twitter, finn, p5r]){
				if(!celestialEntity) continue;
				celestialEntity.adjustOrbit();
				celestialEntity.rotate();
			}

			//Adjust camera
			let status = this.uc.animateCamera();

			//Depending on the results of animating the camera, do some things
			if(status === "approached spawn"){
				controls.enabled = true;
			}
			else if(status === "approached world"){
				this.ui.fade(Direction.out)
				setTimeout(function(this: UniverseBuilder){
					this.changeWorld(this.uc.cameraLock.entity!, false);
					this.ui.fade(Direction.in)
				}.bind(this), 1000)
			}

			//renderer.render(scene, this.uc.camera);
			composer.render()
		}
	}

	//Adds a star in a random spot, if negZOnly is passed in as true, it won't put any stars in pos z, helping to "background" the stars better
	private addStar(){
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
				viewVector: { value: this.uc.camera.position}
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

	public changeWorld(cEntity: CelestialEntity, leaving: boolean){
		console.log("changewrld w:", cEntity, leaving)
		if(leaving){
			this.uc.setCameraForLeaving();
			twitter.distance /= 1
			autosage.distance /= 1.5
			finn.distance /= 2
			moon.distance /= 2.25

			cEntity.swapEntities(scene)
			this.ui.removeText()
		}
		else{
			this.uc.setCameraForEntering();
			twitter.distance *= 1
			autosage.distance *= 1.5
			finn.distance *= 2
			moon.distance *= 2.25

			cEntity.swapEntities(scene)
			this.ui.addText(cEntity)
			this.uc.cameraLock.target = cEntity.entityCloseUp;
		}
	}

	//Routine actions to take when backing out of a world
	private exitWorld(){
		this.ui.fade(Direction.in); //Ask fade function to fade us again
		this.changeWorld(this.uc.cameraLock.entity!, true);
		this.uc.setCameraToSpawn();
		this.ui.playZoom(Direction.out);
	}

	//TODO: A GOOD CHUNK OF THE CODE IN HERE SHOULD BE MOVED INTO adjustCamera.ts
	private onInteract(event:any) {
		event.preventDefault();
		if(event.target == document.getElementById("soundbutton")){
			this.ui.onVolumeClick();
			return; //bail if click occurred on volume button
		} 
		if(event.target == document.getElementById("backbutton")){
			this.ui.onBackClick(); //No need to return since this action leaves the webpage
		}
		if(event.target instanceof HTMLAnchorElement){
			window.open(event.target.href, '_blank')
			return; //Bail if click occurs on hyperlink
		}
	
		//calculate mouse position in normalized device coordinates  (-1 to +1) for both components
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1; //I believe these convert to centered normalized coordinates x,y at 0,0 is exact center of screen
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // height 100, click at 5, -5/100 = -0.05*2 is -slowInc + 1 means click was registered at y = 0.9
	
		raycaster.setFromCamera(mouse, this.uc.camera); // update the picking ray with the camera and mouse position
		var intersects = raycaster.intersectObjects(scene.children, true);
		console.log(intersects[0].object.name)
		console.log(intersects[0].object)
	
		
		if(this.uc.cameraLock.isLocked && !this.uc.shouldPinCamera) return //Mouse clicking should have no effect when camera is targeting something
		else if(this.uc.shouldPinCamera && intersects[0].object.name == "skybox"){
			this.exitWorld(); //If cam wasn't locked, and shouldPinCamera is true, we are at a close up world.
			return;
		}
	
		/*
		* Because there are so many misfires, and so many things I DON'T want the user to be able to click, I've decided to switch to an approach of
		* only allowing a click if it matches these whitelisted names, instead of blacklisting every name I come across that I don't want to allow + "" (no name) 
		*/
		if(!this.uc.shouldPinCamera && raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(autosage.entity))){
			console.log("Hit detected on autosage world (not close up)")
			this.registerHitOnEntity(autosage);
		}
		else if(!this.uc.shouldPinCamera && raycaster.ray.intersectsBox(new THREE.Box3().setFromObject(twitter.entity))){
			console.log("Hit detected on twitter world (not close up)")
			// * We intersected on our twitter.obj model which is a THREE.Group and so can't be detected the normal way below
			// * Actually, I think you can intersect on THREE.Group, there is some other weird reason it can't be detected the normal way
			this.registerHitOnEntity(twitter);
		}
		else if(!this.uc.shouldPinCamera && intersects[0].object.name == "moon"){
			this.registerHitOnEntity(moon);
		}
		else if(!this.uc.shouldPinCamera && intersects[0].object.name == "finnMesh"){
			this.registerHitOnEntity(finn);
		}
	}

	// * Actions to take when a valid celestial entity is clicked on.
	private registerHitOnEntity(ce: CelestialEntity){
		this.ui.playZoom(Direction.in);
		controls.enabled = false;
		this.uc.cameraLock = {
			isLocked: true,
			target: ce.entity,
			entity: ce
		}
	}

	//Register listener for and set up callback for space and esc key
	private onKey(event: any){
		var keyCode = event.which
		if(keyCode == 32 || keyCode == 27){ //Space and Esc respectively
			if(this.uc.cameraLock.entity == null) return //Do nothing if cameraLock was last locked onto spawn (prevents zoomout audio file spam etc)
			if(this.uc.cameraLock.isLocked && !this.uc.shouldPinCamera) return //space/esc keys should have no effect when camera is targeting something
			this.exitWorld();
		}

		//Debug.debuggerKeys(this.uc.camera, keyCode)
	}

	private onWindowResize() {
		this.uc.camera.aspect = window.innerWidth / window.innerHeight;
		this.uc.camera.updateProjectionMatrix();
	
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

ub = new UniverseBuilder();
ub.animate();