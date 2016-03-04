// TODO: Use real piano sounds and add one or two more octaves
// TODO: keyboard support, can take inspiration from virtualpiano.net
// TODO: Make Pianotar pretty with Material Design and by cleaning up UI
// TODO: Allow users to record what they play and maybe save to file

/**
 * Initialize variables, draw piano, connect audio nodes, load buffers, and register event listeners.
 */
function init() {
    // Drawing variables
    var pianoCanvas = document.getElementById('pianoCanvas');
    var visualizationCanvas = document.getElementById('visualizationCanvas');
    var pianoCanvasContext = pianoCanvas.getContext('2d');
    var visualizationCanvasContext = visualizationCanvas.getContext('2d');
    var whiteKeyWidth = pianoCanvas.width / 14, blackKeyWidth = 2 * (whiteKeyWidth / 3);

    // Setup variables
    const NUMBER_OF_KEYS = 24;
    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    var whiteKeys = [], blackKeys = [];
    var customTrackFile = '';

    // Web audio variables
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var analyser = audioContext.createAnalyser();
    var pianoGain = audioContext.createGain(), trackGain = audioContext.createGain();
    var keySources = [],
        sampleTrackSource = audioContext.createBufferSource(),
        customTrackSource = audioContext.createBufferSource();
    var bufferLoader = new BufferLoader(
        audioContext,
        [
            './sounds/1.mp3', './sounds/2.mp3', './sounds/3.mp3', './sounds/4.mp3', './sounds/5.mp3',
            './sounds/6.mp3', './sounds/7.mp3', './sounds/8.mp3', './sounds/9.mp3', './sounds/10.mp3',
            './sounds/11.mp3', './sounds/12.mp3', './sounds/13.mp3', './sounds/14.mp3', './sounds/15.mp3',
            './sounds/16.mp3', './sounds/17.mp3', './sounds/18.mp3', './sounds/19.mp3', './sounds/20.mp3',
            './sounds/21.mp3', './sounds/22.mp3', './sounds/23.mp3', './sounds/24.mp3', './sounds/sampletrack.wav'
        ]
    );

    drawPiano(pianoCanvasContext, pianoCanvas.width, pianoCanvas.height, whiteKeyWidth, blackKeyWidth);
    window.requestAnimationFrame(function() {
        drawVisualizer(visualizationCanvasContext, visualizationCanvas.width, visualizationCanvas.height, analyser);
    });

    for (var i = 0, keyIndex = 0; i < NUMBER_OF_KEYS; i++) {
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

    analyser.connect(audioContext.destination);
    pianoGain.connect(analyser);
    trackGain.connect(analyser);
    sampleTrackSource.loop = true;
    bufferLoader.load();

    // Register event listeners
    pianoCanvas.addEventListener('mousedown', function (event) {
        var rect = this.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var key;

        pianoCanvasContext.fillStyle = '#777777';

        for (i = 0; key = blackKeys[i++];) {
            pianoCanvasContext.beginPath();
            pianoCanvasContext.rect(key[0], 0, blackKeyWidth, 200);
            if (pianoCanvasContext.isPointInPath(x, y)) {
                pianoCanvasContext.fill();
                playKey(keySources, key[1], audioContext, pianoGain, bufferLoader);
                return;
            }
        }

        for (i = 0; key = whiteKeys[i++];) {
            pianoCanvasContext.beginPath();
            pianoCanvasContext.rect(key[0], 0, whiteKeyWidth, 300);
            if (pianoCanvasContext.isPointInPath(x, y)) {
                pianoCanvasContext.fill();
                drawBlackKeys(pianoCanvasContext, whiteKeyWidth, blackKeyWidth);
                playKey(keySources, key[1], audioContext, pianoGain, bufferLoader);
                return;
            }
        }
    });

    pianoCanvas.addEventListener('mouseup', function () {
        drawPiano(pianoCanvasContext, this.width, this.height, whiteKeyWidth, blackKeyWidth);
    });

    $('#sampleTrackToggle').on('change', function () {
        if (this.checked)
            playTrack(sampleTrackSource, trackGain, bufferLoader, NUMBER_OF_KEYS);
        else
            stopSound(sampleTrackSource);
    });

    $('#customTrackToggle').on('change', function() {
        if (this.checked)
            playTrack(customTrackSource, trackGain, bufferLoader, NUMBER_OF_KEYS + 1);
        else
            stopSound(customTrackSource);
    });

    $('#customTrackBtn').on('click', function() {
        $('#customTrackFile').trigger('click');
    });

    $('#customTrackFile').on('change', function() {
        // reset custom track
        stopSound(customTrackSource);
        customTrackSource = audioContext.createBufferSource();
        customTrackSource.loop = true;
        // load new file
        customTrackFile = URL.createObjectURL(this.files[0]);
        bufferLoader.urlList[NUMBER_OF_KEYS + 1] = customTrackFile;
        bufferLoader.loadBuffer(customTrackFile, NUMBER_OF_KEYS + 1);
    });

    $('#pianoVolume').on('change', function () {
        var fraction = parseInt(this.value) / parseInt(this.max);
        pianoGain.gain.value = fraction * fraction;
    });

    $('#trackVolume').on('change', function () {
        var fraction = parseInt(this.value) / parseInt(this.max);
        trackGain.gain.value = fraction * fraction;
    });
}

/**
 * Clear the canvas, draw the white keys of the piano, and then the black keys on top.
 * @param {CanvasRenderingContext2D} pianoCanvasContext - The piano canvas's 2D rendering context.
 * @param {number} canvasWidth - The canvas's width.
 * @param {number} canvasHeight - The canvas's height.
 * @param {number} whiteKeyWidth - The width of an individual white key.
 * @param {number} blackKeyWidth - The width of an individual black key.
 */
function drawPiano(pianoCanvasContext, canvasWidth, canvasHeight, whiteKeyWidth, blackKeyWidth) {
    pianoCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWhiteKeys(pianoCanvasContext, whiteKeyWidth);
    drawBlackKeys(pianoCanvasContext, whiteKeyWidth, blackKeyWidth);
}

/**
 * Draw the white keys of the piano.
 * @param {CanvasRenderingContext2D} pianoCanvasContext - The piano canvas's 2D rendering context.
 * @param {number} whiteKeyWidth - The width of an individual white key.
 */
function drawWhiteKeys(pianoCanvasContext, whiteKeyWidth) {
    for (var i = 0; i < 14; i++) {
        pianoCanvasContext.rect(i * whiteKeyWidth, 0, whiteKeyWidth, 300);
        pianoCanvasContext.stroke();
    }
}

/**
 * Draw the black keys of the piano.
 * @param {CanvasRenderingContext2D} pianoCanvasContext - The piano canvas's 2D rendering context.
 * @param {number} whiteKeyWidth - The width of an individual white key.
 * @param {number} blackKeyWidth - The width of an individual black key.
 */
function drawBlackKeys(pianoCanvasContext, whiteKeyWidth, blackKeyWidth) {
    pianoCanvasContext.fillStyle = '#000000';
    for (var i = 0; i < 13; i++) {
        if (i === 2 || i === 6 || i === 9)
            continue;
        pianoCanvasContext.fillRect((i * whiteKeyWidth) + blackKeyWidth, 0, blackKeyWidth, 200);
    }
}

/**
 * Draw onto the visualization canvas below based on the frequency of the currently playing sound.
 * Credit for this visualization goes to Boris Smus. See his implementation at
 * {@link http://chimera.labs.oreilly.com/books/1234000001552/ch05.html|this link}.
 * @param {CanvasRenderingContext2D} canvasContext - The visualization canvas's 2D rendering context.
 * @param {number} canvasWidth - The canvas's width.
 * @param {number} canvasHeight - The canvas's height.
 * @param {AnalyserNode} analyser - The AudioNode responsible for providing real-time frequency analysis information.
 */
function drawVisualizer(canvasContext, canvasWidth, canvasHeight, analyser) {
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    var freqDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
        var value = freqDomain[i];
        var percent = value / 256;
        var height = canvasHeight * percent;
        var offset = canvasHeight - height - 1;
        var barWidth = canvasWidth/analyser.frequencyBinCount;
        var hue = i / analyser.frequencyBinCount * 360;
        canvasContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        canvasContext.fillRect(i * barWidth, offset, barWidth, height);
    }
    window.requestAnimationFrame(function() {
        drawVisualizer(canvasContext, canvasWidth, canvasHeight, analyser);
    });
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
 * Stop a sound that is playing.
 * @param {AudioBufferSourceNode} source - The AudioNode responsible for playing the track.
 */
function stopSound(source) {
    source.disconnect(0);
}
