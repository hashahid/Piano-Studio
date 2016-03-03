/* 
 * Most of the code in this file is credited to Boris Smus. In particular, his guide on "Abstracting the Web Audio API,"
 * which can be found at the following links:
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/#toc-abstract
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js
 */

/**
 * Creates objects that can decode audio and store them in an Array of buffers.
 * @param {AudioContext} context - The audio-processing graph responsible for node creation and audio processing.
 * @param {Array} urlList - The Array holding paths to audio files.
 * @constructor
 */
function BufferLoader(context, urlList) {
    this.context = context;
    this.urlList = urlList;
    this.bufferList = [];
    this.loadCount = 0;
}

/**
 * Decode audio data asynchronously and load the buffer.
 * @param {string} url - The path to an audio file.
 * @param {number} index - The index of the audio file in both the URL and buffer lists.
 */
BufferLoader.prototype.loadBuffer = function (url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    var loader = this;

    request.onload = function () {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(request.response).then(function (buffer) {
            if (!buffer) {
                alert('error decoding file data: ' + url);
                return;
            }
            loader.bufferList[index] = buffer;
            if (++loader.loadCount === loader.urlList.length)
                loader.onload(loader.bufferList);
        }, function (error) {
            console.error('decodeAudioData error', error);
        });
    };

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    };

    request.send();
};

/**
 * Load the buffer for each audio file in the URL list.
 */
BufferLoader.prototype.load = function () {
    for (var i = 0; i < this.urlList.length; i++)
        this.loadBuffer(this.urlList[i], i);
};
