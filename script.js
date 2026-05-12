let currentPage = 0;
const mainPages = ['mainPage1','mainPage2'];
let isTransitioning = false;
let musicStarted = false;
let navigationLocked = false; // Lock navigation on special pages

// LOADER
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hide');
        setTimeout(() => showIntro(), 500);
    }, 2800);
});

// CANVAS PARTICLES
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas(){canvas.width=innerWidth;canvas.height=innerHeight;}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor(){this.reset();}
    reset(){
        this.x=Math.random()*canvas.width;
        this.y=Math.random()*canvas.height;
        this.size=Math.random()*2+.5;
        this.speedX=(Math.random()-.5)*.3;
        this.speedY=(Math.random()-.5)*.3;
        this.opacity=Math.random()*.5+.1;
        this.pulse=Math.random()*Math.PI*2;
    }
    update(){
        this.x+=this.speedX;this.y+=this.speedY;
        this.pulse+=.02;
        this.opacity=.1+Math.sin(this.pulse)*.3;
        if(this.x<0||this.x>canvas.width||this.y<0||this.y>canvas.height)this.reset();
    }
    draw(){
        ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(196,77,255,${this.opacity})`;ctx.fill();
        ctx.beginPath();ctx.arc(this.x,this.y,this.size*2,0,Math.PI*2);
        ctx.fillStyle=`rgba(196,77,255,${this.opacity*.2})`;ctx.fill();
    }
}
for(let i=0;i<80;i++)particles.push(new Particle());
function animateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{p.update();p.draw();});
    requestAnimationFrame(animateParticles);
}
animateParticles();

// SHOW INTRO
function showIntro(){
    const p=document.getElementById('page0');
    p.classList.add('active');
    setTimeout(()=>{
        p.querySelector('.ask-text').classList.add('show');
        p.querySelector('.ask-buttons').classList.add('show');
    },300);
}

// HANDLE NO - Lock navigation, show 13 May, then auto-transition to video after 5s
function handleNo(){
    if(!musicStarted)startMusic();
    navigationLocked = true; // BLOCK all scroll/swipe/keyboard
    document.getElementById('page0').classList.remove('active');

    setTimeout(()=>{
        const pn=document.getElementById('pageNo');
        pn.classList.add('active');
        spawnRomanticEnv(pn.querySelector('.romantic-env'));

        // Animate 13 and May sliding in
        setTimeout(()=>{
            pn.querySelector('.reveal-13').classList.add('animate');
            pn.querySelector('.reveal-may').classList.add('animate');
        },500);

        // Show green screen video after animation
        setTimeout(()=>{
            document.getElementById('revealVideo').classList.add('show');
        },2800);

        // After 5 seconds, auto-transition to WhatsApp video page
        setTimeout(()=>{
            pn.classList.remove('active');
            setTimeout(()=>{
                showVideoPage();
            },500);
        },5000); // 5 seconds wait

    },400);
}

// SHOW VIDEO PAGE with cinematic entrance
function showVideoPage(){
    const vp = document.getElementById('pageVideo');
    vp.classList.add('active');

    // Cinematic entrance: video scales up beautifully
    setTimeout(()=>{
        document.getElementById('videoCinema').classList.add('show');
        
        // Pause background music if it's playing
        const bgMusic = document.getElementById('bgAudio');
        if(!bgMusic.paused) {
            bgMusic.pause();
            document.querySelector('.music-btn').classList.remove('playing');
        }

        // Auto-play the video
        const vid = document.getElementById('whatsappVideo');
        vid.play().catch(()=>{});
    },500);

    // Show continue button after 5 seconds
    setTimeout(()=>{
        document.getElementById('videoNext').classList.add('show');
        navigationLocked = false; // Unlock navigation
    },5000);
}

// HANDLE YES
function handleYes(){
    if(!musicStarted)startMusic();
    document.getElementById('page0').classList.remove('active');
    setTimeout(()=>{
        const py=document.getElementById('pageYes');
        py.classList.add('active');
        spawnHeartBurstAt(py);
        setTimeout(()=>{
            py.querySelector('.yes-emoji').classList.add('show');
            py.querySelector('.yes-ily').classList.add('show');
            py.querySelector('.yes-gif').classList.add('show');
            py.querySelector('.yes-sub').classList.add('show');
        },300);
        setTimeout(()=>{
            const nb=py.querySelector('.next-btn');
            if(nb) nb.classList.add('show');
        },1500);
    },400);
}

// GO TO MAIN PAGES
function goToMain(){
    // Stop whatsapp video if playing
    const vid = document.getElementById('whatsappVideo');
    vid.pause();
    vid.currentTime = 0;

    // Resume background music if it was started
    if(musicStarted) {
        const bgMusic = document.getElementById('bgAudio');
        bgMusic.play().catch(()=>{});
        document.querySelector('.music-btn').classList.add('playing');
    }

    document.getElementById('pageNo').classList.remove('active');
    document.getElementById('pageYes').classList.remove('active');
    document.getElementById('pageVideo').classList.remove('active');
    navigationLocked = false;
    currentPage=0;
    setTimeout(()=>showPage(0),400);
}

// PAGE MANAGEMENT
function showPage(n){
    if(isTransitioning||n<0||n>=mainPages.length||navigationLocked)return;
    isTransitioning=true;
    mainPages.forEach(id=>document.getElementById(id).classList.remove('active'));
    const page=document.getElementById(mainPages[n]);
    page.classList.add('active');
    currentPage=n;
    document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===n));
    document.querySelector('.page-dots').classList.add('show');
    setTimeout(()=>triggerPageAnim(n),300);
    setTimeout(()=>{isTransitioning=false;},900);
}

function triggerPageAnim(n){
    const page=document.getElementById(mainPages[n]);
    page.querySelectorAll('[data-anim]').forEach((el,i)=>{
        setTimeout(()=>el.classList.add('show'),i*300);
    });
    if(!musicStarted)startMusic();
    if(n===0)spawnHeartBurstAt(page);
    if(n===1)animateQuoteCards();
}

// MUSIC
function startMusic(){
    const a=document.getElementById('bgAudio');
    a.play().then(()=>{
        musicStarted=true;
        document.querySelector('.music-btn').classList.add('show','playing');
    }).catch(()=>{document.querySelector('.music-btn').classList.add('show');});
}
function toggleMusic(){
    const a=document.getElementById('bgAudio');
    const b=document.querySelector('.music-btn');
    if(a.paused){a.play();b.classList.add('playing');}
    else{a.pause();b.classList.remove('playing');}
}

// HEART BURST
function spawnHeartBurstAt(container){
    let zone=container.querySelector('.burst-zone')||container;
    const hearts=['❤️','💕','💖','💗','💝','✨'];
    for(let i=0;i<15;i++){
        const h=document.createElement('span');
        h.className='p3-heart-burst';
        h.textContent=hearts[Math.floor(Math.random()*hearts.length)];
        const bx=(Math.random()-.5)*400,by=(Math.random()-.5)*400,br=Math.random()*360;
        h.style.cssText=`left:50%;top:50%;font-size:${Math.random()*2+1.5}rem;animation:burstOut ${Math.random()*1.5+1}s ease forwards;--bx:${bx}px;--by:${by}px;--br:${br}deg;`;
        zone.appendChild(h);
    }
    if(!document.getElementById('burstStyle')){
        const s=document.createElement('style');s.id='burstStyle';
        s.textContent=`@keyframes burstOut{0%{transform:translate(-50%,-50%) scale(0) rotate(0);opacity:1}70%{opacity:1}100%{transform:translate(calc(-50% + var(--bx)),calc(-50% + var(--by))) scale(1) rotate(var(--br));opacity:0}}`;
        document.head.appendChild(s);
    }
}

// QUOTE CARDS
function animateQuoteCards(){
    document.querySelectorAll('.quote-card').forEach((c,i)=>{
        setTimeout(()=>c.classList.add('show'),i*400+300);
    });
}

// ROMANTIC ENV
function spawnRomanticEnv(container){
    const items=['💕','❤️','💖','🌹','✨','💗','🦋','🌸'];
    for(let i=0;i<20;i++){
        const h=document.createElement('span');
        h.className='env-heart';h.textContent=items[Math.floor(Math.random()*items.length)];
        h.style.cssText=`left:${Math.random()*100}%;font-size:${Math.random()*2+1}rem;animation-delay:${Math.random()*5}s;animation-duration:${Math.random()*4+4}s;`;
        container.appendChild(h);
    }
}

// NAV - all blocked when navigationLocked is true
function nextPage(){
    if(navigationLocked)return;
    if(currentPage<mainPages.length-1)showPage(currentPage+1);
}

document.addEventListener('keydown',e=>{
    if(navigationLocked)return;
    if(e.key==='ArrowRight'||e.key==='ArrowDown')nextPage();
    if((e.key==='ArrowLeft'||e.key==='ArrowUp')&&currentPage>0)showPage(currentPage-1);
});

let touchStartY=0;
document.addEventListener('touchstart',e=>{touchStartY=e.changedTouches[0].screenY;});
document.addEventListener('touchend',e=>{
    if(navigationLocked)return;
    const d=touchStartY-e.changedTouches[0].screenY;
    if(d>60&&currentPage<mainPages.length-1)showPage(currentPage+1);
    if(d<-60&&currentPage>0)showPage(currentPage-1);
});

let wheelT=false;
document.addEventListener('wheel',e=>{
    if(navigationLocked||wheelT)return;
    wheelT=true;
    if(e.deltaY>0&&currentPage<mainPages.length-1)showPage(currentPage+1);
    if(e.deltaY<0&&currentPage>0)showPage(currentPage-1);
    setTimeout(()=>{wheelT=false;},1200);
});

document.querySelectorAll('.dot').forEach((d,i)=>{d.addEventListener('click',()=>{
    if(!navigationLocked)showPage(i);
});});
