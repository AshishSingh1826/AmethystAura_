let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`${folder}/`);
    let html = await response.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");
    let as = doc.querySelectorAll("a");
    songs = [...as]
        .filter((element) => element.href.endsWith(".mp3"))
        .map((element) => element.href.split(`${folder}/`)[1]);

    // Update the playlist UI
    let songUL = document.querySelector(".songList > ul");
    songUL.innerHTML = songs
        .map(
            (song) => `<li>
                <img src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Beast</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`
        )
        .join("");

    // Attach click event listeners to each song
    document.querySelectorAll(".songList li").forEach((element, index) => {
        element.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    return songs;
}

function playMusic(track, pause = false) {
    currentSong.src = `./${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let response = await fetch("songs/");
    let html = await response.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");
    let folders = [...doc.querySelectorAll("a")].map((element) => element.href.split("/").pop());
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = folders
        .filter((folder) => folder !== "")
        .map(
            (folder) => `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="24px" height="24px" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                        <!-- SVG content -->
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>Album Title</h2>
                <p>Album Description</p>
            </div>`
        )
        .join("");

    // Attach click event listeners to each album card
    document.querySelectorAll(".card").forEach((element) => {
        element.addEventListener("click", async () => {
            songs = await getSongs(`songs/${element.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // Get the list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // Display all albums on the page
    await displayAlbums();

    // Attach event listeners to play, next, and previous buttons
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "img/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "img/play.svg";
        }
    });

    // Attach event listener to previous button
    document.getElementById("previous").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1]);
        }
    });

    // Attach event listener to next button
    document.getElementById("next").addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Attach event listener to volume slider
    document.querySelector(".range input").addEventListener("change", (event) => {
        currentSong.volume = parseInt(event.target.value) / 100;
    });

    // Attach event listener to mute button
    document.querySelector(".volume img").addEventListener("click", (event) => {
        let volumeImg = document.querySelector(".volume img");
        if (volumeImg.src.includes("volume.svg")) {
            volumeImg.src = volumeImg.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            volumeImg.src = volumeImg.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1; // Adjust the volume level as needed
            document.querySelector(".range input").value = 10; // Adjust the volume slider value accordingly
        }
    });

    // Listen for the timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
            currentSong.currentTime
        )}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    // Attach event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (event) => {
        let percent = (event.offsetX / event.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Attach event listener for hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Attach event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();
