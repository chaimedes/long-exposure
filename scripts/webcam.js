(function() {
  
  window.getStream = function(cb) {
    var getUserMedia = null;
    getUserMedia = navigator.mediaDevices.getUserMedia({audio:false,video:true});
    if (!getUserMedia) {
      setTimeout(function() {
        cb('Camera unavailable', null);
      }, 10);
      return;
    }
    getUserMedia.then(function(stream) {
      cb(null, stream);
    }, function(error) {
      cb(error || 'Unknown error', null);
    });
  };
  
  window.playStream = function(videoTag, stream, cb) {
    try {
	  videoTag.srcObject = stream;
	}
	catch (e) {
	  videoTag.src = URL.createObjectURL(stream);
	}
	videoTag.onloadedmetadata = function(e) {
	  videoTag.play();
	};
    videoTag.addEventListener('canplay', function() {
      if (cb) {
        cb(null);
        cb = null;
      }
    });
    videoTag.addEventListener('error', function(error) {
      if (cb) {
        cb(error || 'Unknown error');
        cb = null;
      }
    });
  };
  
  window.getFrames = function(videoTag, cb, diff) {
    var canvas = document.createElement('canvas');
    var width = videoTag.videoWidth;
    var height = videoTag.videoHeight;
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var intervalId = null;
    var cancelFunc = function() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    var intervalFunc = function() {
      if (videoTag.paused || videoTag.ended) {
        cancelFunc();
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(videoTag, 0, 0, width, height);
      cb(ctx.getImageData(0, 0, width, height).data, width, height);
    };
    intervalId = setInterval(intervalFunc, diff);
    return cancelFunc;
  };
  
})();
