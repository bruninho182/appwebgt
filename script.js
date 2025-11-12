const API_KEY = "ea2a517fd9e344f6873de3ae51b3aa07"; // RAWG.io
const titleInput = document.getElementById("gameTitle");
const statusSelect = document.getElementById("gameStatus");
const ratingInput = document.getElementById("gameRating");
const commentInput = document.getElementById("gameComment");
const tagsInput = document.getElementById("gameTags");
const platformsSelect = document.getElementById("gamePlatforms");
const addButton = document.getElementById("addGame");
const gameList = document.getElementById("gameList");
const filterSelect = document.getElementById("filterStatus");
const sortSelect = document.getElementById("sortBy");
const filterTagInput = document.getElementById("filterTag");
const filterPlatformSelect = document.getElementById("filterPlatform");
const themeToggle = document.getElementById("themeToggle");

let games = JSON.parse(localStorage.getItem("games")) || [];

// ---------- SALVAR ----------
function saveGames() {
  localStorage.setItem("games", JSON.stringify(games));
}

// ---------- IMAGENS ----------
async function fetchGameImage(title) {
  try {
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(title)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0].background_image : null;
  } catch {
    return null;
  }
}

// ---------- ORDENAÇÃO ----------
function sortGames(list) {
  const sortType = sortSelect.value;
  if (sortType === "name") return list.sort((a, b) => a.title.localeCompare(b.title));
  if (sortType === "rating") return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return list;
}

// ---------- RENDERIZAÇÃO ----------
function renderGames() {
  const filterStatus = filterSelect.value;
  const tagFilter = filterTagInput.value.trim().toLowerCase();
  const platformFilter = filterPlatformSelect ? filterPlatformSelect.value : "Todas";

  let filteredGames = games.filter(game => {
    const matchesStatus = filterStatus === "Todos" || game.status === filterStatus;
    const matchesTag = tagFilter === "" || (game.tags && game.tags.some(tag => tag.includes(tagFilter)));
    const matchesPlatform = platformFilter === "Todas" || (game.platforms && game.platforms.includes(platformFilter));
    return matchesStatus && matchesTag && matchesPlatform;
  });

  filteredGames = sortGames(filteredGames);
  gameList.innerHTML = "";

  if (filteredGames.length === 0) {
    gameList.innerHTML = "<p>Nenhum jogo encontrado.</p>";
    return;
  }

  filteredGames.forEach((game, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const tagsHTML = game.tags && game.tags.length
      ? `<div class="tags">${game.tags.map(t => `<span class='tag'>${t}</span>`).join("")}</div>`
      : "";

    const platformsHTML = game.platforms && game.platforms.length
      ? `<div class="platforms">${game.platforms.map(p => `<span class='platform'>${p}</span>`).join("")}</div>`
      : "";

    card.innerHTML = `
      ${game.image ? `<img src="${game.image}" alt="${game.title}" style="width:100%; border-radius:5px;">` : ""}
      <h3>${game.title}</h3>
      <p>Status: <strong>${game.status}</strong></p>
      <p>Nota: <strong>${game.rating ?? "—"}</strong></p>
      ${tagsHTML}
      ${platformsHTML}
      ${game.comment ? `<p class="comment">💬 ${game.comment}</p>` : ""}
      <button class="remove-btn" onclick="removeGame(${index})">Remover</button>
    `;

    gameList.appendChild(card);
  });
}

// ---------- ADICIONAR ----------
async function addGame() {
  const title = titleInput.value.trim();
  const status = statusSelect.value;
  const rating = ratingInput.value ? parseFloat(ratingInput.value) : null;
  const comment = commentInput.value.trim();
  const tags = tagsInput.value
    .split(",")
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.toLowerCase());

  const platforms = Array.from(platformsSelect.selectedOptions).map(opt => opt.value);

  if (title === "") {
    alert("Por favor, insira o nome do jogo.");
    return;
  }

  const image = await fetchGameImage(title);

  games.push({ title, status, rating, comment, tags, platforms, image });
  saveGames();

  titleInput.value = "";
  ratingInput.value = "";
  commentInput.value = "";
  tagsInput.value = "";
  Array.from(platformsSelect.options).forEach(o => (o.selected = false));

  renderGames();
}

// ---------- REMOVER ----------
function removeGame(index) {
  games.splice(index, 1);
  saveGames();
  renderGames();
}

// ---------- EVENTOS ----------
addButton.addEventListener("click", addGame);
filterSelect.addEventListener("change", renderGames);
sortSelect.addEventListener("change", renderGames);
filterTagInput.addEventListener("input", renderGames);
if (filterPlatformSelect) filterPlatformSelect.addEventListener("change", renderGames);

renderGames();

// ---------- MODO ESCURO / CLARO ----------
function setTheme(mode) {
  if (mode === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "🌞";
  } else {
    document.body.classList.remove("light-mode");
    themeToggle.textContent = "🌙";
  }
  localStorage.setItem("theme", mode);
}

function detectSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

const savedTheme = localStorage.getItem("theme") || detectSystemTheme();
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
  setTheme(newTheme);
});
