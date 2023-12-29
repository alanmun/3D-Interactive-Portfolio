import { CelestialEntity } from "./CelestialEntity";
import * as THREE from 'three';

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
		let finnCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
		let finnCloseUpMat = new THREE.MeshStandardMaterial( {color: 'green'} )
		finnCloseUpMat.side = THREE.BackSide;
		this.planeCurve(finnCloseUpGeo, 4);
		let finnCloseUpMesh = new THREE.Mesh(
			finnCloseUpGeo,
			finnCloseUpMat
		);
		finnCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90;
		finnCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90;
		finnCloseUp.add(finnCloseUpMesh);
		this.setCloseUp(finnCloseUp);
  }
}