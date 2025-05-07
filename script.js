const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const loading = document.getElementById('loading');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageNumber = document.getElementById('pageNumber');

let currentPage = 1;
const perPage = 20;
let pokemonList = [];
let allTypes = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchAllPokemon();
  setupEventListeners();
});

async function fetchAllPokemon() {
  showLoading(true);
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');

    const data = await res.json();
    pokemonList = data.results.map((p, i) => ({
      name: p.name,
      url: p.url,
      id: i + 1
    }));
    await fetchTypes();
    renderPage();
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
  } finally {
    showLoading(false);
  }
}

async function fetchTypes() {
  const res = await fetch('https://pokeapi.co/api/v2/type');
  const data = await res.json();
  allTypes = data.results;
  allTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type.name;
    option.textContent = type.name;
    typeFilter.appendChild(option);
  });
}

function setupEventListeners() {
  searchInput.addEventListener('input', renderPage);
  typeFilter.addEventListener('change', renderPage);
  prevBtn.addEventListener('click', () => changePage(-1));
  nextBtn.addEventListener('click', () => changePage(1));
  document.querySelector('.close-button').addEventListener('click', closeModal);
}

function getFilteredPokemon() {
  const query = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  return pokemonList.filter(pokemon => {
    const matchesName = pokemon.name.includes(query) || String(pokemon.id).includes(query);
    const matchesType = !selectedType || pokemon.types?.includes(selectedType);
    return matchesName && matchesType;
  });
}

async function renderPage() {
  showLoading(true);
  pokedex.innerHTML = '';
  const filtered = getFilteredPokemon();
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pagePokemon = filtered.slice(start, end);

  for (let pokemon of pagePokemon) {
    const details = await fetchPokemonDetails(pokemon.url);
    pokemon.types = details.types.map(t => t.type.name);
    createPokemonCard(details);
  }

  pageNumber.textContent = `Page ${currentPage}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= totalPages;
  showLoading(false);
}

function changePage(delta) {
  currentPage += delta;
  renderPage();
}

async function fetchPokemonDetails(url) {
  const res = await fetch(url);
  return await res.json();
}

function createPokemonCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h3>${pokemon.name}</h3>
    <p>#${pokemon.id}</p>
  `;
  card.addEventListener('click', () => showModal(pokemon));
  pokedex.appendChild(card);
}

function showModal(pokemon) {
  document.getElementById('modal-img').src = pokemon.sprites.front_default;
  document.getElementById('modal-name').textContent = pokemon.name;
  document.getElementById('modal-id').textContent = `#${pokemon.id}`;
  document.getElementById('modal-types').innerHTML = pokemon.types.map(t => `<span>${t}</span>`).join('');

  const statsList = document.getElementById('modal-stats');
  statsList.innerHTML = '';
  pokemon.stats.forEach(stat => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${stat.stat.name}</span><span>${stat.base_stat}</span>`;
    statsList.appendChild(li);
  });

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function showLoading(show) {
  loading.style.display = show ? 'block' : 'none';
}
