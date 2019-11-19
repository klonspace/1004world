function startVIDEOJS() {
    var userName = document.getElementById("vjsCont").dataset.username;
    //var url = 'http://node19961-env-1871450.jcloud.ik-server.com:11083/live/' + userName + '/index.m3u8'
    var url = 'http://node19961-env-1871450.jcloud.ik-server.com:11083/live/' + userName + '/index.m3u8'
    var request = new XMLHttpRequest();

    request.open('get', url, true);

    request.onreadystatechange = checkReadyState;

    function checkReadyState() {
        
        if (request.readyState === 4) {
           
            //check to see whether request for the file failed or succeeded
            if ((request.status == 200) || (request.status == 0)) {
                
                startVideo(url)
            }
            else {

                console.log("not online")
                return;
            }
        }
    }
    request.send(null);
}
var player;
async function startVideo(url) {
    var videoEl = document.createElement("video");
    videoEl.classList.add("video-js")
    videoEl.classList.add("vjs-custom")
    videoEl.setAttribute('controls','');
    videoEl.setAttribute('playsinline','');
    document.getElementById("vjsCont").querySelector("#placeHolder").remove()
    document.getElementById("vjsCont").appendChild(videoEl)
    
    player = videojs(videoEl);
    player.src({
        src: url,
        type: 'application/x-mpegURL'
    });
    console.log("yo")
    var aspectRatio = 16 / 9;
    var vidLoaded = false;
    function resizeVideoJS() {
        document.getElementById(player.id()).style.width = document.getElementById(player.id()).parentElement.parentElement.offsetWidth+"px"
        document.getElementById(player.id()).style.height = (document.getElementById(player.id()).parentElement.parentElement.offsetWidth*9/16)+"px"
    }
    // Initialize resizeVideoJS()
     resizeVideoJS();
    // Then on resize call resizeVideoJS()
    // window.onresize = resizeVideoJS;
}

