var beat1Source;
var beat2Source;
var beatGain;
var blackKeysArray = [];
var blackKeyWidth;
var bufferLoader;
var canvas;
var canvas2d;
var canvasHeight;
var canvasWidth;
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
    canvas = document.getElementById("myCanvas");
    canvas2d = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    whiteKeyWidth = canvasWidth / 14;
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

    drawWhiteKeys();
    drawBlackKeys();

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
    }, false);

    canvas.addEventListener("mouseup", function (e) {
        // Clear canvas
        canvas.width = 2;
        canvas.width = canvasWidth;

        // Redraw piano
        drawWhiteKeys();
        drawBlackKeys();
    }, false);
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
    for (var i = 0; i < 24; i++) {
        keysSource[i] = context.createBufferSource();
        keysSource[i].buffer = saveBufferList[i % 24];
        keysSource[i].connect(pianoGain);
        //source[i].connect(filter);
    }
    
    checkFilter();

    // Set up volume adjustment for piano keys
    pianoGain.connect(context.destination);
    var pianoVolumeSlider = document.getElementById("slider1");
    var fraction = parseInt(pianoVolumeSlider.value) / parseInt(pianoVolumeSlider.max);
    this.pianoGain.gain.value = fraction * fraction;

    // Play note
    keysSource[index].start(0);
}

function checkFilter() {
    var element = document.getElementById("filter_choice");
    if (element.options[element.selectedIndex].value === 0) {
        for (var i = 0; i < 24; i++) {
            keysSource[i].disconnect(0);
            filter.disconnect(0);
            keysSource[i].connect(pianoGain);
        }
    }
    if (element.options[element.selectedIndex].value === 1) {
        filter = context.createBiquadFilter();
        for (var i = 0; i < 24; i++) {
            keysSource[i].disconnect(0);
            keysSource[i].connect(filter);
            filter.connect(pianoGain);
        }
    }
    if (element.options[element.selectedIndex].value === 2) {
        filter = context.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency = 200;
        filter.Q = 2;
        for (var i = 0; i < 24; i++) {
            keysSource[i].disconnect(0);
            keysSource[i].connect(filter);
            filter.connect(pianoGain);
        }
    }
    if (element.options[element.selectedIndex].value === 3) {
        filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.type = 150;
        filter.Q = 2;
        for (var i = 0; i < 24; i++) {
            keysSource[i].disconnect(0);
            keysSource[i].connect(filter);
            filter.connect(pianoGain);
        }
    }
    if (element.options[element.selectedIndex].value === 4) {
        filter = context.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency = 150;
        filter.Q = 2;
        filter.gain = -10;
        for (var i = 0; i < 24; i++) {
            keysSource[i].disconnect(0);
            keysSource[i].connect(filter);
            filter.connect(pianoGain);
        }
    }
}

function playBeat1() {
    beat1Source = context.createBufferSource();
    beat1Source.buffer = saveBufferList[24];
    beat1Source.connect(beatGain);
    //beat1Source.connect(filter);
    //filter.connect(beatGain);
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
    //beat2Source.connect(filter);
    //filter.connect(beatGain);
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