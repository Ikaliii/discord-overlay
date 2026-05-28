const socket = io();

const screen = document.getElementById("screen");

socket.on("text", (data) => {
    screen.innerHTML = data.text;

    setTimeout(() => {
        screen.innerHTML = "";
    }, 8000);
});

socket.on("media", (data) => {

    if (data.type && data.type.includes("image")) {
        screen.innerHTML = `<img src="${data.url}" style="max-width:90%">`;
    }

    if (data.type && data.type.includes("video")) {
        screen.innerHTML = `<video src="${data.url}" autoplay controls></video>`;
    }

    setTimeout(() => {
        screen.innerHTML = "";
    }, 8000);
});

socket.on("clear", () => {
    screen.innerHTML = "";
});