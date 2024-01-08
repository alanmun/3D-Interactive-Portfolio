import { CelestialEntity } from "./CelestialEntity";
import { Debug } from './PortfolioDebugger';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

const wiseTreePath = '../assets/stylized_tree/scene.gltf'
import groundAmbOccPath from './assets/stone_path/ambientOcclusion.jpg?url'
import groundColorPath from './assets/stone_path/basecolor.jpg?url'
import groundHeightPath from './assets/stone_path/height.png?url'
import groundRoughnessPath from './assets/stone_path/roughness.jpg?url'
import groundNormalPath from './assets/stone_path/normal.jpg?url'
import dirtColorPath from './assets/dirt_ground/COL_1K.jpg?url'
import dirtNormalPath from './assets/dirt_ground/NRM_1K.jpg?url'
import dirtAmbOccPath from './assets/dirt_ground/AO_1K.jpg?url'
import dirtBumpPath from './assets/dirt_ground/BUMP_1K.jpg?url'
import dirtDispPath from './assets/dirt_ground/DISP_1K.jpg?url'
import grassPath from './assets/grass/grass.obj?url'
import { findAllMatches } from "./utils";

export class Finn extends CelestialEntity {
  constructor(loadManager: THREE.LoadingManager, entityMesh: THREE.Object3D) {
    super('finn', 90, entityMesh);

    this.titleContent = "Finn (2023)";
    this.bodyContent = `Troutwood's financial assistant, also known as Finn or AI Finn, is an ongoing Large Language Model (LLM) app project. Working in a small team while at Carnegie Mellon University, I built an LLM app from scratch using LangChain and OpenAI's API. By the end of my time with Troutwood, Finn could: 
    - Teach users basic financial concepts (Finn, what is compound interest?)
    - Read from financial education books written by Troutwood's founder to instill financial wisdom from an accredited professor of finance (Finn, how should I pay off my student loans? I'm really worried about them)
    - Get user's financial data from Troutwood's backend to assist the LLM in answering questions a user may have about their own finances. (Finn, can I afford to buy a 20k car with my current income and budgets?)
    The LLM app was architected by myself to be a RAG-heavy application (Retrieval Augmented Generation) due to the client's use case already being a good fit for the current behavior of the LLM the client desired to use. This meant that it didn't need fine-tuning and instead the path to optimization involved many clever applications of RAG to selectively and efficiently inject context depending on the user's current query. Context could be snippets from the founder's books, user data, previous chats between the user and LLM, and the Troutwood Glossary, a document I wrote to teach Finn what it needs to know about Troutwood and its product offerings.`;

    // * Need to set its mesh to a recognizable name for maintainability, this mesh is the hitbox that clicks land on
    this.entity.children[0].children[0].children[0].children[0].children[0].name = 'finnMesh';
    this.entity.scale.set(5, 5, 5);
    this.entity.rotation.x += THREE.MathUtils.DEG2RAD * 180;
    
    this.rotationVector = new THREE.Vector3(0, 0.001, 0.002);

    // * Create the close up world for finn
		let finnCloseUp = new THREE.Group();

    // * Load close up textures and models
    const textureLoader = new THREE.TextureLoader(loadManager);
    let groundNormal = this.configureGroundTexture(textureLoader, groundNormalPath);
    let groundAmbOcc = this.configureGroundTexture(textureLoader, groundAmbOccPath);
    let groundColor = this.configureGroundTexture(textureLoader, groundColorPath);
    let groundRoughness = this.configureGroundTexture(textureLoader, groundRoughnessPath);
    let groundHeight = this.configureGroundTexture(textureLoader, groundHeightPath);

    let dirtColor = this.configureGroundTexture(textureLoader, dirtColorPath, 3);
    let dirtNormal = this.configureGroundTexture(textureLoader, dirtNormalPath, 3);
    let dirtAmbOcc = this.configureGroundTexture(textureLoader, dirtAmbOccPath, 3);
    let dirtBump = this.configureGroundTexture(textureLoader, dirtBumpPath, 3);
    let dirtDisp = this.configureGroundTexture(textureLoader, dirtDispPath, 3);

    let wiseTree;
    new GLTFLoader(loadManager).load(wiseTreePath, (tree) => {
      wiseTree = tree.scene;
      const materials = findAllMatches(wiseTree, "emissive"); //{r: 255, g: 255, b: 255}, 0.5
      for(const material of materials){
        material.color.multiplyScalar(5);
      }
      wiseTree.position.add(new THREE.Vector3(-55, -1, 0))
      wiseTree.rotation.y += THREE.MathUtils.DEG2RAD * 90;
      finnCloseUp.add(wiseTree);
    });

		let finnCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
		let finnCloseUpMat = new THREE.MeshStandardMaterial( {
      map: groundColor,
      aoMap: groundAmbOcc, //* Defaults to 1 (fully in effect), but removing made no diff?
      normalMap: groundNormal,
      roughnessMap: groundRoughness, //* Notice no diff between roughness 0,1, or this removed entirely
      displacementMap: groundHeight,
      displacementScale: 0.3, //* Super bumpy so I took this down, defaulted to 1.0
    } );
		finnCloseUpMat.side = THREE.BackSide;
		this.planeCurve(finnCloseUpGeo, 4);
		let finnCloseUpMesh = new THREE.Mesh(
			finnCloseUpGeo,
			finnCloseUpMat
		);
		finnCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90;
		finnCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90;
		finnCloseUp.add(finnCloseUpMesh);

    // * Grass for the close up
    let grassGroup = new THREE.Group();
    let grassDirtGroundGeo = new THREE.PlaneGeometry(20, 64, 32, 128)
    let grassDirtGroundMat = new THREE.MeshStandardMaterial({
      map: dirtColor,
      aoMap: dirtAmbOcc,
      normalMap: dirtNormal,
      bumpMap: dirtBump,
      displacementMap: dirtDisp
    });

    new OBJLoader(loadManager).load(grassPath, (grass) => {
      ((grass.children[0] as THREE.Mesh).material as THREE.MeshPhongMaterial).color = new THREE.Color(0x10590a);

      //* Mass reproduce clones of this grass and populate the close up world with a grass lawn
      let grassClones = new THREE.Group();
      grassClones.rotation.x += 0.025;
      const leftBound = 5; //* Leftmost grass should appear
      const rightBound = -4.5; //* Rightmost (more neg on z axis)
      const farBound = -35.5; //* Farthest back grass should appear
      const nearBound = -12.5//* Closest grass should appear
      for(let z = leftBound; z > rightBound; z -= 1){
        for(let x = farBound; x < nearBound; x += 1){
          let clone = grass.clone();
          let xJitter = (Math.random()-0.5)*1.25;
          let yJitter = Math.random()-0.5;
          let zJitter = (Math.random()-0.5)*1.25;
          clone.position.set((x+xJitter)*10, 1+yJitter, (z+zJitter)*10);
          grassClones.add(clone);
        }
      }
      //
      grassGroup.add(grassClones);
      grassGroup.scale.multiplyScalar(0.1)
      grassGroup.position.set(1.5, 2.5, -0.5)
      grassGroup.rotation.set(-0.01, 0, 0.005)

      let grassDirtMesh = new THREE.Mesh(
        grassDirtGroundGeo,
        grassDirtGroundMat
      )
      grassDirtMesh.material.color.setRGB(0.5, 0.3, 0.3);
      grassDirtMesh.scale.multiplyScalar(5)
      grassDirtMesh.position.set(-166, 12.7, 9.5)
      grassDirtMesh.rotation.set(-1.55, 0.003, -1.6, 'XYZ');
      grassGroup.add(grassDirtMesh);
      //this.objToDebug = grassClones; //! Debugging
      //document.onkeydown = this.onKey.bind(this); //! Debugging
      finnCloseUp.add(grassGroup);
    });

		this.setCloseUp(finnCloseUp);
  }

  private configureGroundTexture(loader: THREE.TextureLoader, pathToTexture: string, repeatTimes: number=10){
    const texture = loader.load(pathToTexture);
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(repeatTimes, repeatTimes);
    return texture
  }

  private onKey(event: any){
    console.log(event, this)
    if(this.objToDebug == null) return;

    var keyCode = event.which
    Debug.debuggerKeys(this.objToDebug, keyCode)
	}
}