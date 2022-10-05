let introTexts = ["Created by Alan Munirji"]
let introCounter = 0;
let introSplashTime = 1000; //How long to keep showing when last intro text gets on screen
let hasVisited = localStorage.getItem('hasVisited');

//Only show the splash screen the first ever time the page is loaded. Use localStorage, which persists cookies across sessions instead of sessionStorage
if(!hasVisited){
    setTimeout(swapIntroText, 500);
    localStorage.setItem('hasVisited', true);
}
else{
    const introScreen = document.querySelector('#intro-screen');
    introScreen.remove();
}

function swapIntroText(){
    const introScreen = document.querySelector('#intro-screen');

    var para = document.createElement("P");
    para.id = "intro-screen-title"
    for(let i = 0; i < introCounter; i++) para.innerHTML += "<br/>";
    para.innerHTML = introTexts[introCounter++];
    introScreen.appendChild(para);
    //TODO: Above works but it needs to fade in text, which it doesn't at all, and needs to add any extra text in introTexts array not on the same position
    //Right now it looks fine but it will look bad if another bit of text is added
    
    if(introCounter < introTexts.length) setTimeout(swapIntroText, 1000);
    else setTimeout(startIntroFadeOut, introSplashTime);
}

function startIntroFadeOut(){
    const introTitle = document.querySelector('#intro-screen-title');
    introTitle.classList.add("fade-out");
    setTimeout(() => {
        //Remove intro splash screen
        const introScreen = document.querySelector('#intro-screen');
        introScreen?.classList.add("fade-out");
        introScreen?.addEventListener('transitionend', onTransitionEnd)

        //Allow scrolling
        document.body.style.overflowY = "auto";
    }, 1000);
}

function onTransitionEnd(event) {
    event.target.remove();	
}

//window.focus();
//window.scrollTo(200, 500); Why doesn't this work? focus before doesn't work, I stopped body from having overflow-y:hidden which some people said could cause it
