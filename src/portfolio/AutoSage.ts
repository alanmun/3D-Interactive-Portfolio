import { CelestialEntity } from "./CelestialEntity";
import * as THREE from 'three';

export class AutoSage extends CelestialEntity {

    constructor(entityMesh: THREE.Group){
        super('autosage', 75, entityMesh);

        this.titleContent = "AutoSage (2021)" 
        this.bodyContent = "AutoSage is a Python written app for users of BeatSage, an AI driven service made for the popular VR rhythm game Beat Saber. AutoSage simplifies and automates the process of using BeatSage for all of the songs the user wishes to play in Beat Saber. The tool has been updated to be packaged into a Windows executable using PyInstaller, and features a UI built using Tkinter for ease of use. See the tool's repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/autosage\" target=\"_blank\">github.com/alan mun/autosage</a>"

        this.rotationVector = new THREE.Vector3(0.001, 0.001, 0.01);

        let block: THREE.Group = this.entity;
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
        });

        // * Create the close up world for autosage
        this.entityCloseUp = new THREE.Group();
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
        this.entityCloseUp.add(autosageCloseUpMesh)
        this.setCloseUp(this.entityCloseUp);
        
        //Create copies of the original block and use them as decorations
        let miniblock1 = new THREE.Group()
        miniblock1 = block.clone(true)
        miniblock1.position.set(-40,1,-15)
        miniblock1.scale.set(1,1,1)
        miniblock1.name = "miniblock1"
        miniblock1.rotation.y += THREE.MathUtils.DEG2RAD * 60;
        (miniblock1.children[0] as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: "#0007cc", shininess: 1, flatShading: true});
        this.entityCloseUp.add(miniblock1);

        let miniblock2 = miniblock1.clone(true)
        miniblock2.position.set(-40,1,-12.5)
        miniblock2.rotation.y += THREE.MathUtils.DEG2RAD * 30;
        (miniblock1.children[0] as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: "#cc00c9", shininess: 1, flatShading: true});
        this.entityCloseUp.add(miniblock2);

        let miniblock3 = miniblock1.clone(true)
        miniblock3.position.set(-35,1,15);
        miniblock3.rotation.x -= THREE.MathUtils.DEG2RAD * 90;
        miniblock3.rotation.y += THREE.MathUtils.DEG2RAD * 30;
        (miniblock3.children[0] as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: "#11a10a", shininess: 1, flatShading: true});
        this.entityCloseUp.add(miniblock3);
    }
}