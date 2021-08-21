import{M as t,G as e,a as n,R as i,V as o,S as s,b as a,C as r,c as d,T as l,B as c,d as w,P as h,W as m,e as p,f as u,g as y,A as b,h as g,O as f,i as v,L as x}from"./vendor.44cd72b3.js";class k{constructor(i,o,s,a=null){this.isGroup=!1,this.distance=0,this.tilt=t.randInt(-70,10),this.theta=t.randFloat(0,6.28318530718),this.cameraIsAt=!1,this.entity=null,this.entityCloseUp=null,null!=a?this.entity=a:this.isGroup?this.entity=new e:this.entity=new n,this.entity.name=i,this.isGroup=o,this.distance=s}swapEntities(t){!1===this.cameraIsAt?(t.remove(this.entity),t.add(this.entityCloseUp),this.cameraIsAt=!0):(t.remove(this.entityCloseUp),t.add(this.entity),this.cameraIsAt=!1)}addMesh(t,e){this.isGroup?this.entity.add(new n(t,e)):(this.entity.geometry=t,this.entity.material=e)}setCloseUp(t){this.entityCloseUp=t,this.entityCloseUp.name=this.entity.name+" close"}rotate(t,e,n){this.entity.rotation.x+=t,this.entity.rotation.y+=e,this.entity.rotation.z+=n}adjustOrbit(){let t;t=this.cameraIsAt?this.entityCloseUp:this.entity;t.position.x=this.distance*Math.cos(this.theta),t.position.y=this.distance*Math.sin(this.theta),t.position.z=this.tilt*Math.sin(this.theta),this.theta+=1/(.07*this.distance**2)}setName(t){this.entity.name=t}getName(){return this.entity.name}}var I,E;(E=I||(I={}))[E.spawn=0]="spawn",E[E.blackHole=1]="blackHole",E[E.twitter=2]="twitter",E[E.autosage=3]="autosage",E[E.moon=4]="moon";let M,j,z,D,C,L,P,U,A=0,F=!1;var G=new Audio("/3D-Interactive-Portfolio/assets/zoomout.73f18dd5.wav");G.volume=.9;var S=new Audio("/3D-Interactive-Portfolio/assets/background.dd42b1f0.mp3");S.volume=.65;var H=!1,R=!1,T=!1,W=!1,B=!1,O=new i,V=new o;const q={x:0,y:0,z:290};let X={isLocked:!1,target:null,name:0};const Y={isLocked:!0,target:{position:q},name:0};function N(t){if(!X.isLocked||B){if(V.x=t.clientX/window.innerWidth*2-1,V.y=-t.clientY/window.innerHeight*2+1,O.setFromCamera(V,z),!B&&O.ray.intersectsBox((new v).setFromObject(C.entity)))return console.log("Hit detected on twitter world (not close up)"),void(X={isLocked:!0,target:C.entity,name:2});var e=O.intersectObjects(j.children);console.log(e[0].object.name),"star"!=e[0].object.name&&"skybox"!=e[0].object.name&&(B&&0==e[0].object.name.includes("close")||(e[0].object.name.includes("close")?Z():(X.isLocked=!0,X.target=e[0].object,"moon"==e[0].object.name?X.name=4:"black hole"==e[0].object.name?X.name=1:"autosage"==e[0].object.name&&(X.name=3))))}}function Z(){$(!1),Q(X.name,!0),X=Y,G.play()}function J(t){let e;switch(t){case 2:e=document.getElementById("twitter"),e.style.visibility="visible";break;case 3:e=document.getElementById("autosage"),e.style.visibility="visible";break;default:console.log("Unknown case in addText")}}function K(t){let e;switch(t){case 2:e=document.getElementById("twitter"),e.style.visibility="hidden";break;case 3:e=document.getElementById("autosage"),e.style.visibility="hidden";break;default:console.log("Unknown case in removeText")}}function Q(t,e){switch(e?(B=!1,z.rotation.y=0):(B=!0,z.rotation.y=1.57),t){case 1:case 4:break;case 2:e?(C.swapEntities(j),K(t)):(C.swapEntities(j),J(t),X.target=C.entityCloseUp);break;case 3:e?(P.swapEntities(j),K(t)):(P.swapEntities(j),J(t),X.target=P.entityCloseUp);break;default:console.log("DEFAULT TRIGGERED!?!?!?!?")}}function $(t=!0,e="730ms"){var n=document.getElementById("bg");return n.style.transitionDuration=e,n.style.opacity=t?"0":"1",!1}function _(t,e){let n=.5*t.parameters.width,i=new o(-n,0),s=new o(0,e),a=new o(n,0),r=(new o).subVectors(i,s),d=(new o).subVectors(s,a),l=(new o).subVectors(i,a),c=r.length()*d.length()*l.length()/(2*Math.abs(r.cross(l))),w=new o(0,e-c),h=2*((new o).subVectors(i,w).angle()-.5*Math.PI),m=t.attributes.uv,p=t.attributes.position,u=new o;for(let o=0;o<m.count;o++){let t=1-m.getX(o),e=p.getY(o);u.copy(a).rotateAround(w,h*t),p.setXYZ(o,u.x,e,-u.y)}p.needsUpdate=!0}function tt(t){var e=t.which;if(32==e||27==e){if(0==X.name)return;if(X.isLocked&&!B)return;Z()}}function et(t){t.target.remove()}function nt(){A+=1}function it(){z.aspect=window.innerWidth/window.innerHeight,z.updateProjectionMatrix(),D.setSize(window.innerWidth,window.innerHeight)}(new class{addStar(e=!1){const i=new s(t.randFloat(.25,.75),24,24),o=new a({color:new r("white")}),d=new n(i,o);let l,c,w,h,m,p;h=0==t.randInt(0,1)?-1:1,m=0==t.randInt(0,1)?-1:1,p=e||0==t.randInt(0,1)?-1:1;const u=700;l=t.randFloat(0,h*u),w=t.randFloat(0,p*u),c=Math.abs(w)>260||Math.abs(l)>260?t.randFloat(0,m*u):t.randFloat(260*m,m*u),d.position.set(l,c,w),d.name="star",M.add(d)}pinCameraToWorld(e){console.log(z.rotation.x+30*t.DEG2RAD),z.position.set(e.position.x,e.position.y+10,e.position.z)}adjustCamera(t,e=.08,n=.025){const i=z.position.x-t.position.x,o=z.position.y-t.position.y,s=z.position.z-t.position.z,a=.05,r=.05;let d=Math.abs(i);d>18?z.position.x-=i*e:d>5?(z.position.x-=i*a,H=!0):d>1?(z.position.x-=i*n,H=!0):d>.1?(z.position.x-=Math.sign(i)*r,H=!0):d>=0&&(z.position.x=t.position.x,H=!0);let l=Math.abs(o);l>18?z.position.y-=o*e:l>5?(z.position.y-=o*a,R=!0):l>1?(z.position.y-=o*n,R=!0):l>.1?(z.position.y-=Math.sign(o)*r,R=!0):l>=0&&(z.position.y=t.position.y,R=!0);let c=Math.abs(s);c>18?z.position.z-=s*e:c>5?(z.position.z-=s*a,T=!0):c>1?(z.position.z-=s*n,T=!0):c>.1?(z.position.z-=Math.sign(s)*r,T=!0):c>=0&&(z.position.z=t.position.z,T=!0),z.position.x==q.x&&z.position.y==q.y&&z.position.z==q.z?(X={isLocked:!1,target:null,name:0},console.log("Matched at spawn: "+z.position.x+"  "+q.x),H=!1,R=!1,T=!1,W=!1):H&&R&&T&&(0==W&&($(),setTimeout((function(){Q(X.name,!1),$(!1)}),1e3)),W=!0)}init(){let e;M=new d,document.body.addEventListener("mousemove",(function(){F&&S.play()}));const i=new x((()=>{console.log("Loaded: "+A),console.log("Loaded skybox"),e=new n(v,I),e.name="skybox",M.add(e);const t=document.querySelector("#loading-screen");null==t||t.classList.add("fade-out"),null==t||t.addEventListener("transitionend",et),F=!0})),o=new l(i);let v=new c(2100,2100,2100),I=[new a({map:o.load("/3D-Interactive-Portfolio/assets/right.19f9b8b4.png",nt)}),new a({map:o.load("/3D-Interactive-Portfolio/assets/left.06e25816.png",nt)}),new a({map:o.load("/3D-Interactive-Portfolio/assets/top.14e60ce3.png",nt)}),new a({map:o.load("/3D-Interactive-Portfolio/assets/bottom.8560bb79.png",nt)}),new a({map:o.load("/3D-Interactive-Portfolio/assets/front.e060fa56.png",nt)}),new a({map:o.load("/3D-Interactive-Portfolio/assets/back.1d924bd0.png",nt)})];I.forEach((t=>t.side=w));let E=new l(i).load("/3D-Interactive-Portfolio/assets/moon.b246064f.jpg",nt),G=new l(i).load("/3D-Interactive-Portfolio/assets/moonbumpmap.8e277ece.jpg",nt);z=new h(60,window.innerWidth/window.innerHeight,.1,5e3),z.position.z=q.z,z.position.y=q.y,window.addEventListener("mousedown",N,!1),window.addEventListener("keydown",tt,!1),window.addEventListener("resize",it,!1),D=new m({canvas:document.querySelector("#bg")}),D.setPixelRatio(window.devicePixelRatio),D.setSize(window.innerWidth,window.innerHeight),document.body.appendChild(D.domElement),P=new k("autosage",!1,115),P.addMesh(new p(10,3,16,100),new u({color:16737095,flatShading:!1,roughness:0,wireframe:!1})),M.add(P.entity);let H=new y(64,96,32,32),R=new u({color:"black",map:E,metalness:0,normalMap:G});R.side=w,_(H,5),U=new n(H,R),U.rotation.x+=90*t.DEG2RAD,P.setCloseUp(U);const T=new b(new r("white"),1);M.add(T),new g(200,50);for(let t=0;t<600;t++)this.addStar();let W=new k("black hole",!1,0);W.addMesh(new s(6,128,128),new u({color:"black",roughness:0,metalness:1,flatShading:!1})),M.add(W.entity),new f(i).load("/3D-Interactive-Portfolio/assets/twitter.f3599cc1.obj",(function(t){t.traverse((function(t){t instanceof n&&(t.material=new u({color:4177151,roughness:0,metalness:0,flatShading:!1}),t.rotation.y+=7.5)})),C=new k("twitter",!0,70,t),C.setCloseUp(L),M.add(C.entity),nt()}));let O=new y(64,96,32,32),V=new u({color:4177151,map:E,metalness:0,normalMap:G});V.side=w,_(O,5),L=new n(O,V),L.rotation.x+=90*t.DEG2RAD;let Y=new k("moon",!1,140);Y.addMesh(new s(6,64,64),new u({color:"white",map:E,normalMap:E})),M.add(Y.entity),j=M;const Z=()=>{requestAnimationFrame(Z),P.adjustOrbit(),Y.adjustOrbit(),C.adjustOrbit(),P.rotate(.01,.005,.001),Y.rotate(.001,.001,0),C.rotate(0,0,.002),X.isLocked&&(B?this.pinCameraToWorld(X.target):this.adjustCamera(X.target)),D.render(j,z)};Z()}}).init();
