// TODO: Turn beat start/stop buttons into MDL switch toggles so multiple instances of them can't play simultaneously
// TODO: Remove beat event listeners from HTML page and into this file so all global variables can be removed
// TODO: Organize init() method
// TODO: Make use of promises in BufferLoader.js
// TODO: JavaScriptify this file
// TODO: jQuerify this file
// TODO: keyboard support, can take inspiration from virtualpiano.net
// TODO: Make Pianotar pretty with Material Design and by cleaning up UI
// TODO: Find better drum beats (at least one to replace Beat 2)
// TODO: make JSDocs
// TODO: Make Pianotar into Pianozela

var beat1Source;
var beat2Source;
var beatGain;
var context;
var numKeys = 24;
var bufferLoader;

function init() {
    var canvas = document.querySelector("canvas");
    var canvasContext = canvas.getContext("2d");
    var whiteKeyWidth = canvas.width / 14;
    var blackKeyWidth = 2 * (whiteKeyWidth / 3);

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

    drawPiano(canvas, canvasContext, whiteKeyWidth, blackKeyWidth);

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    var filter = context.createBiquadFilter();
    var pianoGain = context.createGain();
    beatGain = context.createGain();

    bufferLoader = new BufferLoader(
            context,
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
                "./sounds/beat1.mp3",
                "./sounds/beat2.mp3"
            ]
            );

    bufferLoader.load();

    canvas.addEventListener("mousedown", function (e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var a;

        canvasContext.fillStyle = "#777777";

        for (var i = 0; a = blackKeys[i++]; ) {
            canvasContext.beginPath();
            canvasContext.rect(a[0], 0, blackKeyWidth, 200);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                outputKey(filter, pianoGain, a[1]);
                return;
            }
        }

        for (var i = 0; a = whiteKeys[i++]; ) {
            canvasContext.beginPath();
            canvasContext.rect(a[0], 0, whiteKeyWidth, 300);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth);
                outputKey(filter, pianoGain, a[1]);
                return;
            }
        }
    });

    canvas.addEventListener("mouseup", function() {
        drawPiano(this, canvasContext, whiteKeyWidth, blackKeyWidth);
    });

    var filterFrequency = document.getElementById("filterFrequency");
    var filterType = document.getElementById("filterType");
    var qValue = document.getElementById("qValue");

    filter.type = filterType.value;
    filter.gain.value = 40;
    filter.Q.value = qValue.value;
    filter.frequency.value = filterFrequency.value;

    // filter frequency
    filterFrequency.addEventListener("change", function () {
        filter.frequency.value = filterFrequency.value;
    }, false);

    // filter type
    filterType.addEventListener("change", function () {
        filter.type = filterType.value;
    }, false);

    // filter quality
    qValue.addEventListener("change", function () {
        filter.Q.value = qValue.value;
    }, false);
}

function drawPiano(canvas, canvasContext, whiteKeyWidth, blackKeyWidth) {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
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
    for (var i = 0; i <= 12; i++) {
        if (i === 2 || i === 6 || i === 9)
            continue;
        canvasContext.fillRect((i * whiteKeyWidth) + blackKeyWidth, 0, blackKeyWidth, 200);
    }
}

function outputKey(filter, pianoGain, index) {
    var keysSource = [];
    // Connect buffers to filter node
    for (var i = 0; i < numKeys; i++) {
        keysSource[i] = context.createBufferSource();
        keysSource[i].buffer = bufferLoader.bufferList[i % numKeys];
        keysSource[i].connect(filter);
    }

    // Set up volume adjustment for piano keys
    filter.connect(pianoGain);
    pianoGain.connect(context.destination);
    var pianoVolumeSlider = document.getElementById("slider1");
    var fraction = parseInt(pianoVolumeSlider.value) / parseInt(pianoVolumeSlider.max);
    pianoGain.gain.value = fraction * fraction;

    // Play note
    keysSource[index].start(0);
}

function playBeat1() {
    beat1Source = context.createBufferSource();
    beat1Source.buffer = bufferLoader.bufferList[numKeys];
    beat1Source.connect(beatGain);
    beatGain.connect(context.destination);
    var beatVolumeSlider = document.getElementById("slider2");
    var fraction = parseInt(beatVolumeSlider.value) / parseInt(beatVolumeSlider.max);
    beatGain.gain.value = fraction * fraction;
    beat1Source.loop = true;
    beat1Source.start(0);
}

function playBeat2() {
    beat2Source = context.createBufferSource();
    beat2Source.buffer = bufferLoader.bufferList[numKeys + 1];
    beat2Source.connect(beatGain);
    beatGain.connect(context.destination);
    var beatVolumeSlider = document.getElementById("slider2");
    var fraction = parseInt(beatVolumeSlider.value) / parseInt(beatVolumeSlider.max);
    beatGain.gain.value = fraction * fraction;
    beat2Source.loop = true;
    beat2Source.start(0);
}

function stopBeat1() {
    beat1Source.disconnect(0);
}

function stopBeat2() {
    beat2Source.disconnect(0);
}