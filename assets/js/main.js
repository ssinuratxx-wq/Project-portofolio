/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");

/*===== MENU SHOW =====*/
/*Validate if constant exist */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

/*===== MENU HIDDEN =====*/
/*Validate if constant exist */
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll(".nav__link");
const linkAction = () => {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
};
navLink.forEach((link) => link.addEventListener("click", linkAction));

/*=============== SHADOW HEADER ===============*/
const shadowHeader = () => {
  const header = document.getElementById("header");
  // When the scroll is greater than 50 viewport height, add the shadow-header class to the header tag
  this.scrollY >= 50
    ? header.classList.add("shadow-header")
    : header.classList.remove("shadow-header");
};
window.addEventListener("scroll", shadowHeader);

/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById("contact-form"),
  contactMessage = document.getElementById("contact-message");

const sendEmail = (e) => {
  e.preventDefault();

  contactMessage.textContent = "Mengirim pesan...";

  fetch(contactForm.action, {
    method: "POST",
    body: new FormData(contactForm),
    headers: { Accept: "application/json" },
  })
    .then((res) => {
      if (!res.ok) throw new Error("failed");
      contactMessage.textContent = "Message sent successfully ✅";

      setTimeout(() => {
        contactMessage.textContent = "";
      }, 5000);

      contactForm.reset();
    })
    .catch(() => {
      contactMessage.textContent = "Message not sent (service error) ❌";
    });
};

contactForm.addEventListener("submit", sendEmail);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
  const scrollUp = document.getElementById("scroll-up");
  // When the scroll is higher than 350 viewport height, add the show-scroll class to the tag with the scrollup class
  this.scrollY >= 350
    ? scrollUp.classList.add("show-scroll")
    : scrollUp.classList.remove("show-scroll");
};

window.addEventListener("scroll", scrollUp);

/*=============== SCROLL SECTION ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollDown = window.scrollY;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id"),
      sectionClass = document.querySelector(
        ".nav__menu a[href*=" + sectionId + "]"
      );

    if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
      sectionClass.classList.add("active-link");
    } else {
      sectionClass.classList.remove("active-link");
    }
  });
};

window.addEventListener("scroll", scrollActive);

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "ri-sun-line";

// Previously selected topic (if user)
const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton.classList.contains(iconTheme) ? "ri-moon-line" : "ri-sun-line";

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  themeButton.classList[selectedIcon === "ri-moon-line" ? "add" : "remove"](
    iconTheme
  );
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  // Add or remove the dark / icon theme
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);
  // We save the theme and the current icon that the user chose
  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});
/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
  origin: "top",
  distance: "60px",
  duration: 2500,
  delay: 400,
  // reset: true, //Animations repeat
});

sr.reveal(`.home__perfil, .about__image, .contact__mail`, { origin: "right" });
sr.reveal(
  `.home__name, .home__info, 
  .about__container .section__title-1, .about__info, 
  .contact__social, .contact__data`,
  { origin: "left" }
);
sr.reveal(`.services__card, .projects__card`, { interval: 100 });

/*=============== MUSIC SEARCH ===============*/
const searchPanel = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const searchClose = document.getElementById("search-close");
const musicInput = document.getElementById("music-input");
const musicResults = document.getElementById("music-results");
const musicAudio = document.getElementById("music-audio");

const AUDIUS_API = "https://api.audius.co/v1";
const AUDIUS_APP = "soparplayer";

const openSearch = () => {
  searchPanel.classList.add("show");
  musicInput.focus();
};

const closeSearch = () => {
  searchPanel.classList.remove("show");
};

searchButton.addEventListener("click", openSearch);
searchClose.addEventListener("click", closeSearch);
searchPanel.addEventListener("click", (e) => {
  if (e.target === searchPanel) closeSearch();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSearch();
});

const musicCover = (track) => {
  const art = track.artwork || {};
  return art["150x150"] || art["480x480"] || "";
};

const musicStream = (track) =>
  `${AUDIUS_API}/tracks/${encodeURIComponent(track.id)}/stream?app_name=${AUDIUS_APP}`;

const musicEscape = (str) =>
  String(str == null ? "" : str).replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });

const renderMusic = (tracks) => {
  if (!tracks.length) {
    musicResults.innerHTML = '<p class="search__empty">Lagu tidak ditemukan.</p>';
    return;
  }

  musicResults.innerHTML = tracks
    .map((track, i) => {
      const artist = (track.user && (track.user.name || track.user.handle)) || "Unknown";
      return `<div class="search__item" data-track="${i}">
        <img src="${musicEscape(musicCover(track))}" alt="Sampul ${musicEscape(track.title)}" loading="lazy">
        <div class="search__item-info">
          <span class="search__item-title">${musicEscape(track.title)}</span>
          <span class="search__item-artist">${musicEscape(artist)}</span>
        </div>
        <i class="ri-play-circle-line search__item-btn"></i>
      </div>`;
    })
    .join("");

  musicResults.querySelectorAll(".search__item").forEach((el) => {
    el.addEventListener("click", () => {
      const track = tracks[Number(el.dataset.track)];
      const isSame = el.classList.contains("active");

      musicResults.querySelectorAll(".search__item").forEach((item) => {
        item.classList.remove("active");
        const btn = item.querySelector(".search__item-btn");
        if (btn) btn.className = "ri-play-circle-line search__item-btn";
      });

      if (isSame && !musicAudio.paused) {
        musicAudio.pause();
        return;
      }

      el.classList.add("active");
      const btn = el.querySelector(".search__item-btn");
      if (btn) btn.className = "ri-pause-circle-line search__item-btn";

      if (musicAudio.dataset.trackId !== String(track.id)) {
        musicAudio.dataset.trackId = String(track.id);
        musicAudio.src = musicStream(track);
      }
      musicAudio.play().catch(() => {});
    });
  });
};

const resetMusicButtons = () => {
  musicResults.querySelectorAll(".search__item").forEach((item) => {
    item.classList.remove("active");
    const btn = item.querySelector(".search__item-btn");
    if (btn) btn.className = "ri-play-circle-line search__item-btn";
  });
};

musicAudio.addEventListener("pause", resetMusicButtons);
musicAudio.addEventListener("ended", resetMusicButtons);

const searchMusic = async (query) => {
  musicResults.innerHTML = '<p class="search__hint">Mencari...</p>';
  try {
    const res = await fetch(
      `${AUDIUS_API}/tracks/search?query=${encodeURIComponent(query)}&limit=20&app_name=${AUDIUS_APP}`
    );
    if (!res.ok) throw new Error("fail");
    const json = await res.json();
    renderMusic(json.data || []);
  } catch (e) {
    musicResults.innerHTML = '<p class="search__empty">Gagal memuat. Periksa koneksi internet.</p>';
  }
};

let musicTimer;
musicInput.addEventListener("input", () => {
  clearTimeout(musicTimer);
  const query = musicInput.value.trim();
  musicTimer = setTimeout(() => {
    if (query.length >= 2) searchMusic(query);
    else musicResults.innerHTML = '<p class="search__hint">Ketik minimal 2 huruf untuk mulai mencari.</p>';
  }, 400);
});
