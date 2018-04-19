(function() {

	var cancelFunc = function(){}; // This gets defined in the webcam script
	var imageData = null;
	var exposure = -1; // How often to grab one frame, in seconds
	var duration = -1; // Total length of time to record, in seconds
	var lastTime = null;
	var exposure_box = null;
	var duration_box = null;
	var normalize_light_box = null;

	document.addEventListener("DOMContentLoaded", function() {
	});

	// Begin capturing the stream
	function startCapture() {

	// Grab the current config values from the user input
	exposure = exposure_box.value;
	duration = duration_box.value;
	normalize_light = normalize_light_box.checked;

	// Stop right now if we have unacceptable parameters.
	if (exposure < 1 || duration < 1) {
		return -1;
	}

	// Define a post-promise function for the stream, and pass it to the webcam stream function.
	window.getStream(function(err, stream) {
		
		// Problem?
		if (err) {
			alert(err);
			return;
		}
	  
		imageData = null;
	  
		var video = document.getElementById('video');
		
		window.playStream(video, stream, function(err) {
			
			lastTime = new Date().getTime();
			
			if (err) {
			  alert(err);
			  return;
			}
			
			cancelFunc = window.getFrames(video, handleFrame, exposure*1000);
			
		});
		
		// Automatically stop the camera from recording frames once our overall duration time has been spanned.
		window.setTimeout(function() { stopCapture(); document.getElementById('start-stop').innerText = 'Start'; }, duration*1000);
	  
	}); // End of running getStream

	}  // End of startCapture

	function stopCapture() {
	cancelFunc();
	}

	function handleFrame(data, width, height) {
	var now = new Date().getTime();
	var frameTime = (now - lastTime) / 1000;
	lastTime = now;
	if (!imageData) {
	  imageData = new Float64Array(width*height*3);
	}
	for (var i = 0, len = data.length; i < len; ++i) {
	  var scaler = (exposure/duration);
	  //imageData[i] *= 1-scaler;
	  if (normalize_light == false) {
		  scaler = 1;
	  }
	  imageData[i] += scaler*data[i];
	}
	var canvas = document.getElementById('canvas');
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	var ctxData = ctx.getImageData(0, 0, width, height);
	for (var i = 0, len = imageData.length; i < len; ++i) {
	  ctxData.data[i] = Math.round(imageData[i]);
	}
	ctx.putImageData(ctxData, 0, 0);
	}

	window.addEventListener('load', function() {
	var startStop = document.getElementById('start-stop');
	startStop.onclick = function(){
	  if (startStop.innerText === 'Start') {
		startCapture();
		startStop.innerText = 'Stop';
	  } else {
		stopCapture();
		startStop.innerText = 'Start';
	  }
	};
	exposure_box = document.getElementById("exposure");
	duration_box = document.getElementById("duration");
	normalize_light_box = document.getElementById("normalize_light");

	});

})();
