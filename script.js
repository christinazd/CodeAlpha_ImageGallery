const images = [
  { id: 0, src: "assets/flowers/download (2).jpg", category: "flowers" },
  { id: 1, src: "assets/flowers/download (3).jpg", category: "flowers" },
  { id: 2, src: "assets/flowers/download (4).jpg", category: "flowers" },
  { id: 3, src: "assets/flowers/Lavender Flower.jpg", category: "flowers" },
  { id: 4, src: "assets/flowers/tulips.jpg", category: "flowers" },
  { id: 5, src: "assets/mountain/download (2).jpg", category: "mountain" },
  { id: 6, src: "assets/mountain/download (3).jpg", category: "mountain" },
  { id: 7, src: "assets/mountain/download (6).jpg", category: "mountain" },
  { id: 8, src: "assets/mountain/download (7).jpg", category: "mountain" },
  { id: 9, src: "assets/mountain/download (8).jpg", category: "mountain" },
  { id: 10, src: "assets/sea/sea.jpg", category: "sea" },
  { id: 11, src: "assets/sea/download (2).jpg", category: "sea" },
  { id: 12, src: "assets/sea/download (3).jpg", category: "sea" },
  { id: 13, src: "assets/sea/download (4).jpg", category: "sea" },
  { id: 14, src: "assets/sea/download (5).jpg", category: "sea" },
  { id: 15, src: "assets/sky/aa.jpg", category: "sky" },
  { id: 16, src: "assets/sky/Beautiful.jpg", category: "sky" },
  { id: 17, src: "assets/sky/download (2).jpg", category: "sky" },
  { id: 18, src: "assets/sky/download (3).jpg", category: "sky" },
  { id: 19, src: "assets/sky/field.jpg", category: "sky" },
  {
    id: 20,
    src: "assets/stars/A photograph of a serene nightscape dominated by a still, glacial lake perfectly mirroring a vibrant.jpg",
    category: "stars",
  },
  { id: 21, src: "assets/stars/download (2).jpg", category: "stars" },
  { id: 22, src: "assets/stars/download (3).jpg", category: "stars" },
  { id: 23, src: "assets/stars/download (5).jpg", category: "stars" },
  {
    id: 24,
    src: "assets/stars/Milky way galaxy shining and desert and stars.jpg",
    category: "stars",
  },
];

const categoryLabels = {
  flowers: "Flowers",
  mountain: "Mountains",
  sea: "Sea",
  sky: "Sky",
  stars: "Stars",
};

const gallery = document.querySelector("#gallery");
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector(".lightbox__image");
const lightboxCaption = lightbox.querySelector(".lightbox__caption");
const prevButton = lightbox.querySelector("[data-action=\"prev\"]");
const nextButton = lightbox.querySelector("[data-action=\"next\"]");

const state = {
  filtered: images,
  currentIndex: 0,
  isOpen: false,
  lastActiveElement: null,
};

let filterToken = 0;
const FILTER_FADE_MS = 220;

const formatTitle = (path) => {
  const fileName = path.split("/").pop() || "";
  const decoded = decodeURIComponent(fileName);
  const base = decoded.replace(/\.[^.]+$/, "");
  return base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
};

const buildGallery = () => {
  const fragment = document.createDocumentFragment();

  images.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "gallery-item";
    listItem.dataset.category = item.category;
    listItem.dataset.id = String(item.id);

    const card = document.createElement("button");
    card.className = "gallery-card";
    card.type = "button";
    card.dataset.id = String(item.id);

    const title = formatTitle(item.src);
    const label = categoryLabels[item.category] || item.category;
    card.setAttribute("aria-label", `View ${title}`);

    const image = document.createElement("img");
    image.className = "gallery-image";
    image.src = encodeURI(item.src);
    image.alt = title;
    image.loading = "lazy";
    image.decoding = "async";

    const overlay = document.createElement("span");
    overlay.className = "gallery-overlay";

    const info = document.createElement("span");
    info.className = "gallery-info";

    const tagElement = document.createElement("span");
    tagElement.className = "gallery-tag";
    tagElement.textContent = label;

    info.append(tagElement);
    card.append(image, overlay, info);
    listItem.append(card);
    fragment.append(listItem);
  });

  gallery.append(fragment);
};

const updateNavState = () => {
  const disabled = state.filtered.length <= 1;
  prevButton.disabled = disabled;
  nextButton.disabled = disabled;
};

const updateLightboxImage = (animate = true) => {
  const currentItem = state.filtered[state.currentIndex];
  if (!currentItem) {
    return;
  }

  const title = formatTitle(currentItem.src);
  const nextSrc = encodeURI(currentItem.src);

  lightboxCaption.textContent = "";

  if (animate) {
    lightboxImage.classList.add("is-fading");
    lightboxImage.addEventListener(
      "load",
      () => {
        lightboxImage.classList.remove("is-fading");
      },
      { once: true }
    );
  } else {
    lightboxImage.classList.remove("is-fading");
  }

  lightboxImage.src = nextSrc;
  lightboxImage.alt = title;
};

const openLightboxById = (id) => {
  const index = state.filtered.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }

  state.currentIndex = index;
  state.isOpen = true;
  state.lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  lightbox.classList.add("is-open");
  lightbox.removeAttribute("aria-hidden");
  document.body.classList.add("is-locked");

  updateNavState();
  updateLightboxImage(false);
};

const closeLightbox = () => {
  if (!state.isOpen) {
    return;
  }

  state.isOpen = false;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");

  if (state.lastActiveElement) {
    state.lastActiveElement.focus();
  }
};

const showNext = () => {
  if (!state.filtered.length) {
    return;
  }
  state.currentIndex = (state.currentIndex + 1) % state.filtered.length;
  updateLightboxImage(true);
};

const showPrev = () => {
  if (!state.filtered.length) {
    return;
  }
  state.currentIndex = (state.currentIndex - 1 + state.filtered.length) % state.filtered.length;
  updateLightboxImage(true);
};

const applyFilter = (category) => {
  filterToken += 1;
  const token = filterToken;

  state.filtered =
    category === "all" ? images : images.filter((item) => item.category === category);

  const visibleIds = new Set(state.filtered.map((item) => item.id));
  const items = gallery.querySelectorAll(".gallery-item");

  items.forEach((item) => {
    const id = Number(item.dataset.id);
    const shouldShow = visibleIds.has(id);

    if (shouldShow) {
      if (item.hidden) {
        item.hidden = false;
      }
      requestAnimationFrame(() => {
        item.classList.remove("is-hidden");
      });
    } else {
      item.classList.add("is-hidden");
      window.setTimeout(() => {
        if (filterToken === token && item.classList.contains("is-hidden")) {
          item.hidden = true;
        }
      }, FILTER_FADE_MS);
    }
  });

  updateNavState();
};

buildGallery();
applyFilter("all");

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".gallery-card");
  if (!card) {
    return;
  }
  const id = Number(card.dataset.id);
  openLightboxById(id);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter || "all";
    filterButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    applyFilter(selected);
  });
});

lightbox.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) {
    return;
  }

  const action = actionTarget.dataset.action;
  if (action === "close") {
    closeLightbox();
  } else if (action === "next") {
    showNext();
  } else if (action === "prev") {
    showPrev();
  }
});

document.addEventListener("keydown", (event) => {
  if (!state.isOpen) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowRight") {
    showNext();
  } else if (event.key === "ArrowLeft") {
    showPrev();
  }
});
