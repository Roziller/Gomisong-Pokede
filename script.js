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

const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD'
};

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
  return pokemonList.filter(pokemon =>
    pokemon.name.includes(query) || String(pokemon.id).includes(query)
  );
}

async function renderPage() {
  showLoading(true);
  pokedex.innerHTML = '';
  const filtered = getFilteredPokemon();
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pagePokemon = filtered.slice(start, end);

  const selectedType = typeFilter.value;
  const detailedPokemon = [];
  for (let pokemon of pagePokemon) {
    const details = await fetchPokemonDetails(pokemon.url);
    details.typesList = details.types.map(t => t.type.name);
    detailedPokemon.push(details);
  }


  const filteredByType = selectedType
    ? detailedPokemon.filter(p => p.typesList.includes(selectedType))
    : detailedPokemon;

  for (let pokemon of filteredByType) {
    createPokemonCard(pokemon);
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

  const typeName = pokemon.typesList[0];
  const bgColor = typeColors[typeName] || '#fff';
  card.style.backgroundColor = bgColor;

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <h3>${pokemon.name}</h3>
    <p>#${pokemon.id}</p>
    <div class="type-container">
      ${pokemon.typesList.map(type => 
        `<span class="type-label" style="background-color: ${typeColors[type] || '#fff'}">${type}</span>`
      ).join('')}
    </div>
  `;
  card.addEventListener('click', () => showModal(pokemon));
  pokedex.appendChild(card);
}

function showModal(pokemon) {
  document.getElementById('modal-img').src = pokemon.sprites.front_default;
  document.getElementById('modal-name').textContent = pokemon.name;
  document.getElementById('modal-id').textContent = `#${pokemon.id}`;
  const types = pokemon.typesList.map(type => 
    `<span class="type-label" style="background-color: ${typeColors[type] || '#fff'}">${type}</span>`
  ).join('');
  document.getElementById('modal-types').innerHTML = types;

  const statsList = document.getElementById('modal-stats');
  statsList.innerHTML = '';
  pokemon.stats.forEach(stat => {
    const statName = stat.stat.name.toUpperCase();
    const statValue = stat.base_stat;
    const barWidth = Math.min(statValue, 150); // cap for visual
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${statName}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar" style="width: ${barWidth}px"></div>
        <span class="stat-value">${statValue}</span>
      </div>
    `;
    statsList.appendChild(li);
  });

  // Show type effect animation
  const effectDiv = document.getElementById('type-effect');
  effectDiv.innerHTML = '';
  const mainType = pokemon.typesList[0];
  let effectClass = '';
  if (mainType === 'fire') effectClass = 'effect-fire';
  else if (mainType === 'water') effectClass = 'effect-water';
  else if (mainType === 'electric') effectClass = 'effect-electric';
  else if (mainType === 'grass') effectClass = 'effect-grass';


  console.log(mainType, effectClass);

  if (effectClass) {
    const effect = document.createElement('div');
    effect.className = effectClass;
    effectDiv.appendChild(effect);
    setTimeout(() => { effectDiv.innerHTML = ''; }, 1000); // Remove after animation
  }

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function showLoading(show) {
  loading.style.display = show ? 'block' : 'none';
}
