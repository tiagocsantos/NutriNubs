var pictureSource;   // picture source
var destinationType; // sets the format of returned value

// Wait for device API libraries to load
//
document.addEventListener("deviceready",onDeviceReady,false);
// device APIs are available
//

function onDeviceReady() {
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {   
    document.getElementById('img_preview').src = "data:image/jpeg;base64," + imageData;
    document.getElementById('conceptInfo').textContent = "picture taken";
    doPredict({base64: imageData});
}


// A button will call this function
//
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
    $('#concepts').html("");
    document.getElementById("nutriInfo").style.display = "none";
    document.getElementById("concepts").style.display = "initial";
    document.getElementById("img_preview").src="";
        
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
    destinationType: destinationType.DATA_URL });
}

// Called if something bad happens.
//
function onFail(message) {
  alert('Failed because: ' + message);
}
