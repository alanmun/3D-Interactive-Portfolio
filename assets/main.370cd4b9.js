let e=["Created by Alan Munirji"],t=0;function n(){document.querySelector("#intro-screen-title").classList.add("fade-out"),setTimeout((()=>{const e=document.querySelector("#intro-screen");null==e||e.classList.add("fade-out"),null==e||e.addEventListener("transitionend",o),document.body.style.overflowY="auto"}),1e3)}function o(e){e.target.remove()}setTimeout((function o(){const r=document.querySelector("#intro-screen");var i=document.createElement("P");i.id="intro-screen-title";for(let e=0;e<t;e++)i.innerHTML+="<br/>";i.innerHTML=e[t++],r.appendChild(i),t<e.length?setTimeout(o,1e3):setTimeout(n,1e3)}),500);