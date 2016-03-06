// TODO: Implement Help section

/**
 * Initialize variables, draw piano, connect audio nodes, load buffers, and register event listeners.
 */
function init() {
    // Drawing variables
    var pianoCanvas = document.getElementById('pianoCanvas');
    var visualizationCanvas = document.getElementById('visualizationCanvas');
    var pianoCanvasContext = pianoCanvas.getContext('2d');
    var visualizationCanvasContext = visualizationCanvas.getContext('2d');
    var whiteKeyWidth = pianoCanvas.width / 28, blackKeyWidth = 2 * (whiteKeyWidth / 3);

    // Setup variables
    const NUMBER_OF_KEYS = 48;
    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    var whiteKeys = [], blackKeys = [];
    var customTrackFile = '';

    // Web audio variables
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var analyzer = audioContext.createAnalyser();
    var pianoGain = audioContext.createGain(), trackGain = audioContext.createGain();
    var keySources = [],
        sampleTrackSource = audioContext.createBufferSource(),
        customTrackSource = audioContext.createBufferSource();
    var bufferLoader = new BufferLoader(
        audioContext,
        [
            './sounds/C2.wav', './sounds/C-sharp2.wav', './sounds/D2.wav', './sounds/D-sharp2.wav',
            './sounds/E2.wav', './sounds/F2.wav', './sounds/F-sharp2.wav', './sounds/G2.wav',
            './sounds/G-sharp2.wav', './sounds/A2.wav', './sounds/A-sharp2.wav', './sounds/B2.wav',
            './sounds/C3.wav', './sounds/C-sharp3.wav', './sounds/D3.wav', './sounds/D-sharp3.wav',
            './sounds/E3.wav', './sounds/F3.wav', './sounds/F-sharp3.wav', './sounds/G3.wav',
            './sounds/G-sharp3.wav', './sounds/A3.wav', './sounds/A-sharp3.wav', './sounds/B3.wav',
            './sounds/C4.wav', './sounds/C-sharp4.wav', './sounds/D4.wav', './sounds/D-sharp4.wav',
            './sounds/E4.wav', './sounds/F4.wav', './sounds/F-sharp4.wav', './sounds/G4.wav',
            './sounds/G-sharp4.wav', './sounds/A4.wav', './sounds/A-sharp4.wav', './sounds/B4.wav',
            './sounds/C5.wav', './sounds/C-sharp5.wav', './sounds/D5.wav', './sounds/D-sharp5.wav',
            './sounds/E5.wav', './sounds/F5.wav', './sounds/F-sharp5.wav', './sounds/G5.wav',
            './sounds/G-sharp5.wav', './sounds/A5.wav', './sounds/A-sharp5.wav', './sounds/B5.wav',
            './sounds/sampletrack.wav'
        ]
    );

    drawPiano(pianoCanvasContext, pianoCanvas.width, pianoCanvas.height, whiteKeyWidth, blackKeyWidth);
    window.requestAnimationFrame(function () {
        drawVisualizer(visualizationCanvasContext, visualizationCanvas.width, visualizationCanvas.height, analyzer);
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

    analyzer.connect(audioContext.destination);
    pianoGain.connect(analyzer);
    trackGain.connect(analyzer);
    sampleTrackSource.loop = true;
    bufferLoader.load();

    // Register event listeners
    $(document).on({
        keydown: function (event) {
            var key, shift = event.shiftKey;
            pianoCanvasContext.fillStyle = '#777777';

            switch (event.keyCode) {
                // Number keys row
                case 49:
                    if (shift)
                        key = blackKeys[0];
                    else
                        key = whiteKeys[0];
                    break;
                case 50:
                    if (shift)
                        key = blackKeys[1];
                    else
                        key = whiteKeys[1];
                    break;
                case 51:
                    if (shift)
                        return;
                    key = whiteKeys[2];
                    break;
                case 52:
                    if (shift)
                        key = blackKeys[2];
                    else
                        key = whiteKeys[3];
                    break;
                case 53:
                    if (shift)
                        key = blackKeys[3];
                    else
                        key = whiteKeys[4];
                    break;
                case 54:
                    if (shift)
                        key = blackKeys[4];
                    else
                        key = whiteKeys[5];
                    break;
                case 55:
                    if (shift)
                        return;
                    key = whiteKeys[6];
                    break;
                case 56:
                    if (shift)
                        key = blackKeys[5];
                    else
                        key = whiteKeys[7];
                    break;
                case 57:
                    if (shift)
                        key = blackKeys[6];
                    else
                        key = whiteKeys[8];
                    break;
                case 48:
                    if (shift)
                        return;
                    key = whiteKeys[9];
                    break;
                // QWERTY row
                case 81:
                    if (shift)
                        key = blackKeys[7];
                    else
                        key = whiteKeys[10];
                    break;
                case 87:
                    if (shift)
                        key = blackKeys[8];
                    else
                        key = whiteKeys[11];
                    break;
                case 69:
                    if (shift)
                        key = blackKeys[9];
                    else
                        key = whiteKeys[12];
                    break;
                case 82:
                    if (shift)
                        return;
                    key = whiteKeys[13];
                    break;
                case 84:
                    if (shift)
                        key = blackKeys[10];
                    else
                        key = whiteKeys[14];
                    break;
                case 89:
                    if (shift)
                        key = blackKeys[11];
                    else
                        key = whiteKeys[15];
                    break;
                case 85:
                    if (shift)
                        return;
                    key = whiteKeys[16];
                    break;
                case 73:
                    if (shift)
                        key = blackKeys[12];
                    else
                        key = whiteKeys[17];
                    break;
                case 79:
                    if (shift)
                        key = blackKeys[13];
                    else
                        key = whiteKeys[18];
                    break;
                case 80:
                    if (shift)
                        key = blackKeys[14];
                    else
                        key = whiteKeys[19];
                    break;
                // ASD row
                case 65:
                    if (shift)
                        return;
                    key = whiteKeys[20];
                    break;
                case 83:
                    if (shift)
                        key = blackKeys[15];
                    else
                        key = whiteKeys[21];
                    break;
                case 68:
                    if (shift)
                        key = blackKeys[16];
                    else
                        key = whiteKeys[22];
                    break;
                case 70:
                    if (shift)
                        return;
                    key = whiteKeys[23];
                    break;
                case 71:
                    if (shift)
                        key = blackKeys[17];
                    else
                        key = whiteKeys[24];
                    break;
                case 72:
                    if (shift)
                        key = blackKeys[18];
                    else
                        key = whiteKeys[25];
                    break;
                case 74:
                    if (shift)
                        key = blackKeys[19];
                    else
                        key = whiteKeys[26];
                    break;
                case 75:
                    if (shift)
                        return;
                    key = whiteKeys[27];
                default:
                    break;
            }

            pianoCanvasContext.beginPath();
            if (shift)
                pianoCanvasContext.rect(key[0], 0, blackKeyWidth, 200);
            else
                pianoCanvasContext.rect(key[0], 0, whiteKeyWidth, 300);
            pianoCanvasContext.fill();
            if (!shift)
                drawBlackKeys(pianoCanvasContext, whiteKeyWidth, blackKeyWidth);
            playKey(keySources, key[1], audioContext, pianoGain, bufferLoader);
        }, keyup: function () {
            drawPiano(pianoCanvasContext, pianoCanvas.width, pianoCanvas.height, whiteKeyWidth, blackKeyWidth);
        }, dblclick: function () {
            if (window.getSelection)
                window.getSelection().removeAllRanges();
            else if (this.selection)
                this.selection.empty();
        }
    });

    $('#pianoCanvas').on({
        mousedown: function (event) {
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
        }, mouseup: function () {
            drawPiano(pianoCanvasContext, this.width, this.height, whiteKeyWidth, blackKeyWidth);
        }
    });

    $('#sampleTrackToggle').on('change', function () {
        if (this.checked)
            playTrack(sampleTrackSource, trackGain, bufferLoader, NUMBER_OF_KEYS);
        else
            stopSound(sampleTrackSource);
    });

    $('#customTrackToggle').on('change', function () {
        if (this.checked)
            playTrack(customTrackSource, trackGain, bufferLoader, NUMBER_OF_KEYS + 1);
        else
            stopSound(customTrackSource);
    });

    $('#customTrackBtn').on('click', function () {
        $('#customTrackFile').trigger('click');
    });

    $('#customTrackFile').on('change', function () {
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
 * @param {CanvasRenderingContext2D} canvasContext - The piano canvas's 2D rendering context.
 * @param {number} canvasWidth - The canvas's width.
 * @param {number} canvasHeight - The canvas's height.
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
 * @param {CanvasRenderingContext2D} pianoCanvasContext - The piano canvas's 2D rendering context.
 * @param {number} whiteKeyWidth - The width of an individual white key.
 */
function drawWhiteKeys(pianoCanvasContext, whiteKeyWidth) {
    for (var i = 0; i < 28; i++) {
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
    for (var i = 0; i < 27; i++) {
        if (i === 2 || i === 6 || i === 9 || i === 13 || i === 16 || i === 20 || i === 23)
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
 * @param {AnalyserNode} analyzer - The AudioNode responsible for providing real-time frequency analysis information.
 */
function drawVisualizer(canvasContext, canvasWidth, canvasHeight, analyzer) {
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    var freqDomain = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(freqDomain);
    for (var i = 0; i < analyzer.frequencyBinCount; i++) {
        var value = freqDomain[i];
        var percent = value / 256;
        var height = canvasHeight * percent;
        var offset = canvasHeight - height - 1;
        var barWidth = canvasWidth / analyzer.frequencyBinCount;
        var hue = i / analyzer.frequencyBinCount * 360;
        canvasContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        canvasContext.fillRect(i * barWidth, offset, barWidth, height);
    }
    window.requestAnimationFrame(function () {
        drawVisualizer(canvasContext, canvasWidth, canvasHeight, analyzer);
    });
}

/**
 * Hide page content and display loading bar while audio files are being decoded.
 */
function enableLoadingBar() {
    $('#loaded').hide();
    $('#loadingBar').show();

    if ($('#customTrackToggle')[0].checked)
        $('#customTrackToggle').trigger('click');
}

/**
 * Hide loading bar and display page content when audio files are successfully decoded.
 */
function disableLoadingBar() {
    $('#loadingBar').hide();
    $('#loaded').show();
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
