// TODO: jQuerify this file
// TODO: Organize init() method
// TODO: Make use of promises in BufferLoader.js
// TODO: JavaScriptify this file
// TODO: Add support for custom beat/backing track
// TODO: keyboard support, can take inspiration from virtualpiano.net
// TODO: Make Pianotar pretty with Material Design and by cleaning up UI
// TODO: Find better a better sample beat
// TODO: make JSDocs

function init() {
    var canvas = document.querySelector("canvas");
    var canvasContext = canvas.getContext("2d");
    var whiteKeyWidth = canvas.width / 14;
    var blackKeyWidth = 2 * (whiteKeyWidth / 3);
    var numKeys = 24;

    var whiteKeys = [], blackKeys = [];
    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    for (var i = 0, keyIndex = 0; i < numKeys; i++) {
        var noteName = notes[i % notes.length];
        var x = keyIndex * whiteKeyWidth;

        if (noteName.length === 1) {
            whiteKeys.push([x, i]);
            keyIndex++;
        }
        else {
            x -= blackKeyWidth / 2;
            blackKeys.push([x, i]);
        }
    }

    drawPiano(canvasContext, canvas.width, canvas.height, whiteKeyWidth, blackKeyWidth);

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var pianoGain = audioContext.createGain();
    pianoGain.connect(audioContext.destination);
    var filter = audioContext.createBiquadFilter();
    filter.type = "allpass";
    filter.connect(pianoGain);
    var beatGain = audioContext.createGain();
    beatGain.connect(audioContext.destination);

    var bufferLoader = new BufferLoader(
            audioContext,
            [
                "./sounds/1.mp3",
                "./sounds/2.mp3",
                "./sounds/3.mp3",
                "./sounds/4.mp3",
                "./sounds/5.mp3",
                "./sounds/6.mp3",
                "./sounds/7.mp3",
                "./sounds/8.mp3",
                "./sounds/9.mp3",
                "./sounds/10.mp3",
                "./sounds/11.mp3",
                "./sounds/12.mp3",
                "./sounds/13.mp3",
                "./sounds/14.mp3",
                "./sounds/15.mp3",
                "./sounds/16.mp3",
                "./sounds/17.mp3",
                "./sounds/18.mp3",
                "./sounds/19.mp3",
                "./sounds/20.mp3",
                "./sounds/21.mp3",
                "./sounds/22.mp3",
                "./sounds/23.mp3",
                "./sounds/24.mp3",
                "./sounds/samplebeat.mp3"
            ]
    );

    bufferLoader.load();

    canvas.addEventListener("mousedown", function (event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var a;

        canvasContext.fillStyle = "#777777";

        for (var i = 0; a = blackKeys[i++]; ) {
            canvasContext.beginPath();
            canvasContext.rect(a[0], 0, blackKeyWidth, 200);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                outputKey(numKeys, audioContext, bufferLoader, filter, a[1]);
                return;
            }
        }

        for (var i = 0; a = whiteKeys[i++]; ) {
            canvasContext.beginPath();
            canvasContext.rect(a[0], 0, whiteKeyWidth, 300);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth);
                outputKey(numKeys, audioContext, bufferLoader, filter, a[1]);
                return;
            }
        }
    });

    canvas.addEventListener("mouseup", function() {
        drawPiano(canvasContext, this.width, this.height, whiteKeyWidth, blackKeyWidth);
    });

    var filterFrequency = document.getElementById("filterFrequency");
    var qValue = document.getElementById("qValue");

    //filter.type = filterType.value;
    filter.gain.value = 40;
    filter.Q.value = qValue.value;
    filter.frequency.value = filterFrequency.value;

    // filter frequency
    filterFrequency.addEventListener("change", function () {
        filter.frequency.value = filterFrequency.value;
    });

    // filter type
    $("#filterType").on("change", function() {
        filter.type = this.value;
    })

    // filter quality
    qValue.addEventListener("change", function () {
        filter.Q.value = qValue.value;
    });

    var beatSource = audioContext.createBufferSource();
    beatSource.loop = true;

    $("#beat").on("change", function() {
        if (this.checked)
            playBeat(beatSource, beatGain, bufferLoader, numKeys);
        else
            stopBeat(beatSource);
    });

    $("#beatVolume").on("change", function() {
        var fraction = parseInt(this.value) / parseInt(this.max);
        beatGain.gain.value = fraction * fraction;
        beatSource.connect(beatGain);
    });

    var pianoVolume = document.getElementById("pianoVolume");
    pianoVolume.addEventListener("change", function() {
        var fraction = parseInt(pianoVolume.value) / parseInt(pianoVolume.max);
        pianoGain.gain.value = fraction * fraction;
    });
}

function drawPiano(canvasContext, canvasWidth, canvasHeight, whiteKeyWidth, blackKeyWidth) {
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWhiteKeys(canvasContext, whiteKeyWidth);
    drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth);
}

function drawWhiteKeys(canvasContext, whiteKeyWidth) {
    for (var i = 0; i < 14; i++) {
        canvasContext.rect(i * whiteKeyWidth, 0, whiteKeyWidth, 300);
        canvasContext.stroke();
    }
}

function drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth) {
    canvasContext.fillStyle = "#000000";
    for (var i = 0; i < 13; i++) {
        if (i === 2 || i === 6 || i === 9)
            continue;
        canvasContext.fillRect((i * whiteKeyWidth) + blackKeyWidth, 0, blackKeyWidth, 200);
    }
}

function outputKey(numKeys, audioContext, bufferLoader, filter, index) {
    var keysSource = [];
    // Connect buffers to filter node
    for (var i = 0; i < numKeys; i++) {
        keysSource[i] = audioContext.createBufferSource();
        keysSource[i].buffer = bufferLoader.bufferList[i % numKeys];
        keysSource[i].connect(filter);
    }

    // Play note
    keysSource[index].start(0);
}

function playBeat(beatSource, beatGain, bufferLoader, numKeys) {
    beatSource.connect(beatGain);
    beatSource.buffer = bufferLoader.bufferList[numKeys];
    beatSource.start(0);
}

function stopBeat(beatSource) {
    beatSource.disconnect(0);
}