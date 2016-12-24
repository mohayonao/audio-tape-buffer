(function() {
	"use strict"

	var audioBuffer = null;



  	var encodeWAV = function (buf, sr){
      var buffer = new ArrayBuffer(44 + buf.length * 2);
      var view = new DataView(buffer);

      /* RIFF identifier */
      writeString(view, 0, "RIFF");
      /* file length */
      view.setUint32(4, 32 + buf.length * 2, true);
      /* RIFF type */
      writeString(view, 8, "WAVE");
      /* format chunk identifier */
      writeString(view, 12, "fmt ");
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, 1, true);
      /* sample rate */
      view.setUint32(24, sr, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sr *2 , true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      writeString(view, 36, "data");
      /* data chunk length */
      view.setUint32(40, buf.length * 2, true);

      floatTo16BitPCM(view, 44, buf);

      return view;
    };

    var floatTo16BitPCM = function (output, offset, input){
      for (var i = 0; i < input.length; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };

    var writeString = function (view, offset, string){
      for (var i = 0; i < string.length; i++){
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };



	var AudioExport = function(buffer) {
		audioBuffer = buffer;
		return this;
	};

	AudioExport.prototype.buffer = function(buffer) {
		if (buffer){
			audioBuffer = buffer;
		} else {
			return audioBuffer;
		}
		return this;
	};

	AudioExport.prototype.toWaveBlob = function() {
  		var view = encodeWAV(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
  		var blob = new Blob([view], { type: "audio/wav" });
  		return blob;
	};



	if (!window.AudioExport){
		window.AudioExport = AudioExport;
	}

 

})();