let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let updateTimer;

// Create new audio element
let curr_track = document.createElement('audio');

// Define the tracks that have to be played
let track_list = [
  {
    name: "Night Owl",
    artist: "Broke For Free",
    image: "https://images.pexels.com/photos/2264753/pexels-photo-2264753.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3"
  },
  
];

function random_bg_color() {
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";
  document.body.style.background = bgColor;
}

function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  curr_track.load();

  track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
  random_bg_color();
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

loadTrack(track_index);

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}

async function searchTracks() {
  const query = document.getElementById("search-input").value;
  if (!query) {
    alert("Please enter a search term!");
    return;
  }

  const apiUrl = `https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${query}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Deezer API');
    }
    const data = await response.json();
    displaySearchResults(data.data);
  } catch (error) {
    console.error("Error fetching search results:", error);
    alert("Sorry, something went wrong while fetching data.");
  }
}

function displaySearchResults(tracks) {
  const searchResults = document.getElementById("search-results");
  searchResults.innerHTML = "";

  if (tracks.length === 0) {
    searchResults.innerHTML = "<p>No tracks found.</p>";
    return;
  }

  tracks.forEach(track => {
    const trackDiv = document.createElement("div");
    trackDiv.innerHTML = `
      <span>${track.title} by ${track.artist.name}</span>
      <button onclick="addToTrackList('${track.title}', '${track.artist.name}', '${track.album.cover}', '${track.preview}')">
        Add to Tracklist
      </button>
    `;
    searchResults.appendChild(trackDiv);
  });
}


let debounceTimer;

function liveSearch(query) {
  const searchResults = document.getElementById("search-results");

  if (!query) {
    searchResults.innerHTML = "";  // Eğer arama kutusu boşsa, sonuçları temizle
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const apiUrl = `https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${query}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Deezer API');
      }
      const data = await response.json();
      const tracks = data.data.slice(0, 5);  // En fazla 5 sonucu al
      displayLiveSearchResults(tracks);
    } catch (error) {
      console.error("Error fetching live search results:", error);
      searchResults.innerHTML = "<p>Error fetching results. Please try again later.</p>";
    }
  }, 300);  // 300ms gecikme ile arama yap
}

function displayLiveSearchResults(tracks) {
  const searchResults = document.getElementById("search-results");
  searchResults.innerHTML = "";  // Önceki sonuçları temizle

  if (tracks.length === 0) {
    searchResults.innerHTML = "<p>No tracks found.</p>";
    return;
  }

  tracks.forEach(track => {
    const trackDiv = document.createElement("div");
    trackDiv.classList.add('track-result');
    trackDiv.innerHTML = `
      <span>${track.title} by ${track.artist.name}</span>
      <button onclick="addToTrackList('${track.title}', '${track.artist.name}', '${track.album.cover}', '${track.preview}')">
        Add to Tracklist
      </button>
    `;
    searchResults.appendChild(trackDiv);
  });
}


function addToTrackList(name, artist, image, path) {
  const newTrack = { name, artist, image, path };
  track_list.push(newTrack);

  localStorage.setItem("track_list", JSON.stringify(track_list));

  alert(`${name} by ${artist} added to tracklist!`);
  document.getElementById("search-input").value = "";
  const searchResults = document.getElementById("search-results");
  searchResults.innerHTML = "";

  updateTrackList();
}


function updateTrackList() {
  const trackListContainer = document.getElementById("track-list");
  trackListContainer.innerHTML = "";

  track_list.forEach((track, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `${track.name} by ${track.artist} <button onclick="removeTrack(${index})">Remove</button>`;
    listItem.onclick = () => playSpecificTrack(index);
    trackListContainer.appendChild(listItem);
  });
}

function removeTrack(index) {
  track_list.splice(index, 1);
  localStorage.setItem("track_list", JSON.stringify(track_list));

  updateTrackList();
}


function playSpecificTrack(index) {
  track_index = index; // Tıklanan şarkının index'ini set et
  loadTrack(track_index); // Şarkıyı yükle
  playTrack(); // Şarkıyı çal
}
function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();

  const currentTrack = track_list[track_index];
  curr_track.src = currentTrack.path;
  curr_track.load();

  track_art.style.backgroundImage = `url(${currentTrack.image})`;
  track_name.textContent = currentTrack.name;
  track_artist.textContent = currentTrack.artist;
  now_playing.textContent = `PLAYING ${track_index + 1} OF ${track_list.length}`;

  curr_track.onloadedmetadata = () => {
    const durationMinutes = Math.floor(curr_track.duration / 60);
    const durationSeconds = Math.floor(curr_track.duration % 60);
    total_duration.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
  };

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
  random_bg_color();
}
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("track_list")) {
    track_list = JSON.parse(localStorage.getItem("track_list"));
  }

  // If there are no tracks in the list, add the default track
  if (track_list.length === 0) {
    track_list.push({
      name: "Night Owl",
      artist: "Broke For Free",
      image: "https://images.pexels.com/photos/2264753/pexels-photo-2264753.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
      path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3"
    });
    localStorage.setItem("track_list", JSON.stringify(track_list));
  }

  updateTrackList();

  if (track_list.length > 0) {
    loadTrack(track_index); // Load the first track
  }
});