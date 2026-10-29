var tap = document.getElementById("tap");
var menu = document.getElementById("menu");

/* ===== BACKGROUND FADE-IN (prevents transparency flash on first load) =====
   Single real <video>, fixed as the page background — the standard
   full-page-video technique, nothing fancier needed. */

var bgLayer = document.getElementById("bgLayer");
var bgVideo = bgLayer.querySelector("video");

bgVideo.addEventListener("loadeddata", function(){
    bgLayer.classList.add("loaded");
});

if(bgVideo.readyState >= 2){
    bgLayer.classList.add("loaded");
}

/* ===== CURSOR TRAIL EFFECT (stars, speed-based) ===== */

var STAR_SVG = '<svg viewBox="0 0 24 24"><path d="M12 0l2.6 8.4L23 11l-8.4 2.6L12 22l-2.6-8.4L1 11l8.4-2.6z"/></svg>';

var lastTrailTime = 0;
var lastX = null;
var lastY = null;

function spawnTrail(x, y){

    var now = Date.now();

    /* Throttle scales with how fast the pointer is moving: fast = more stars */

    var dist = (lastX === null) ? 0 : Math.hypot(x - lastX, y - lastY);
    var speed = Math.min(dist, 80);
    var throttle = 25 - (speed / 80) * 15; /* ~10ms when fast, ~25ms when slow */

    lastX = x;
    lastY = y;

    if(now - lastTrailTime < throttle) return;

    lastTrailTime = now;

    var star = document.createElement("div");
    star.className = "cursor-dot";
    star.innerHTML = STAR_SVG;

    var size = 8 + Math.min(speed / 6, 10);

    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = (x - size / 2) + "px";
    star.style.top = (y - size / 2) + "px";

    var hueShift = Math.random() > 0.5 ? "#b487ff" : "#7ee8ff";
    star.style.color = hueShift;

    document.body.appendChild(star);

    setTimeout(function(){
        star.remove();
    }, 550);

}

document.addEventListener("mousemove", function(e){
    spawnTrail(e.clientX, e.clientY);
});

document.addEventListener("touchmove", function(e){

    var t = e.touches[0];

    if(t) spawnTrail(t.clientX, t.clientY);

}, {passive:true});


/* ===== LIVE CLOCK (analog + digital) ===== */

var liveTimeEl = document.getElementById("liveTime");
var liveDateEl = document.getElementById("liveDate");
var liveTzEl = document.getElementById("liveTz");

var liveTimeEl2 = document.getElementById("liveTime2");
var liveDateEl2 = document.getElementById("liveDate2");
var liveTzEl2 = document.getElementById("liveTz2");

var hourHand = document.getElementById("hourHand");
var minHand = document.getElementById("minHand");
var secHand = document.getElementById("secHand");

var hourHand2 = document.getElementById("hourHand2");
var minHand2 = document.getElementById("minHand2");
var secHand2 = document.getElementById("secHand2");

var WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function updateClock(){

    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();

    /* Digital time */

    var timeStr =
        String(h).padStart(2, "0") + ":" +
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");

    /* Date */

    var dateStr =
        WEEKDAYS[now.getDay()] + ", " + MONTHS[now.getMonth()] + " " + now.getDate();

    /* Timezone offset */

    var offsetMin = -now.getTimezoneOffset();
    var sign = offsetMin >= 0 ? "+" : "-";
    var offsetH = Math.abs(offsetMin / 60);
    var tzStr = "GMT" + sign + offsetH;

    if(liveTimeEl) liveTimeEl.textContent = timeStr;
    if(liveDateEl) liveDateEl.textContent = dateStr;
    if(liveTzEl) liveTzEl.textContent = tzStr;

    if(liveTimeEl2) liveTimeEl2.textContent = timeStr;
    if(liveDateEl2) liveDateEl2.textContent = dateStr;
    if(liveTzEl2) liveTzEl2.textContent = tzStr;

    /* Analog hands */

    var secDeg = s * 6;
    var minDeg = m * 6 + s * 0.1;
    var hourDeg = (h % 12) * 30 + m * 0.5;

    if(secHand) secHand.setAttribute("transform", "rotate(" + secDeg + " 50 50)");
    if(minHand) minHand.setAttribute("transform", "rotate(" + minDeg + " 50 50)");
    if(hourHand) hourHand.setAttribute("transform", "rotate(" + hourDeg + " 50 50)");

    if(secHand2) secHand2.setAttribute("transform", "rotate(" + secDeg + " 50 50)");
    if(minHand2) minHand2.setAttribute("transform", "rotate(" + minDeg + " 50 50)");
    if(hourHand2) hourHand2.setAttribute("transform", "rotate(" + hourDeg + " 50 50)");

}

updateClock();
setInterval(updateClock, 1000);


/* ===== DISCORD LIVE PRESENCE (Lanyard API) ===== */

var DISCORD_USER_ID = "1318018119809372201";

var discordAvatarEl = document.getElementById("discordAvatar");
var discordStatusDotEl = document.getElementById("discordStatusDot");
var discordUsernameEl = document.getElementById("discordUsername");
var discordActivityEl = document.getElementById("discordActivity");
var discordBadgesEl = document.getElementById("discordBadges");

/* Real Discord public profile badges, decoded from the account's
   public_flags bitfield (the same field Discord itself uses).
   Reference: https://discord.com/developers/docs/resources/user#user-object-user-flags */
var DISCORD_BADGE_DEFS = [
    { bit: 1 << 0,  name: "Discord Staff",
      svg: '<path d="M12 2 2 7l10 5 10-5-10-5zm0 8L2 15l10 5 10-5-10-5z"/>' },
    { bit: 1 << 1,  name: "Partnered Server Owner",
      svg: '<path d="M12 2l3 5 5 1-4 4 1 6-5-3-5 3 1-6-4-4 5-1z"/>' },
    { bit: 1 << 2,  name: "HypeSquad Events",
      svg: '<path d="M12 2 3 7l9 13 9-13z"/>' },
    { bit: 1 << 3,  name: "Bug Hunter",
      svg: '<path d="M12 2a4 4 0 0 1 4 4v1h2v2h-2.1a6 6 0 0 1-.7 2.2L17 13v2h-2.2a6 6 0 0 1-1.3 1.4L14 20h-4l.5-3.6A6 6 0 0 1 9.2 15H7v-2l1.8-1.8A6 6 0 0 1 8.1 9H6V7h2V6a4 4 0 0 1 4-4z"/>' },
    { bit: 1 << 6,  name: "HypeSquad Bravery",
      svg: '<path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/>' },
    { bit: 1 << 7,  name: "HypeSquad Brilliance",
      svg: '<path d="M12 2l2.4 5.5L20 9l-4.6 3.8L16.8 19 12 15.8 7.2 19l1.4-6.2L4 9l5.6-1.5z"/>' },
    { bit: 1 << 8,  name: "HypeSquad Balance",
      svg: '<path d="M12 2v20M4 7l8-5 8 5M4 7l8 5 8-5M4 7v0a4 4 0 0 0 8 0M20 7v0a4 4 0 0 1-8 0" fill="none" stroke="currentColor" stroke-width="1.6"/>' },
    { bit: 1 << 9,  name: "Early Supporter",
      svg: '<path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z"/>' },
    { bit: 1 << 14, name: "Bug Hunter Gold",
      svg: '<path d="M12 2a4 4 0 0 1 4 4v1h2v2h-2.1a6 6 0 0 1-.7 2.2L17 13v2h-2.2a6 6 0 0 1-1.3 1.4L14 20h-4l.5-3.6A6 6 0 0 1 9.2 15H7v-2l1.8-1.8A6 6 0 0 1 8.1 9H6V7h2V6a4 4 0 0 1 4-4z" fill="#ffd54a"/>' },
    { bit: 1 << 17, name: "Early Verified Bot Developer",
      svg: '<path d="M9 6 3 12l6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' },
    { bit: 1 << 18, name: "Discord Certified Moderator",
      svg: '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' },
    { bit: 1 << 22, name: "Active Developer",
      svg: '<path d="M8 9 4 12l4 3M16 9l4 3-4 3M13 6l-2 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' }
];

function renderDiscordBadges(user){

    if(!discordBadgesEl) return;

    discordBadgesEl.innerHTML = "";

    var flags = user.public_flags || 0;

    DISCORD_BADGE_DEFS.forEach(function(def){

        if((flags & def.bit) === 0) return;

        var span = document.createElement("span");
        span.className = "discord-badge";
        span.setAttribute("data-name", def.name);
        span.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor">' + def.svg + '</svg>';

        discordBadgesEl.appendChild(span);

    });

}

function renderDiscordPresence(data){

    if(!data || !data.discord_user) return;

    var user = data.discord_user;

    var avatarUrl = user.avatar
        ? "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png?size=128"
        : "https://cdn.discordapp.com/embed/avatars/0.png";

    discordAvatarEl.src = avatarUrl;

    discordUsernameEl.textContent = user.global_name || user.username || "Unknown";

    renderDiscordBadges(user);

    discordStatusDotEl.className = "discord-status-dot " + (data.discord_status || "offline");

    /* Figure out what to show underneath the name */

    var activityText = "";

    if(data.listening_to_spotify && data.spotify){

        activityText = "Listening to " + data.spotify.song + " — " + data.spotify.artist;

    } else if(data.activities && data.activities.length){

        var act = data.activities.find(function(a){ return a.type !== 4; }); /* skip custom status type 4 for the main line */

        if(act){

            if(act.type === 0) activityText = "Playing " + act.name;
            else if(act.type === 2) activityText = "Listening to " + act.name;
            else if(act.type === 3) activityText = "Watching " + act.name;
            else if(act.type === 5) activityText = "Competing in " + act.name;
            else activityText = act.name;

        }

    }

    if(!activityText){

        var statusLabels = {
            online: "Online",
            idle: "Idle",
            dnd: "Do Not Disturb",
            offline: "Offline"
        };

        activityText = statusLabels[data.discord_status] || "";

    }

    discordActivityEl.textContent = activityText;

}

function connectLanyard(){

    var ws = new WebSocket("wss://api.lanyard.rest/socket");
    var heartbeatInterval;

    ws.onmessage = function(event){

        var msg = JSON.parse(event.data);

        if(msg.op === 1){

            /* Hello — start heartbeating and subscribe to our user */

            heartbeatInterval = setInterval(function(){
                ws.send(JSON.stringify({ op: 3 }));
            }, msg.d.heartbeat_interval);

            ws.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_ids: [DISCORD_USER_ID] }
            }));

        } else if(msg.op === 0){

            if(msg.t === "INIT_STATE"){

                var presence = msg.d[DISCORD_USER_ID];
                if(presence) renderDiscordPresence(presence);

            } else if(msg.t === "PRESENCE_UPDATE"){

                if(msg.d.user_id === DISCORD_USER_ID || (msg.d.discord_user && msg.d.discord_user.id === DISCORD_USER_ID)){
                    renderDiscordPresence(msg.d);
                }

            }

        }

    };

    ws.onclose = function(){

        clearInterval(heartbeatInterval);

        /* Reconnect after a short delay if the socket drops */

        setTimeout(connectLanyard, 5000);

    };

    ws.onerror = function(){
        ws.close();
    };

}

if(discordAvatarEl){
    connectLanyard();
}


/* ===== SPARKLES (twinkling glitter in the background) ===== */

for(var i = 0; i < 25; i++){

    var sp = document.createElement("div");
    sp.className = "sparkle";

    var size = Math.random() * 3 + 1.5;

    sp.style.width = size + "px";
    sp.style.height = size + "px";
    sp.style.top = Math.random() * 100 + "vh";
    sp.style.left = Math.random() * 100 + "vw";
    sp.style.animationDuration = (2 + Math.random() * 3) + "s";
    sp.style.animationDelay = (Math.random() * 4) + "s";

    document.body.appendChild(sp);

}


/* ===== FACE GLITCH ANIMATION (idle face that randomly scrambles, then settles) ===== */

var eyeL = document.getElementById("eyeL");
var eyeR = document.getElementById("eyeR");
var mouth = document.getElementById("mouth");

var EYE_SYMBOLS = ["•","+","=","*","†","-","$","×","✦","0","^","o","O","#","%","~","¤","◆","■","▲"];
var MOUTH_SYMBOLS = ["_","=","0","•","-","$",".","~","o","O","w","3","∆","¬"];

var REST_EYE = "•";
var REST_MOUTH = "_";

function randomFrom(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

function swapSymbol(el, symbol){

    /* Fade out, change the character, fade back in — avoids jarring jumps */

    el.style.opacity = 0;
    el.style.transform = "translateY(-3px)";

    setTimeout(function(){

        el.textContent = symbol;
        el.style.opacity = 1;
        el.style.transform = "translateY(0)";

    }, 90);

}

function faceGlitchBurst(){

    if(!eyeL || !eyeR || !mouth) return;

    var eyeSymbol = randomFrom(EYE_SYMBOLS);

    swapSymbol(eyeL, eyeSymbol);
    swapSymbol(eyeR, eyeSymbol);
    swapSymbol(mouth, randomFrom(MOUTH_SYMBOLS));

}

function faceLoop(){

    faceGlitchBurst();
    setTimeout(faceLoop, 260);

}

if(eyeL && eyeR && mouth){

    eyeL.textContent = REST_EYE;
    eyeR.textContent = REST_EYE;
    mouth.textContent = REST_MOUTH;

    setTimeout(faceLoop, 260);

}


/* ===== MUSIC ELEMENTS ===== */

var bgMusic = document.getElementById("bgMusic");
var musicBtn = document.getElementById("musicBtn");
var musicPanel = document.getElementById("musicPanel");
var eqBars = document.getElementById("eqBars");
var progressFill = document.getElementById("progressFill");
var volumeSlider = document.getElementById("volumeSlider");
var playPauseBtn = document.getElementById("playPauseBtn");
var ppIcon = document.getElementById("ppIcon");

var ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
var ICON_PAUSE = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';

bgMusic.volume = 0;

function fadeInVolume(){

    var target = parseFloat(volumeSlider.value);
    var current = 0;

    var fade = setInterval(function(){

        current += target / 10;

        if(current >= target){
            current = target;
            clearInterval(fade);
        }

        bgMusic.volume = current;

    }, 30);

}

function startMusic(){

    if(!bgMusic.paused) return;

    bgMusic.volume = parseFloat(volumeSlider.value);

    var playPromise = bgMusic.play();

    if(playPromise !== undefined){

        playPromise.catch(function(){

            /* Browser blocked autoplay, retry on first interaction */

            document.addEventListener("click", function retry(){

                bgMusic.play();
                document.removeEventListener("click", retry);

            }, {once:true});

        });

    }

}

function setupScrollFade(){

    var fadeEls = document.querySelectorAll(".scroll-fade");
    if(!fadeEls.length) return;

    var observer = new IntersectionObserver(function(entries){

        entries.forEach(function(entry){

            if(entry.isIntersecting){
                entry.target.classList.add("in-view");
            } else {
                entry.target.classList.remove("in-view");
            }

        });

    }, { threshold:0.25 });

    fadeEls.forEach(function(el){
        observer.observe(el);
    });

}

function enterSite(){

    tap.classList.add("hide");
    document.body.classList.add("entered");

    setTimeout(function(){

        menu.classList.add("show");

        var scrollDots = document.getElementById("scrollDots");
        if(scrollDots) scrollDots.classList.add("show");

        setupScrollFade();

    },400);

    /* Trigger autoplay within the same click/tap event */

    startMusic();

}


/* ===== SCROLL DOTS: highlight the dot matching whichever section
   is currently in view ===== */

(function(){

    var dots = document.querySelectorAll(".scroll-dot");
    if(!dots.length) return;

    var sections = Array.prototype.map.call(dots, function(dot){
        return document.getElementById(dot.getAttribute("data-target"));
    });

    function updateActiveDot(){

        var mid = window.scrollY + window.innerHeight / 2;
        var activeIndex = 0;

        sections.forEach(function(section, i){

            if(!section) return;

            var top = section.offsetTop;

            if(mid >= top) activeIndex = i;

        });

        dots.forEach(function(dot, i){
            dot.classList.toggle("active", i === activeIndex);
        });

    }

    dots.forEach(function(dot, i){

        dot.addEventListener("click", function(){

            var target = sections[i];
            if(!target) return;

            if(target.id === "bgLayer"){
                window.scrollTo({top:0, behavior:"smooth"});
            } else {
                target.scrollIntoView({behavior:"smooth"});
            }

        });

    });

    window.addEventListener("scroll", updateActiveDot, {passive:true});
    window.addEventListener("resize", updateActiveDot);

    updateActiveDot();

})();


/* For mobile */
/* Using touchend (not touchstart) — most mobile browsers only treat
   touchend/click as a valid gesture for unlocking audio autoplay,
   so playing on touchstart caused the first attempt to be blocked. */

tap.addEventListener("touchend", function(e){

    e.preventDefault();

    enterSite();

}, {passive:false});


/* For click */

tap.addEventListener("click", enterSite);


/* ===== FLOATING MUSIC BUTTON: only opens/closes the panel, doesn't stop the sound ===== */

musicBtn.addEventListener("click", function(e){

    e.stopPropagation();

    musicPanel.classList.toggle("show");

});


/* ===== Independent Play/Pause button inside the panel ===== */

playPauseBtn.addEventListener("click", function(e){

    e.stopPropagation();

    if(bgMusic.paused){
        startMusic();
    } else {
        bgMusic.pause();
    }

});


/* ===== Close the panel by clicking anywhere outside it ===== */

document.addEventListener("click", function(e){

    if(!musicPanel.classList.contains("show")) return;

    if(musicPanel.contains(e.target) || musicBtn.contains(e.target)) return;

    musicPanel.classList.remove("show");

});


/* Prevent the panel from closing when clicking inside it (slider, etc.) */

musicPanel.addEventListener("click", function(e){
    e.stopPropagation();
});


/* ===== SYNC UI DENGAN STATUS AUDIO ===== */

bgMusic.addEventListener("play", function(){
    eqBars.classList.remove("paused");
    ppIcon.innerHTML = ICON_PAUSE;
});

bgMusic.addEventListener("pause", function(){
    eqBars.classList.add("paused");
    ppIcon.innerHTML = ICON_PLAY;
});

bgMusic.addEventListener("timeupdate", function(){

    if(bgMusic.duration){

        var percent = (bgMusic.currentTime / bgMusic.duration) * 100;
        progressFill.style.width = percent + "%";

    }

});


/* ===== VOLUME SLIDER (never stops the sound) ===== */

volumeSlider.addEventListener("input", function(){
    bgMusic.volume = volumeSlider.value;
});
