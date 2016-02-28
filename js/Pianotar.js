// TODO: Make use of promises in BufferLoader.js
// TODO: make JSDocs
// TODO: Add support for custom beat/backing track
// TODO: Use real piano sounds and add one or two more octaves
// TODO: keyboard support, can take inspiration from virtualpiano.net
// TODO: Make Pianotar pretty with Material Design and by cleaning up UI
// TODO: Find better a better sample beat
// TODO: Add visualization canvas below piano canvas
// TODO: Allow users to record what they play and maybe save to file

function init() {
    // Drawing variables
    var canvas = document.querySelector("canvas");
    var canvasContext = canvas.getContext("2d");
    var whiteKeyWidth = canvas.width / 14, blackKeyWidth = 2 * (whiteKeyWidth / 3);

    // Metadata variables
    var numKeys = 24;
    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    var whiteKeys = [], blackKeys = [];

    // Web audio variables
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var pianoGain = audioContext.createGain(), beatGain = audioContext.createGain();
    var keysSource = [], beatSource = audioContext.createBufferSource();
    var bufferLoader = new BufferLoader(
        audioContext,
        [
            "./sounds/1.mp3", "./sounds/2.mp3", "./sounds/3.mp3", "./sounds/4.mp3", "./sounds/5.mp3",
            "./sounds/6.mp3", "./sounds/7.mp3", "./sounds/8.mp3", "./sounds/9.mp3", "./sounds/10.mp3",
            "./sounds/11.mp3", "./sounds/12.mp3", "./sounds/13.mp3", "./sounds/14.mp3", "./sounds/15.mp3",
            "./sounds/16.mp3", "./sounds/17.mp3", "./sounds/18.mp3", "./sounds/19.mp3", "./sounds/20.mp3",
            "./sounds/21.mp3", "./sounds/22.mp3", "./sounds/23.mp3", "./sounds/24.mp3", "./sounds/samplebeat.mp3"
        ]
    );

    drawPiano(canvasContext, canvas.width, canvas.height, whiteKeyWidth, blackKeyWidth);

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

    pianoGain.connect(audioContext.destination);
    beatGain.connect(audioContext.destination);
    beatSource.loop = true;
    bufferLoader.load();

    // Register event listeners
    canvas.addEventListener("mousedown", function (event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var a;

        canvasContext.fillStyle = "#777777";

        for (var i = 0; a = blackKeys[i++];) {
            canvasContext.beginPath();
            canvasContext.rect(a[0], 0, blackKeyWidth, 200);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                outputKey(keysSource, a[1], audioContext, bufferLoader, pianoGain);
                return;
            }
        }

        for (var i = 0; a = whiteKeys[i++];) {
            canvasContext.beginPath();
            canvasContext.rect(a[0], 0, whiteKeyWidth, 300);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth);
                outputKey(keysSource, a[1], audioContext, bufferLoader, pianoGain);
                return;
            }
        }
    });

    canvas.addEventListener("mouseup", function () {
        drawPiano(canvasContext, this.width, this.height, whiteKeyWidth, blackKeyWidth);
    });

    $("#beat").on("change", function () {
        if (this.checked)
            playBeat(beatSource, beatGain, bufferLoader, numKeys);
        else
            stopBeat(beatSource);
    });

    $("#beatVolume").on("change", function () {
        var fraction = parseInt(this.value) / parseInt(this.max);
        beatGain.gain.value = fraction * fraction;
    });

    $("#pianoVolume").on("change", function () {
        var fraction = parseInt(this.value) / parseInt(this.max);
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

function outputKey(keysSource, index, audioContext, bufferLoader, pianoGain) {
    keysSource[index] = audioContext.createBufferSource();
    keysSource[index].connect(pianoGain);
    keysSource[index].buffer = bufferLoader.bufferList[index];
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