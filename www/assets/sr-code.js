/* SR CODE.js
 *   by Lut99
 *
 * Created:
 *   24 Jul 2024, 05:46:54
 * Last edited:
 *   24 Jul 2024, 06:01:50
 * Auto updated?
 *   Yes
 *
 * Description:
 *   Backend code for the `radio-listener`
**/


/***** GLOBALS *****/
var audio = null;
var last = null;
var show_notifs = false;





/***** HELPER FUNCTIONS *****/
function notify(data) {
    // Resolve the data first
    if (data === null) {
        data = {
            now_playing: {
                title: document.getElementById("player-title").innerText,
                artists: document.getElementById("player-artist").innerText,
                art: document.getElementById("player-art").getAttribute("src"),
            }
        }
    }

    // Send the notification
    const notification = new Notification(data.now_playing.title, {
        body: "SIMULATORRADIO\n" + data.now_playing.artists,
        icon: data.now_playing.art,
        image: data.now_playing.art
    });
}





/***** ONLOAD *****/
document.addEventListener("DOMContentLoaded", function() {
    // Restore the check mark
    let check = Cookies.get("get-notifications");
    if (check !== undefined) {
        document.getElementById("player-notifs-check").checked = check === "1";
    }

    // Register the checkbox handler
    document.getElementById("player-notifs-check").onchange = function() {
        // Update the cookie
        if (document.getElementById("player-notifs-check").checked) {
            Cookies.set("notifications", "1", {"SameSite": "strict"});

            // Also get notification permissions if we didn't already
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    console.log("Notification permission already obtained");
                    notify(null);
                } else if (Notification.permission !== "denied") {
                    console.log("Obtaining notification permission...");
                    Notification.requestPermission().then((permission) => {
                        // If the user accepts, then generate a notification to celebrate
                        if (permission === "granted") {
                            console.log("Notification permission obtained");
                            notify(null);
                        }
                    });
                }
            } else {
                document.getElementById("player-notifs-check").checked = false;
                document.getElementById("player-notics-check").toggleAttribute("disabled", true);
                document.getElementById("player-notifs-label").innerText = "Deze browser ondersteunt geen notificaties. Sorry!";
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

        } else {
            Cookies.set("notifications", "0", {"SameSite": "strict"});
        }
    };



    // Setup the hoverer
    document.getElementById("player-art-click").onmouseenter = function() {
        document.getElementById("player-art-click").style.opacity = "1";
    };
    document.getElementById("player-art-click").onmouseleave = function() {
        if (audio !== null) {
            document.getElementById("player-art-click").style.opacity = "0";
        }
    };



    // Setup the stream
    const sock = new WebSocket("wss://ws.simulatorradio.com/");
    sock.addEventListener("open", (event) => {
        console.log("Connected to 'ws.simulatorradio.com' for currently playing information");
    });
    sock.addEventListener("message", (event) => {
        // Deserialize the message
        data = JSON.parse(event.data);
        if (data.type === "nowPlaying") {
            console.log("Received 'now-playing' update (" + data.now_playing.title + ", " + data.now_playing.artists + ", " + data.now_playing.art + ")");

            // Only need  to do stuff when an update occurred
            if (last === null || last != data.now_playing.title + "-" + data.now_playing.artist) {
                last = data.now_playing.title + "-" + data.now_playing.artist;
                console.log("Received 'now-playing' update (" + data.now_playing.title + ", " + data.now_playing.artists + ", " + data.now_playing.art + ")");

                // Update the site information
                document.getElementById("player-title").innerText = data.now_playing.title;
                document.getElementById("player-artist").innerText = data.now_playing.artists;
                document.getElementById("player-art").setAttribute("src", data.now_playing.art);

                // Show the notification
                if (("Notification" in window) && Notification.permission === "granted" && document.getElementById("player-notifs-check").checked) {
                    notify(data);
                }
            }
        }
    });
});



function play_sr() {
    if (audio === null) {
        audio = new Audio("https://simulatorradio.stream/stream.mp3");
        audio.play();
        document.getElementById("player-art-click").innerHTML = '<i class="fa-solid fa-pause"></i>';
        document.getElementById("player-status").innerText = 'Playing';
        document.getElementById("player-status").style.fontStyle = 'normal';
        console.log("Playing SIMULATORRADIO");
    } else {
        audio.pause();
        audio = null;
        document.getElementById("player-art-click").innerHTML = '<i class="fa-solid fa-play"></i>';
        document.getElementById("player-status").innerText = 'Paused';
        document.getElementById("player-status").style.fontStyle = 'italic';
        console.log("Pausing SIMULATORRADIO");
    }
}
