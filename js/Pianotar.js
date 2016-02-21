// TODO: Connect beats to filters and fix filter code
// TODO: Make use of promises in BufferLoader.js
// TODO: JavaScriptify this file, including removing as many global variables as possible
// TODO: jQuerify this file
// TODO: Make Pianotar pretty with Material Design and by cleaning up UI
// TODO: Hide start beat button if respective beat is playing, hide stop beat button if it's not playing
// TODO: Find better drum beats (at least one to replace Beat 2)
// TODO: make JSDocs
// TODO: Make Pianotar into Pianozela

var beat1Source;
var beat2Source;
var beatGain;
var blackKeysArray = [];
var blackKeyWidth;
var bufferLoader;
var canvas;
var canvas2d;
var context;
var filter;
var keyIndex = 0;
var keysSource = [];
var noteIndex;
var noteName;
var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var numKeys = 24;
var pianoGain;
var saveBufferList;
var whiteKeysArray = [];
var whiteKeyWidth;

function init() {
    canvas = document.querySelector("canvas");
    canvas2d = canvas.getContext("2d");
    whiteKeyWidth = canvas.width / 14;
    blackKeyWidth = 2 * (whiteKeyWidth / 3);

    for (var i = 0; i < numKeys; i++) {
        noteIndex = i % notes.length;
        noteName = notes[noteIndex];
        var x = keyIndex * whiteKeyWidth;

        if (noteName.length === 1) {
            whiteKeysArray.push([x, i]);
            keyIndex++;
        }
        else {
            x -= blackKeyWidth / 2;
            blackKeysArray.push([x, i]);
        }
    }

    drawPiano();

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    filter = context.createBiquadFilter();
    pianoGain = context.createGain();
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
                "./sounds/drumbeat1.mp3",
                "./sounds/drumbeat2.mp3"
            ],
            finishedLoading
            );

    bufferLoader.load();

    canvas.addEventListener("mousedown", function (e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var a;

        canvas2d.fillStyle = "#777777";

        for (var i = 0; a = blackKeysArray[i++]; ) {
            canvas2d.beginPath();
            canvas2d.rect(a[0], 0, blackKeyWidth, 200);
            if (canvas2d.isPointInPath(x, y)) {
                canvas2d.fill();
                outputKey(a[1]);
                return;
            }
        }

        for (var i = 0; a = whiteKeysArray[i++]; ) {
            canvas2d.beginPath();
            canvas2d.rect(a[0], 0, whiteKeyWidth, 300);
            if (canvas2d.isPointInPath(x, y)) {
                canvas2d.fill();
                drawBlackKeys();
                outputKey(a[1]);
                return;
            }
        }
    });

    canvas.addEventListener("mouseup", function() {
        drawPiano();
    });

    var filter1 = document.getElementById("filter1");
    var filterType = document.getElementById("filterType");
    var qValue = document.getElementById("qValue");

    filter.type = filterType.value;
    filter.gain.value = 40;
    filter.Q.value = qValue.value;
    filter.frequency.value = filter1.value;

    // filter frequency
    filter1.addEventListener("change", function () {
        filter.frequency.value = filter1.value;
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

function drawPiano() {
    canvas2d.clearRect(0, 0, canvas.width, canvas.height);
    drawWhiteKeys();
    drawBlackKeys();
}

function drawWhiteKeys() {
    var x = whiteKeyWidth;
    for (var i = 0; i < 14; i++) {
        canvas2d.rect(i * x, 0, x, 300);
        canvas2d.stroke();
    }
}

function drawBlackKeys() {
    var x = blackKeyWidth;
    canvas2d.fillStyle = "#000000";
    for (var i = 0; i <= 12; i++) {
        if (i === 2 || i === 6 || i === 9)
            continue;
        canvas2d.fillRect((i * whiteKeyWidth) + x, 0, x, 200);
    }
}

function finishedLoading(bufferList) {
    saveBufferList = bufferList;
}

function outputKey(index) {
    // Connect buffers to filter node
    for (var i = 0; i < numKeys; i++) {
        keysSource[i] = context.createBufferSource();
        keysSource[i].buffer = saveBufferList[i % numKeys];
        keysSource[i].connect(filter);
    }

    // Set up volume adjustment for piano keys
    filter.connect(pianoGain);
    pianoGain.connect(context.destination);
    var pianoVolumeSlider = document.getElementById("slider1");
    var fraction = parseInt(pianoVolumeSlider.value) / parseInt(pianoVolumeSlider.max);
    this.pianoGain.gain.value = fraction * fraction;

    // Play note
    keysSource[index].start(0);
}

function playBeat1() {
    beat1Source = context.createBufferSource();
    beat1Source.buffer = saveBufferList[24];
    beat1Source.connect(beatGain);
    beatGain.connect(context.destination);
    var beatVolumeSlider = document.getElementById("slider2");
    var fraction = parseInt(beatVolumeSlider.value) / parseInt(beatVolumeSlider.max);
    this.beatGain.gain.value = fraction * fraction;
    beat1Source.loop = true;
    beat1Source.start(0);
}

function playBeat2() {
    beat2Source = context.createBufferSource();
    beat2Source.buffer = saveBufferList[25];
    beat2Source.connect(beatGain);
    beatGain.connect(context.destination);
    var beatVolumeSlider = document.getElementById("slider2");
    var fraction = parseInt(beatVolumeSlider.value) / parseInt(beatVolumeSlider.max);
    this.beatGain.gain.value = fraction * fraction;
    beat2Source.loop = true;
    beat2Source.start(0);
}

function stopBeat1() {
    beat1Source.disconnect(0);
}

function stopBeat2() {
    beat2Source.disconnect(0);
}