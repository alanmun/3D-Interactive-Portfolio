import{M as e,G as t,a as n,b as o,C as a,c as i,d as s,O as r,e as l,R as d,V as c,S as w,f as m,B as h,A as p,g as u,P as g,W as b,h as y,T as f,i as v,j as M,k as D,D as A,l as k,m as I,n as T,o as x,p as C,q as E,r as S,s as j,t as z,u as G,v as L,w as F,E as N,L as R}from"./vendor.4a76a4b8.js";var B;class Q{constructor(o,a,i,s=null){this.isGroup=!1,this.distance=0,this.tilt=e.randInt(-70,10),this.theta=e.randFloat(0,6.28318530718),this.cameraIsAt=!1,this.entity=null,this.entityCloseUp=null,null!=s?this.entity=s:this.isGroup?this.entity=new t:this.entity=new n,this.entity.name=o,this.isGroup=a,this.distance=i}swapEntities(e){!1===this.cameraIsAt?(e.remove(this.entity),e.add(this.entityCloseUp),this.cameraIsAt=!0):(e.remove(this.entityCloseUp),e.add(this.entity),this.cameraIsAt=!1)}addMesh(e,t){this.isGroup?this.entity.add(new n(e,t)):(this.entity.geometry=e,this.entity.material=t)}setCloseUp(e){this.entityCloseUp=e,this.entityCloseUp.name=this.entity.name+" close"}rotate(e,t,n){this.entity.rotation.x+=e,this.entity.rotation.y+=t,this.entity.rotation.z+=n}adjustOrbit(){let e;e=this.cameraIsAt?this.entityCloseUp:this.entity;e.position.x=this.distance*Math.cos(this.theta),e.position.y=this.distance*Math.sin(this.theta),e.position.z=this.tilt*Math.sin(this.theta),this.theta+=1/(4*this.distance**1.5)}addGrass(e,t,a,i,s){let r=s.clone(!0);return r.position.set(e,t,a),r.traverse((function(e){e instanceof n&&(e.material=new o({color:i}))})),this.entityCloseUp.add(r),r}addTree(t,l=0,d,c){const w=e.randFloat(.5,1),m=new a(.1,.1,w,12),h=new i({color:"brown"}),p=new s(.4,2*w,12),u=new o({color:null!=c?c:"green"}),g=new r;g.add(new n(m,h));const b=new n(p,u);return b.position.y=3*w/2,g.add(b),void 0===t?g.position.x-=e.randFloat(7,15):g.position.x=t,g.position.y=l,void 0===d?g.position.z-=e.randFloat(-6,6.75):g.position.z=d,this.entityCloseUp.add(g),g}reverberate(t){if("blackhole"==this.entity.name){let n=.5*Math.sin(t)+.5;const o=new l("#BAD1FF"),a=new l("#FFFFFF");let i;return this.entity.material.uniforms.glowColor.value=o.lerp(a,n),i=e.randInt(1,10)>8?.4:0,t+i}return 0}setName(e){this.entity.name=e}getName(){return this.entity.name}}!function(e){e.mode=!1;let t=.1,n=.5;e.debuggerKeys=function(t,n){if(e.mode)switch(n){case 78:t.rotation.y+=.1,console.log(t.rotation);break;case 77:t.rotation.y-=.1,console.log(t.rotation);break;case 74:t.rotation.x+=.1,console.log(t.rotation);break;case 75:t.rotation.x-=.1,console.log(t.rotation);break;case 85:t.rotation.z+=.1,console.log(t.rotation);break;case 73:t.rotation.z-=.1,console.log(t.rotation);break;case 98:e.yMin(t);break;case 101:e.yPos(t);break;case 99:e.zMin(t);break;case 102:e.zPos(t);break;case 104:e.xMin(t);break;case 105:e.xPos(t);break;case 107:e.adjSens(1);break;case 109:e.adjSens(-1)}},e.adjSens=function(o){e.mode&&(n+=.1*o,t+=.01*o,console.log(`Positional sensitivity is now ${n}. \n Orientational sensitivity is now ${t}`))},e.xPos=function(t){e.mode&&(t.position.x+=n,console.log(t.position))},e.xMin=function(t){e.mode&&(t.position.x-=n,console.log(t.position))},e.yPos=function(t){e.mode&&(t.position.y+=n,console.log(t.position))},e.yMin=function(t){e.mode&&(t.position.y-=n,console.log(t.position))},e.zPos=function(t){e.mode&&(t.position.z+=n,console.log(t.position))},e.zMin=function(t){e.mode&&(t.position.z-=n,console.log(t.position))}}(B||(B={}));const U="\nuniform vec3 viewVector;\nuniform float c;\nuniform float p;\nvarying float intensity;\nvoid main() \n{\n    vec3 vNormal = normalize( normalMatrix * normal );\n\tvec3 vNormel = normalize( normalMatrix * viewVector );\n\tintensity = pow( c - dot(vNormal, vNormel), p );\n\t\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n",O="\nuniform vec3 glowColor;\nvarying float intensity;\nvoid main() \n{\n\tvec3 glow = glowColor * intensity;\n    gl_FragColor = vec4(glow, 1.0);\n}\n";var P,V;let H,W,X,Z,K,J,Y,q,_,$,ee,te,ne;(V=P||(P={}))[V.spawn=0]="spawn",V[V.blackHole=1]="blackHole",V[V.twitter=2]="twitter",V[V.autosage=3]="autosage",V[V.moon=4]="moon";var oe=new Audio("/assets/zoomout.73f18dd5.wav");oe.volume=.8,oe.muted=!0;var ae=new Audio("/assets/background.dd42b1f0.mp3");ae.volume=.65,ae.muted=!0;var ie=!1,se=!1,re=!1,le=!1,de=!1,ce=new d,we=new c;const me={x:0,y:0,z:360};let he={isLocked:!1,target:null,name:0};const pe={isLocked:!0,target:{position:me},name:0};function ue(e){if(e.target!=document.getElementById("soundbutton")&&(!he.isLocked||de))if(de)ge();else{if(we.x=e.clientX/window.innerWidth*2-1,we.y=-e.clientY/window.innerHeight*2+1,ce.setFromCamera(we,X),!de&&ce.ray.intersectsBox((new F).setFromObject(ee.entity)))return console.log("Hit detected on autosage world (not close up)"),H.enabled=!1,void(he={isLocked:!0,target:ee.entity,name:3});if(!de&&ce.ray.intersectsBox((new F).setFromObject(K.entity)))return console.log("Hit detected on twitter world (not close up)"),H.enabled=!1,void(he={isLocked:!0,target:K.entity,name:2});var t=ce.intersectObjects(W.children);console.log(t[0].object.name),"star"!=t[0].object.name&&"skybox"!=t[0].object.name&&"blackhole"!=t[0].object.name&&"blackholecore"!=t[0].object.name&&"gridhelper"!=t[0].object.name&&(H.enabled=!1,he.isLocked=!0,he.target=t[0].object,"moon"==t[0].object.name?he.name=4:"autosage"==t[0].object.name&&(he.name=3))}}function ge(){ve(!1),fe(he.name,!0),he=pe,oe.play()}function be(e){document.getElementById("portfolioDiv").style.visibility="visible";let t=document.getElementById("title"),n=document.getElementById("spanBody");switch(e){case 2:t.innerHTML="What Song Is That? (2020)",n.innerHTML='I decided to write and host a twitter bot for fun on my own server, using a Raspberry Pi, for a friend\'s twitter account. That bot has over a hundred thousand followers now. The success of that bot led me to make my own more sophisticated bot called What Song Is That? It takes requests from users who wish to know what song is playing in a tweet, queries Shazam\'s API on their behalf and displays its findings cleanly on a website I made for it. Check out <a style="text-decoration:none; color:salmon;" href="https://whatsong.page" target="_blank">whatsong.page</a> for more information.';break;case 3:t.innerHTML="AutoSage (2021)",n.innerHTML='AutoSage is a Python written tool for users of BeatSage, an AI driven service made for the popular VR rhythm game Beat Saber. AutoSage simplifies and automates the process of using BeatSage for all of the songs the user wishes to play in Beat Saber. See the tool\'s repo here: <a style="text-decoration:none; color:salmon;" href="https://github.com/alanmun/autosage" target="_blank">github.com/alanmun/autosage</a>';break;case 4:t.innerHTML="3D Interactive Portfolio (2021)",n.innerHTML='This portfolio is written in typescript using the three.js 3D graphics library and deployed using vite. My work on the AutoSage tool led me to discovering three.js. I was enamoured with the library and had to make something with it. I had always wanted a cool way to show my personal technological efforts and projects so I decided to represent them in their own worlds that can be visited by interacting with them. I learned more from undertaking this project than any other personal project I\'ve ever worked on. I had never written three.js code before, my HTML and CSS skills have definitely improved since beginning, and I gave myself an introduction to shaders and 3D modelling in blender by creating the Beat Saber cube that is floating in space. This portfolio remains a continual work in progress as I plan to update it with new worlds for every technological endeavor I go on. See the repo here: <a style="text-decoration:none; color:salmon;" href="https://github.com/alanmun/3D-Interactive-Portfolio" target="_blank">github.com/alanmun/3D-Interactive-Portfolio</a>';default:console.log("Unknown case in addText")}}function ye(){document.getElementById("portfolioDiv").style.visibility="hidden"}function fe(e,t){switch(t?(de=!1,X.rotation.set(0,0,0),K.distance/=1,ee.distance/=1.5,ne.distance/=2):(de=!0,X.rotation.set(0,1.57,0),K.distance*=1,ee.distance*=1.5,ne.distance*=2),e){case 1:break;case 4:t?(ne.swapEntities(W),ye()):(ne.swapEntities(W),be(e),he.target=ne.entityCloseUp);break;case 2:t?(K.swapEntities(W),ye()):(K.swapEntities(W),be(e),he.target=K.entityCloseUp);break;case 3:t?(ee.swapEntities(W),ye()):(ee.swapEntities(W),be(e),he.target=ee.entityCloseUp);break;default:console.log("DEFAULT TRIGGERED!?!?!?!?")}}function ve(e=!0,t="730ms"){var n=document.getElementById("bg");return n.style.transitionDuration=t,n.style.opacity=e?"0":"1",!1}function Me(e,t){let n=.5*e.parameters.width,o=new c(-n,0),a=new c(0,t),i=new c(n,0),s=(new c).subVectors(o,a),r=(new c).subVectors(a,i),l=(new c).subVectors(o,i),d=s.length()*r.length()*l.length()/(2*Math.abs(s.cross(l))),w=new c(0,t-d),m=2*((new c).subVectors(o,w).angle()-.5*Math.PI),h=e.attributes.uv,p=e.attributes.position,u=new c;for(let c=0;c<h.count;c++){let e=1-h.getX(c),t=p.getY(c);u.copy(i).rotateAround(w,m*e),p.setXYZ(c,u.x,t,-u.y)}p.needsUpdate=!0}function De(e){var t=e.which;if(32==t||27==t){if(0==he.name)return;if(he.isLocked&&!de)return;ge()}B.debuggerKeys(_,t)}function Ae(){ae.play(),ae.muted=!ae.muted,oe.muted=!oe.muted,oe.muted?document.getElementById("soundbutton").src="/assets/muted.55725545.png":document.getElementById("soundbutton").src="/assets/unmuted.a6fc9037.png"}function ke(e){e.target.remove()}function Ie(){X.aspect=window.innerWidth/window.innerHeight,X.updateProjectionMatrix(),Z.setSize(window.innerWidth,window.innerHeight)}(new class{addStar(t=!1){let o,a=e.randFloat(.75,.95);switch(e.randInt(1,8)){case 1:o=new l("#2407FF");break;case 2:o=new l("#FFB200");break;default:o=new l("white")}const i=new w(a,16,16),s=new m({uniforms:{glowColor:{value:o},p:{value:3},c:{value:.5},viewVector:{value:X.position}},vertexShader:U,fragmentShader:O,side:h,blending:p,transparent:!0}),r=new n(i,s);let d,c,u,g,b,y;g=0==e.randInt(0,1)?-1:1,b=0==e.randInt(0,1)?-1:1,y=t||0==e.randInt(0,1)?-1:1;const f=700;d=e.randFloat(0,g*f),u=e.randFloat(0,y*f),c=Math.abs(u)>380||Math.abs(d)>380?e.randFloat(0,b*f):e.randFloat(380*b,b*f),r.position.set(d,c,u),r.name="star",W.add(r)}pinCameraToWorld(e){X.position.set(e.position.x,e.position.y+8,e.position.z)}adjustCamera(e){const t=X.position.x-e.position.x,n=X.position.y-e.position.y,o=X.position.z-e.position.z,a=.08,i=.05,s=.025,r=.05;let l=Math.abs(t);l>18?X.position.x-=t*a:l>5?(X.position.x-=t*i,ie=!0):l>1?(X.position.x-=t*s,ie=!0):l>.03?(X.position.x-=Math.sign(t)*r,ie=!0):l>=0&&(X.position.x=e.position.x,ie=!0);let d=Math.abs(n);d>18?X.position.y-=n*a:d>5?(X.position.y-=n*i,se=!0):d>1?(X.position.y-=n*s,se=!0):d>.03?(X.position.y-=Math.sign(n)*r,se=!0):d>=0&&(X.position.y=e.position.y,se=!0);let c=Math.abs(o);c>18?X.position.z-=o*a:c>5?(X.position.z-=o*i,re=!0):c>1?(X.position.z-=o*s,re=!0):c>.03?(X.position.z-=Math.sign(o)*r,re=!0):c>=0&&(X.position.z=e.position.z,re=!0),X.position.x==me.x&&X.position.y==me.y&&X.position.z==me.z?(he={isLocked:!1,target:null,name:0},H.enabled=!0,console.log("Matched at spawn: "+X.position.x+"  "+me.x),ie=!1,se=!1,re=!1,le=!1):ie&&se&&re&&!le&&(ve(),setTimeout((function(){fe(he.name,!1),ve(!1)}),1e3),le=!0)}init(){var a;let s;W=new u,X=new g(35,window.innerWidth/window.innerHeight,.1,5e3),Z=new b({canvas:document.querySelector("#bg"),logarithmicDepthBuffer:!1,antialias:!0}),Z.setPixelRatio(window.devicePixelRatio),Z.setSize(window.innerWidth,window.innerHeight),document.body.appendChild(Z.domElement),H=new y(X,Z.domElement),H.rotateSpeed=.45,H.minDistance=50,H.maxDistance=370,H.enableZoom=!0,H.enablePan=!1,null==(a=document.getElementById("soundbutton"))||a.addEventListener("click",Ae);const r=new R((()=>{console.log("Loaded skybox"),s=new n(c,F),s.name="skybox",W.add(s),J.add(Y),J.add(q),J.add(_),K.addGrass(-13.5,3.7,-9,4088477,$),K.addGrass(-17.6,2.9,-7,3626634,$),K.addGrass(-15.6,2.9,-6.5,3626634,$),K.addGrass(-14.1,3.4,9.1,3626634,$),K.addGrass(-16.6,2.8,-7.3,3626634,$),K.addGrass(-17.5,2.8,-8.3,3626634,$);const e=document.querySelector("#loading-screen");null==e||e.classList.add("fade-out"),null==e||e.addEventListener("transitionend",ke),X.position.set(0,400,1200),H.enabled=!1,he=pe,le=!0})),d=new f(r);let c=new v(2100,2100,2100),F=[new M({map:d.load("/assets/right.19f9b8b4.png")}),new M({map:d.load("/assets/left.06e25816.png")}),new M({map:d.load("/assets/top.14e60ce3.png")}),new M({map:d.load("/assets/bottom.8560bb79.png")}),new M({map:d.load("/assets/front.e060fa56.png")}),new M({map:d.load("/assets/back.1d924bd0.png")})];F.forEach((e=>e.side=h));let P=new f(r).load("/assets/moon.b246064f.jpg"),V=new f(r).load("/assets/moonbumpmap.8e277ece.jpg");window.addEventListener("click",ue,!1),window.addEventListener("keydown",De,!1),window.addEventListener("resize",Ie,!1),new D(r).load("/assets/block.c03dc9a6.glb",(function(a){ee=new Q("autosage",!0,85,a.scene);let s=ee.entity;s.scale.set(7,7,7);let r=!0;s.traverse((function(e){e instanceof n&&(r?(r=!1,e.material=new i({color:"#cc0000",shininess:1,flatShading:!0})):e.material=new i({color:"#ffffff",flatShading:!0,side:A}))})),W.add(ee.entity),te=new t;const l=new k;var d,c,w,m,p,u;c=0,w=0,m=50,p=100,u=10,(d=l).moveTo(c,w+u),d.lineTo(c,w+p-u),d.quadraticCurveTo(c,w+p,c+u,w+p),d.lineTo(c+m-u,w+p),d.quadraticCurveTo(c+m,w+p,c+m,w+p-u),d.lineTo(c+m,w+u),d.quadraticCurveTo(c+m,w,c+m-u,w),d.lineTo(c+u,w),d.quadraticCurveTo(c,w,c,w+u);let g=new I(l);g.center();let b=new o({color:"red",metalness:.1});b.side=h;let y=new n(g,b);y.rotation.x+=90*e.DEG2RAD,y.rotation.z+=90*e.DEG2RAD,te.add(y),ee.setCloseUp(te);let f=new t;f=s.clone(!0),f.position.set(-40,1,-15),f.scale.set(1,1,1),f.name="miniblock1",f.rotation.y+=60*e.DEG2RAD,f.children[0].material=new i({color:"#0007cc",shininess:1,flatShading:!0}),te.add(f);let v=f.clone(!0);v.position.set(-40,1,-12.5),v.rotation.y+=30*e.DEG2RAD,f.children[0].material=new i({color:"#cc00c9",shininess:1,flatShading:!0}),te.add(v);let M=f.clone(!0);M.position.set(-35,1,15),M.rotation.x-=90*e.DEG2RAD,M.rotation.y+=30*e.DEG2RAD,M.children[0].material=new i({color:"#11a10a",shininess:1,flatShading:!0}),te.add(M)}),void 0,(function(e){console.error(e)}));const oe=new T(new l("white"),1);W.add(oe);const ae=new x(new l("white"),.6);if(ae.position.set(750,325,-1e3),W.add(ae),B.mode){const e=new C(200,50);e.name="gridhelper",W.add(e)}for(let e=0;e<600;e++)this.addStar();let ie=0,se=new Q("blackhole",!1,0);se.addMesh(new w(6,128,128),new m({uniforms:{glowColor:{value:new E(.1,.1,.1)},p:{value:6},c:{value:.25},viewVector:{value:X.position}},vertexShader:U,fragmentShader:O,side:h,blending:p,transparent:!0}));let re=new n(new w(4.75,128,128),new S({color:"black",clearcoat:0,side:A}));re.name="blackholecore",W.add(re),W.add(se.entity),new j(r).load("data:model/mtl;base64,IyAzZHMgTWF4IFdhdmVmcm9udCBPQkogRXhwb3J0ZXIgdjAuOTdiIC0gKGMpMjAwNyBndXJ1d2FyZQ0KIyBGaWxlIENyZWF0ZWQ6IDEyLjA5LjIwMTUgMDA6NDY6MTcNCg0KbmV3bXRsIHdpcmVfMjI5MTY2MjE1DQoJTnMgMzINCglkIDENCglUciAwDQoJVGYgMSAxIDENCglpbGx1bSAyDQoJS2EgMC44OTgwIDAuNjUxMCAwLjg0MzENCglLZCAwLjg5ODAgMC42NTEwIDAuODQzMQ0KCUtzIDAuMzUwMCAwLjM1MDAgMC4zNTAwDQoNCm5ld210bCB3aXJlXzAyODA4OTE3Nw0KCU5zIDMyDQoJZCAxDQoJVHIgMA0KCVRmIDEgMSAxDQoJaWxsdW0gMg0KCUthIDAuMTA5OCAwLjM0OTAgMC42OTQxDQoJS2QgMC4xMDk4IDAuMzQ5MCAwLjY5NDENCglLcyAwLjM1MDAgMC4zNTAwIDAuMzUwMA0K",(function(e){e.preload();let t=new z(r);t.setMaterials(e),t.load("/assets/pond.a963b409.obj",(function(e){Y=e,Y.scale.set(.02,.02,.02),Y.rotation.set(0,-8.2,0),Y.position.set(-16.5,2.8,-4),Y.traverse((function(e){e instanceof n&&("Componente_24_001"===e.name?e.material=new o({color:4599322,roughness:0,metalness:0,flatShading:!1}):(e.material=new o({color:7654644,opacity:.6,metalness:0,flatShading:!1}),e.material.transparent=!0,e.material.depthTest=!1,e.renderOrder=1),e.material.side=A)}))}))})),new D(r).load("/assets/scene.4a369dce.gltf",(function(e){_=e.scene,_.scale.set(.5,.5,.5),_.position.set(-20.8,4.5,9.1),_.rotation.set(.1,-12.9,.1)})),new f(r).load("/assets/foxmaterial.4ba17766.png",(function(e){e.encoding=G,e.flipY=!1,new D(r).load("/assets/scene.97359c91.gltf",(function(t){q=t.scene,q.traverse((function(t){t instanceof n&&(t.material=new o({map:e}))})),q.scale.set(.04,.024,.03),q.position.set(-19.8,3.5,-7.3),q.rotation.set(0,-11.7,0)}))})),new j(r).load("data:model/mtl;base64,IyBXYXZlRnJvbnQgKi5tdGwgZmlsZSAoZ2VuZXJhdGVkIGJ5IENJTkVNQSA0RCkNCg0KbmV3bXRsIE1hdA0KS2EgMSAxIDENCktkIDAuODAwMDAwMDExOTIwOTMgMC44MDAwMDAwMTE5MjA5MyAwLjgwMDAwMDAxMTkyMDkzDQppbGx1bSA3DQoNCm5ld210bCBNYXQuMQ0KS2EgMSAxIDENCktkIDEgMSAxDQpLcyAxIDEgMQ0KTnMgMTAwDQppbGx1bSA3DQoNCg==",(function(e){e.preload();let t=new z(r);t.setMaterials(e),t.load("/assets/grass.130a059d.obj",(function(e){$=e,$.scale.set(.06,.06,.06)}))})),new z(r).load("/assets/twitter.f3599cc1.obj",(function(a){a.traverse((function(e){e instanceof n&&(e.material=new o({color:4177151,roughness:0,metalness:0,flatShading:!1}),e.rotation.y+=7.5)})),K=new Q("twitter",!0,45,a),J=new t;let i=new L(64,64,128,128),s=new o({color:4177151,metalness:.4});s.side=h,Me(i,4);let r=new n(i,s);J.add(r),K.setCloseUp(J),r.rotation.x+=90*e.DEG2RAD,r.rotation.z+=90*e.DEG2RAD,function(){let t=new k,a=new k;t.moveTo(80,20),t.lineTo(40,80),t.lineTo(80,80),t.lineTo(80,20),a.moveTo(80,20),a.lineTo(40,80),a.lineTo(80,80),a.lineTo(80,20);let i=new N(t,{depth:.4,bevelEnabled:!0,bevelSegments:2,steps:2,bevelSize:1,bevelThickness:1}),s=new N(a,{depth:.4,bevelEnabled:!0,bevelSegments:2,steps:2,bevelSize:1,bevelThickness:1}),r=new n(i,new o({color:3371734,metalness:.4})),l=new n(s,new o({color:3371734,metalness:.4}));r.scale.set(1,1.75,1),l.scale.set(1,1.75,1),r.position.set(-7,-95,6),r.rotateX(0*e.DEG2RAD),r.rotateY(30*e.DEG2RAD),r.rotateZ(60*e.DEG2RAD),l.position.set(-7,-95,-6),l.rotateX(0*e.DEG2RAD),l.rotateY(330*e.DEG2RAD),l.rotateZ(60*e.DEG2RAD),J.add(l),J.add(r)}(),K.addTree(-9,6,-4.75,7837385),K.addTree(-12,6,-5.25,6654146),K.addTree(-11,6,-4.5,6654146),K.addTree(-9,6,5.05,5470907),K.addTree(-20.2,4.8,10.05,7837385),K.addTree(-22.3,4.8,10.05,3626634),K.addTree(-19.9,4.5,11.25,3626634),K.addTree(-24.4,4,13.05,3626634),W.add(K.entity)})),ne=new Q("moon",!1,110),ne.addMesh(new w(6,64,64),new o({map:P}));let ce=new t,we=new L(64,64,128,128),me=new o({map:P,bumpMap:V});me.side=h,Me(we,4);let ge=new n(we,me);ce.add(ge),ne.setCloseUp(ce),ge.rotation.x+=90*e.DEG2RAD,ge.rotation.z+=90*e.DEG2RAD,W.add(ne.entity);const be=()=>{requestAnimationFrame(be),ie=se.reverberate(ie),ee.adjustOrbit(),ne.adjustOrbit(),K.adjustOrbit(),ee.rotate(.001,.001,.01),ne.rotate(.001,.001,0),K.rotate(0,0,.002),he.isLocked&&(de?this.pinCameraToWorld(he.target):this.adjustCamera(he.target)),Z.render(W,X)};be()}}).init();
