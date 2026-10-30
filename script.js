
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

let tracks = [];
let currentTrack = null;
let currentCategory = "All";
let likedTracks = new Set();

function showPage(pageId) {
  pages.forEach(page => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.getElementById("profileBtn").addEventListener("click", () => {
  showPage("profilePage");
});

document.getElementById("searchBtn").addEventListener("click", () => {
  showPage("searchPage");
  document.getElementById("searchInput").focus();
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(item => {
      item.classList.remove("selected");
    });

    chip.classList.add("selected");
    currentCategory = chip.dataset.category;
    renderTracks();
  });
});

function renderTracks() {
  const list = document.getElementById("musicList");
  const library = document.getElementById("libraryList");

  const filtered = currentCategory === "All"
    ? tracks
    : tracks.filter(track => track.category === currentCategory);

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty">এখনো কোনো গান আপলোড করা হয়নি।</p>';
  } else {
    list.innerHTML = "";
    filtered.forEach(track => list.appendChild(createTrackCard(track)));
  }

  if (tracks.length === 0) {
    library.innerHTML = '<p class="empty">তোমার লাইব্রেরি এখন খালি।</p>';
  } else {
    library.innerHTML = "";
    tracks.forEach(track => library.appendChild(createTrackCard(track)));
  }
}

function createTrackCard(track) {
  const card = document.createElement("div");
  card.className = "music-card";

  const cover = document.createElement("div");
  cover.className = "music-cover";
  cover.textContent = track.category === "Video" ? "▶" : "♫";

  const info = document.createElement("div");
  info.className = "music-info";

  const title = document.createElement("h3");
  title.textContent = track.title;

  const artist = document.createElement("p");
  artist.textContent = track.artist + " • " + track.category;

  info.append(title, artist);

  const play = document.createElement("button");
  play.className = "play-btn";
  play.textContent = "▶";
  play.setAttribute("aria-label", "Play " + track.title);
  play.addEventListener("click", () => openPlayer(track.id));

  card.append(cover, info, play);
  return card;
}

document.getElementById("uploadForm").addEventListener("submit", event => {
  event.preventDefault();

  const file = document.getElementById("mediaFile").files[0];
  const message = document.getElementById("uploadMessage");

  if (!file) {
    message.textContent = "একটি অডিও বা ভিডিও ফাইল বেছে নাও।";
    return;
  }

  const allowed = file.type.startsWith("audio/") ||
    file.type === "video/mp4" ||
    file.type === "video/webm";

  if (!allowed) {
    message.textContent = "শুধু অডিও, MP4 বা WebM ভিডিও আপলোড করা যাবে।";
    return;
  }

  const track = {
    id: Date.now(),
    title: document.getElementById("trackTitle").value.trim(),
    artist: document.getElementById("artistName").value.trim(),
    category: document.getElementById("trackCategory").value,
    file: file,
    url: URL.createObjectURL(file)
  };

  tracks.unshift(track);
  renderTracks();

  event.target.reset();
  message.textContent = "এই ডিভাইসের প্রিভিউতে মিডিয়া যোগ হয়েছে।";

  showPage("homePage");
});

function openPlayer(id) {
  currentTrack = tracks.find(track => track.id === id);
  if (!currentTrack) return;

  document.getElementById("playerTitle").textContent = currentTrack.title;
  document.getElementById("playerArtist").textContent = currentTrack.artist;

  const player = document.getElementById("mediaPlayer");
  player.innerHTML = "";

  const media = document.createElement(
    currentTrack.category === "Video" ? "video" : "audio"
  );

  media.src = currentTrack.url;
  media.controls = true;
  media.autoplay = true;
  media.playsInline = true;

  player.appendChild(media);

  document.getElementById("likeBtn").textContent =
    likedTracks.has(id) ? "♥ Liked" : "♡ Like";

  const download = document.getElementById("downloadBtn");
  download.href = currentTrack.url;
  download.download = currentTrack.file.name;

  showPage("playerPage");
}

document.getElementById("backBtn").addEventListener("click", () => {
  showPage("homePage");
});

document.getElementById("likeBtn").addEventListener("click", () => {
  if (!currentTrack) return;

  if (likedTracks.has(currentTrack.id)) {
    likedTracks.delete(currentTrack.id);
  } else {
    likedTracks.add(currentTrack.id);
  }

  document.getElementById("likeBtn").textContent =
    likedTracks.has(currentTrack.id) ? "♥ Liked" : "♡ Like";
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  if (!currentTrack) return;

  const shareText = currentTrack.title + " - " + currentTrack.artist +
    " | FR MUSIC";

  if (navigator.share) {
    try {
      await navigator.share({ title: currentTrack.title, text: shareText });
    } catch (error) {
      // ব্যবহারকারী শেয়ার বন্ধ করলে কোনো সমস্যা নেই।
    }
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("গানের তথ্য কপি হয়েছে।");
    } catch (error) {
      alert("শেয়ার করা যায়নি।");
    }
  } else {
    alert(shareText);
  }
});

document.getElementById("searchInput").addEventListener("input", event => {
  const query = event.target.value.toLowerCase().trim();
  const results = document.getElementById("searchResults");
  results.innerHTML = "";

  const found = tracks.filter(track =>
    track.title.toLowerCase().includes(query) ||
    track.artist.toLowerCase().includes(query)
  );

  if (found.length === 0) {
    results.innerHTML = '<p class="empty">কোনো গান পাওয়া যায়নি।</p>';
    return;
  }

  found.forEach(track => results.appendChild(createTrackCard(track)));
});

renderTracks();
