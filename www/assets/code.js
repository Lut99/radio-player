
// radio = new Audio();
// radio.src = "https://simulatorradio.stream/stream.mp3";

var last = null;

function run_listener() {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    const sock = new WebSocket("wss://ws.simulatorradio.com/");
    sock.addEventListener("open", (event) => {
        console.log("Opened le socket ", event.data);
    });
    sock.addEventListener("message", (event) => {
        // Deserialize the message
        data = JSON.parse(event.data);
        if (data.type === "nowPlaying") {
            // Show the notification
            if (last === null || last != data.now_playing.title + "-" + data.now_playing.artist) {
                const notification = new Notification(data.now_playing.title, {
                    body: data.now_playing.artists + " - DJ " + data.djs.now.displayname,
                    icon: data.now_playing.art,
                    image: data.now_playing.art
                });
                last = data.now_playing.title + "-" + data.now_playing.artist;
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Get notification permission
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            console.log("Already have notif permission");
            run_listener();
        } else if (Notification.permission !== "denied") {
            console.log("Getting notif permission");
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    run_listener();
                }
            });
        }

        // audio = document.getElementById("radio")
        // audio.play().then(() => {
        //     if ("mediaSession" in navigator) {
        //         navigator.mediaSession.playbackState = "playing";
        //         navigator.mediaSession.metadata = new MediaMetadata({
        //             title: "Unforgettable",
        //             artist: "Nat King Cole",
        //             album: "The Ultimate Collection (Remastered)",
        //             artwork: [
        //             {
        //                 src: "https://dummyimage.com/96x96",
        //                 sizes: "96x96",
        //                 type: "image/png",
        //             },
        //             {
        //                 src: "https://dummyimage.com/128x128",
        //                 sizes: "128x128",
        //                 type: "image/png",
        //             },
        //             {
        //                 src: "https://dummyimage.com/192x192",
        //                 sizes: "192x192",
        //                 type: "image/png",
        //             },
        //             {
        //                 src: "https://dummyimage.com/256x256",
        //                 sizes: "256x256",
        //                 type: "image/png",
        //             },
        //             {
        //                 src: "https://dummyimage.com/384x384",
        //                 sizes: "384x384",
        //                 type: "image/png",
        //             },
        //             {
        //                 src: "https://dummyimage.com/512x512",
        //                 sizes: "512x512",
        //                 type: "image/png",
        //             },
        //             ],
        //         });
        //     }
        // }).catch((error) => {
        //     console.error(error);
        // });
    }
});