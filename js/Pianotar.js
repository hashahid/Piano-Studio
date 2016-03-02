// TODO: Make use of promises in BufferLoader.js
// TODO: Find a better sample track
// TODO: Use real piano sounds and add one or two more octaves
// TODO: keyboard support, can take inspiration from virtualpiano.net
// TODO: Make Pianotar pretty with Material Design and by cleaning up UI
// TODO: Add visualization canvas below piano canvas
// TODO: Allow users to record what they play and maybe save to file

/**
 * Initialize variables, draw piano, connect audio nodes, load buffers, and register event listeners.
 */
function init() {
    // Drawing variables
    var canvas = document.querySelector("canvas");
    var canvasContext = canvas.getContext("2d");
    var whiteKeyWidth = canvas.width / 14, blackKeyWidth = 2 * (whiteKeyWidth / 3);

    // Setup variables
    var numKeys = 24;
    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    var whiteKeys = [], blackKeys = [];
    var customTrackFile = "";

    // Web audio variables
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var pianoGain = audioContext.createGain(), trackGain = audioContext.createGain();
    var keySources = [],
        sampleTrackSource = audioContext.createBufferSource(),
        customTrackSource = audioContext.createBufferSource();
    var bufferLoader = new BufferLoader(
        audioContext,
        [
            "./sounds/1.mp3", "./sounds/2.mp3", "./sounds/3.mp3", "./sounds/4.mp3", "./sounds/5.mp3",
            "./sounds/6.mp3", "./sounds/7.mp3", "./sounds/8.mp3", "./sounds/9.mp3", "./sounds/10.mp3",
            "./sounds/11.mp3", "./sounds/12.mp3", "./sounds/13.mp3", "./sounds/14.mp3", "./sounds/15.mp3",
            "./sounds/16.mp3", "./sounds/17.mp3", "./sounds/18.mp3", "./sounds/19.mp3", "./sounds/20.mp3",
            "./sounds/21.mp3", "./sounds/22.mp3", "./sounds/23.mp3", "./sounds/24.mp3", "./sounds/sampletrack.mp3"
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
    trackGain.connect(audioContext.destination);
    sampleTrackSource.loop = true;
    bufferLoader.load();

    // Register event listeners
    canvas.addEventListener("mousedown", function (event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var key;

        canvasContext.fillStyle = "#777777";

        for (i = 0; key = blackKeys[i++];) {
            canvasContext.beginPath();
            canvasContext.rect(key[0], 0, blackKeyWidth, 200);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                playKey(keySources, key[1], audioContext, pianoGain, bufferLoader);
                return;
            }
        }

        for (i = 0; key = whiteKeys[i++];) {
            canvasContext.beginPath();
            canvasContext.rect(key[0], 0, whiteKeyWidth, 300);
            if (canvasContext.isPointInPath(x, y)) {
                canvasContext.fill();
                drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth);
                playKey(keySources, key[1], audioContext, pianoGain, bufferLoader);
                return;
            }
        }
    });

    canvas.addEventListener("mouseup", function () {
        drawPiano(canvasContext, this.width, this.height, whiteKeyWidth, blackKeyWidth);
    });

    $("#sampleTrackToggle").on("change", function () {
        if (this.checked)
            playTrack(sampleTrackSource, trackGain, bufferLoader, numKeys);
        else
            stopTrack(sampleTrackSource);
    });

    $("#customTrackToggle").on("change", function() {
        if (this.checked)
            playTrack(customTrackSource, trackGain, bufferLoader, numKeys + 1);
        else
            stopTrack(customTrackSource);
    });

    $("#customTrackBtn").on("click", function() {
        $("#customTrackFile").trigger("click");
    });

    $("#customTrackFile").on("change", function() {
        // reset custom track
        stopTrack(customTrackSource);
        customTrackSource = audioContext.createBufferSource();
        customTrackSource.loop = true;
        // load new file
        customTrackFile = URL.createObjectURL(this.files[0]);
        bufferLoader.urlList[numKeys + 1] = customTrackFile;
        bufferLoader.loadBuffer(file, numKeys + 1);
    });

    $("#pianoVolume").on("change", function () {
        var fraction = parseInt(this.value) / parseInt(this.max);
        pianoGain.gain.value = fraction * fraction;
    });

    $("#trackVolume").on("change", function () {
        var fraction = parseInt(this.value) / parseInt(this.max);
        trackGain.gain.value = fraction * fraction;
    });
}

/**
 * Clear the canvas, draw the white keys of the piano, and then the black keys on top.
 * @param {CanvasRenderingContext2D} canvasContext - The canvas' 2D rendering context.
 * @param {number} canvasWidth - The canvas's width.
 * @param {number} canvasHeight - The canvas' height.
 * @param {number} whiteKeyWidth - The width of an individual white key.
 * @param {number} blackKeyWidth - The width of an individual black key.
 */
function drawPiano(canvasContext, canvasWidth, canvasHeight, whiteKeyWidth, blackKeyWidth) {
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWhiteKeys(canvasContext, whiteKeyWidth);
    drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth);
}

/**
 * Draw the white keys of the piano.
 * @param {CanvasRenderingContext2D} canvasContext - The canvas' 2D rendering context.
 * @param {number} whiteKeyWidth - The width of an individual white key.
 */
function drawWhiteKeys(canvasContext, whiteKeyWidth) {
    for (var i = 0; i < 14; i++) {
        canvasContext.rect(i * whiteKeyWidth, 0, whiteKeyWidth, 300);
        canvasContext.stroke();
    }
}

/**
 * Draw the black keys of the piano.
 * @param {CanvasRenderingContext2D} canvasContext - The canvas' 2D rendering context.
 * @param {number} whiteKeyWidth - The width of an individual white key.
 * @param {number} blackKeyWidth - The width of an individual black key.
 */
function drawBlackKeys(canvasContext, whiteKeyWidth, blackKeyWidth) {
    canvasContext.fillStyle = "#000000";
    for (var i = 0; i < 13; i++) {
        if (i === 2 || i === 6 || i === 9)
            continue;
        canvasContext.fillRect((i * whiteKeyWidth) + blackKeyWidth, 0, blackKeyWidth, 200);
    }
}

/**
 * Connect the decoded piano key audio buffer to the AudioContext and play the key.
 * @param {Array} keySources - The Array of AudioBufferSourceNodes responsible for playing piano keys.
 * @param {number} index - The index of a piano key.
 * @param {AudioContext} audioContext - The audio-processing graph responsible for node creation and audio processing.
 * @param {GainNode} pianoGain - The AudioNode responsible for controlling the piano volume.
 * @param {BufferLoader} bufferLoader - The BufferLoader object holding the decoded audio buffers.
 */
function playKey(keySources, index, audioContext, pianoGain, bufferLoader) {
    keySources[index] = audioContext.createBufferSource();
    keySources[index].connect(pianoGain);
    keySources[index].buffer = bufferLoader.bufferList[index];
    keySources[index].start(0);
}

/**
 * Connect the decoded audio buffer to a GainNode (which is connected to the AudioContext) and play it.
 * @param {AudioBufferSourceNode} source - The AudioNode responsible for playing the track.
 * @param {GainNode} gain - The AudioNode responsible for controlling the track volume.
 * @param {BufferLoader} bufferLoader - The BufferLoader object holding the decoded audio buffers.
 * @param {number} index - The index of the track in the BufferLoader's buffer list Array.
 */
function playTrack(source, gain, bufferLoader, index) {
    source.connect(gain);
    source.buffer = bufferLoader.bufferList[index];
    source.start(0);
}

/**
 * Stop the track from playing.
 * @param {AudioBufferSourceNode} source - The AudioNode responsible for playing the track.
 */
function stopTrack(source) {
    source.disconnect(0);
}