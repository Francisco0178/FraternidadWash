
/////////////////////////////////////////////////////////////
// - - - - - - - - - - - IMAGES - - - - - - - - - - - - ////
///////////////////////////////////////////////////////////


//Activar subidor de fotos
function photoUploader(){

  photoInput.change(function(){

    if (this.files.length != 1) return;

    var crop;
    var input = this;
    var file  = input.files[0];
    var name  = file.name;
    var size  = file.size;
    var type  = file.type;

    if(!(type == "image/png"||type == "image/gif"||type == "image/jpeg")){
      return;
    }

    loadModal("cropper",function(){
      crop = $('#imageCropper .cropper').croppie({
  			viewport: {
  				width: 200,
  				height: 200
  			}
  		});

      var reader = new FileReader();
      reader.onload = function (e) {
        crop.croppie('bind', {
          url: e.target.result
        });
      }

	    reader.readAsDataURL(input.files[0]);

      $('#imageCropper .no').click(function(){
        photoInput.val('');
        modal.fadeOut(200);
      });

      $('#imageCropper .ok').click(function(){
        modal.fadeOut(200);
        crop.croppie('result', {type:'base64',size:'original', quality:1, circle:false}).then(function(img) {
          var previusImage = _profileImage.attr("src");
        _profileImage.attr("src","").addClass("loading");
        $.ajax({
            url: '/uploadPhoto',
            type: 'POST',
            data: {img1:img},
            error:function(){},
            success: function(data){
              if(data == '500'){
                _profileImage.attr("src",previusImage);
                return;
              }
              user.profileImage = data.images;
              user.photos.push(data.images);
              data.publication.photos = [data.images];
              user.publications.push(data.publication);
              if(user._id in cachedUsers){
                cachedUsers[user._id].profileImage = data.images;
              }
              saveCurrentUser();
              saveCurrentUsers();
              currentProfileSection = "";
              showSection(currentSection);
              _profileImage.show();
            }
          });
        });
      });
    });
  });
}

//Resize photos
function imageToDataUri(ImA, w, h, callback) {
    var img = new Image();
    img.src = ImA;
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL());
  }
}

//Carga imagen
function loadImage(e,img){
  e.src = img;
  e.onload = function(){
    $(e).removeClass( "loading" )
  }
}
//Obtiene el tamaño de la imagen
function imgSize(url,size){
  return url.split('.png')[0]+size+".png";
}
//Elimina el cargando
function imageReady(e){
  $(e).removeClass( "loading" )
}
