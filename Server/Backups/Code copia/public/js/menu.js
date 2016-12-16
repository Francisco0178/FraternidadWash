var currentSection = "documents";
var currentProfileSection = "";
var modal, user, users, publications, rightBar, topBar, middleBar, win, doc, chatWindow, chat, chatObj, photoInput, _profileImageCont, publication, prefabs, miniImage, _sections, _followOptions, _profileImage, _fullName, _newPost, _career, _age, _mgs, _followers, _following, _askpass, pubDropdown;
var cachedImages, cachedPublications, cachedUsers;
var timeElements = new Array();

//Espera a que cargue la página
$(document).ready(function(){

  //Instancias de elementos HTML
  win              = $(window);
  doc              = $(document);
  modal            = $("#modal");
  rightBar         = $("#rightBar");
  middleBar        = $("#middleBar");
  topBar           = $("#topBar");
  chatWindow       = $("#chatWindow");
  chat             = $("#chat");
  photoInput       = $('#photoUploader input');
  prefabs          = $('#prefabs');
  publication      = prefabs.find(".publication");
  miniImage        = prefabs.find(".imgCont");
  pubDropdown      = prefabs.find(".dropdown");

  //Añade eventos
  modalEvents();

  //Checkear estado de cookies
  checkState();

  //Checkear path del URL
  checkURL();

  //Activa el subidor de fotos
  photoUploader();

  //Actualiza el tiempo transcurrido de los elementos
  refreshTime();

  //Obtener datos del usuario
  getUserData(function(){

    //Carga los archivos en caché
    loadCache();

    //Muestra la seccion actual
    showSection(currentSection);

    //Activa el responsive
    responsive();

    //Al hacer click en una seccion
    sectionTrigger();

    //Load chat
    loadChat();

  });

});

function showSection(id){

  //Guarda la seccion actual
  currentSection = id;

  //Verifica que este completo el registro
  if(user.status == "incomplete"){
    loadModal("initTutorial");
    return;
  }

  //Carga el html de la sección
  middleBar.load("/sections/"+id + ".html",function(){

    //Mostrar el perfil - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    if(currentSection == "profile"){

      _sections         = middleBar.find(".sections .section");
      _followOptions    = middleBar.find(".followOptions");
      _profileImageCont = middleBar.find(".profileImage");
      _fullName         = middleBar.find(".fullName");
      _newPost          = middleBar.find(".newPost");
      _career           = middleBar.find(".career");
      _age              = middleBar.find(".age");
      _mgs              = middleBar.find(".message");
      _followers        = middleBar.find(".followers .number");
      _following        = middleBar.find(".following .number");
      _askpass          = middleBar.find(".askpass .number");

      _profileImage     = _profileImageCont.find("img");

      //Esconder opciones de seguimiento
      _followOptions.hide();

      //Cargar imagen de perfil
      if(user.profileImage == null){
        _profileImage.attr("src",IMG_USER);
      }
      else{
        getImagesFromID([user.profileImage],null,function(src){
          _profileImage.attr("src",src[0].miniUrl);
        });
      }

      //Imprime datos del perfil
      _fullName.html(user.fname + " " + user.lname);
      _career.html(user.carreras[user.city][user.career]+" ("+user.yearIn+")");
      _age.html(getAge(user.birthdate)+" años");
      _followers.html(user.followers.length);
      _following.html(user.following.length);
      _askpass.html(user.askpass);



      // - - -  EVENTOS  - - - //

      //Cargar modal para postear
      _newPost.click(function(){
        loadModal("newPost",function(){
          modal.find(".close").click(function(){
            modal.fadeOut(200, function(){
              modal.empty();
            });
          })
        });
      });

      //Muestra la ventana para cambiar de imagen
      _profileImageCont.click(function(){
        photoInput.trigger( "click" );
      });

      //Muestra la sección en el menu perfil
      function displaySection(section){

        //Le quita la sombra a los botones de la sección
        _sections.css({background:"none"}).filter("[section='"+section+"']").css({background:"#EEE"});

        //Esconde la sección anterior
        if(currentProfileSection != "") middleBar.find("."+currentProfileSection).hide();

        //Guarda el html de las seccion actual y la muestra
        var curSec = middleBar.find("."+section).show();

        //CARGA LA MINI SECCIÓN FOTOS
        if(section == "photos"){

          //Limpia la sección
          curSec.empty();

          //Detecta si hay fotos
          if(user.photos.length == 0) {
            curSec.html('<div style="font-size:30px;color:#CCC;margin:15px;text-align:center">Aún no has subido fotos</div>');
            return;
          }

          //Carga las fotos
          for(var photo in user.photos){
            console.log(user.photos[photo]);
            var clone = miniImage.clone().attr("photoID",user.photos[photo]).appendTo(curSec);
            getImagesFromID([user.photos[photo]],clone,function(src,element){
              element.find("img").attr("src",src[0].miniUrl);
            });
          }

          //Añade eventos para ampliar las imagenes
          curSec.on("click",".imgCont",function(){
            loadModal("showPhoto",function(){
              var id = $(this).attr("img");
            });
          });
        }

        //CARGA LA MINI SECCIÓN PUBLICACIONES
        if(section == "publications"){

          //Almacena la sección en una variable
          var pubs = middleBar.find(".sec.publications");

          //Detecta si hay publicaciones
          if(user.publications.length == 0){
            pubs.html('<div class="publication noPub"><div style="font-size:30px;color:#CCC;margin:15px;text-align:center">Aún no has publicado</div></div>').find(".noPub").show();
            return;
          }


          //pubs.find(".noPub").remove();
          getPublicationsFromID(user.publications,pubs,function(rp, pubs) {
            var ides = user.publications.reverse();
            for(var p in rp.reverse()){
              var cloned = publication.clone();
              cloned.attr("publicationID",rp[p]._id);
              cloned.appendTo(pubs).attr("publicationID",rp[p]._id).show();
              cloned.find(".date").html(getTransTime(rp[p].creationTime));
              timeElements.push({moment:rp[p].creationTime,element:cloned.find(".date")});
              cloned.find(".gus .num").html(rp[p].likes.length);
              cloned.find(".com .num").html(rp[p].comments.length);
              getImagesFromID(rp[p].photos, cloned,function(src, element){
                element.find(".attach").append('<img class="imageAdded loading" onload="imageReady(this)" src="'+src[0].fullUrl+'">');
              });
              getUsersFromID([rp[p].creator],cloned,function(src, element){
                element.find(".fullname").html(src[0].fname + " " + src[0].lname);
                getImagesFromID([src[0].profileImage],element,function(src1,element1){
                  element1.find(".profImage").attr('src',src1[0].miniUrl);
                });
              });
            }
          });

        }
        currentProfileSection = section;
      }
      _sections.click(function(){
        displaySection($(this).attr("section"));
      });
      displaySection("publications");
    }

  });
  topBar.find(".selectionLine").hide(200);
  topBar.find(".topBarItem[section='"+id+"']").children(".selectionLine").show(200);
}
function getUsersFromId(){

}

function getImagesFromID(ids,element,callback){

  var s   = new Array();
  var ns  = new Array();

  for(var id in ids){
    if(isImageInCache(ids[id])){
      s.push(cachedImages[ids[id]]);
    }
    else{
      ns.push(ids[id]);
    }
  }
  if(ns.length == 0){
    callback(s,element);
    return;
  }
  else{
    post(ns,"/getImages",function(res){
      saveImagesInCache(res);
      var images = new Array();
      for(var id in ids){
        images.push(cachedImages[ids[id]]);
      }
      callback(images,element);
    });
  }
}

function getPublicationsFromID(ids,element,callback){

  var s   = new Array();
  var ns  = new Array();

  for(var id in ids){
    if(isPublicationInCache(ids[id])){
      s.push(cachedPublications[ids[id]]);
    }
    else{
      ns.push(ids[id]);
    }
  }
  if(ns.length == 0){
    callback(s,element);
    return;
  }
  else{
    post(ns,"/getPublications",function(res){
      savePublicationsInCache(res);
      var publication = new Array();
      for(var id in ids){
        publication.push(cachedPublications[ids[id]]);
      }
      callback(publication,element);
    });
  }
}

function getUsersFromID(ids,element,callback){

  var s   = new Array();
  var ns  = new Array();

  for(var id in ids){
    if(isUserInCache(ids[id])){
      s.push(cachedUsers[ids[id]]);
    }
    else{
      ns.push(ids[id]);
    }
  }
  if(ns.length == 0){
    callback(s,element);
    return;
  }
  else{
    post(ns,"/getUsers",function(res){
      saveUsersInCache(res);
      var usr = new Array();
      for(var id in ids){
        usr.push(cachedUsers[ids[id]]);
      }
      callback(usr,element);
    });
  }
}

//Realizar post con Ajax
function post(data,url,callback){
  $.ajax({
  url: url,
  type: 'POST',
  contentType: 'application/json',
  data: JSON.stringify(data)})
  .done(function( res ) {
    callback(res);
  });
}

//Checkea las cookies para ver si el usuario sigue conectado
function checkState(){
  if (($.cookie('email')||$.cookie('pass')) == undefined) {
   window.location.href = "/login.html";
  }
}

//Detecta el path, para cargar una sección
function checkURL(){
  var ur = window.location.href.split("/");
  if(ur[ur.length - 1] == $.cookie("email").split("@")[0]){
    currentSection = "profile";
  }
  else{
    currentSection = "users";
  }
}

//Envia una solicitud para obtener los datos del usuario o los carga desde el cache
function getUserData(callback){
  post({},"/getMyData",function(res){
    saveUserData(res);
    console.log(res);
    callback();
  });
}

//Guarda los datos de usuario en el cache
function saveUserData(data){
  user = data;
  localStorage['userInfo'] = JSON.stringify(user);
}

//Guarda las imagenes en el caché
function saveImagesInCache(data){
  for(var img in data){
    if(!isImageInCache(data[img]._id)){
      var id = data[img]._id;
      //delete data[img]._id;
      cachedImages[id] = data[img];
    }
  }
  localStorage['photos'] = JSON.stringify(cachedImages);
}

//Guarda las publicaciones en el caché
function savePublicationsInCache(data){
  for(var pub in data){
    if(!isImageInCache(data[pub]._id)){
      var id = data[pub]._id;
      //delete data[pub]._id;
      cachedPublications[id] = data[pub];
    }
  }
  localStorage['publications'] = JSON.stringify(cachedPublications);
}

//Guarda los usuarios en el caché
function saveUsersInCache(data){
  for(var usr in data){
    if(!isUserInCache(data[usr]._id)){
      var id = data[usr]._id;
      //delete data[usr]._id;
      cachedUsers[id] = data[usr];
    }
  }
  localStorage['users'] = JSON.stringify(cachedUsers);
}

//Detecta si la imagen esta guardada
function isImageInCache(id){
    if(id in cachedImages) return true;
    return false;
}

//Detecta si la imagen esta guardada
function isPublicationInCache(id){
    if(id in cachedPublications) return true;
    return false;
}

//Detecta si el usuario esta guardado
function isUserInCache(id){
    if(id in cachedUsers) return true;
    return false;
}

//Carga una imagen a partir de un ID
function getImageURL(id, callback){
  if(isImageInCache(id)){
    callback(images[id]);
    return;
  }
  post([id],"/getImages",function(res){
    saveImagesInCache(res);
    callback(res);
  });
}

//Activa el responsive de la pagina
function responsive(){
  win.resize(function(size) {
    var width = doc.width();
    if(width < 995){
      rightBar.hide();
      middleBar.css({"width":"calc(100vw - 245px)"});
    }
    else{
      rightBar.show();
      middleBar.css({"width":"calc(100vw - 525px)"});
    }
  });
}

//Carga una seccion al apretar sobre alguna pestaña
function sectionTrigger(){
  topBar.find(".topBarItem").click(function(){
    var sec = $(this).attr("section");
    if(sec != currentSection){
      showSection(sec);
    }
  });
}

//Carga el chat
function loadChat(){
  chatObj = {
    active:false,
    open:function(){
      chat.slideDown(256,function(){
        chat.find(".messages").css('height','calc(100% - 420px)');
      });
      this.active = true;
    },
    close:function(){
      chat.slideUp(256);
      chat.find(".messages").css("height","100%");
      this.active = false;
    }
  };
}
//Carga los datos del cache
function loadCache(){
  cachedImages = JSON.parse(localStorage.getItem('photos'));
  cachedPublications = JSON.parse(localStorage.getItem('publications'));
  cachedUsers = JSON.parse(localStorage.getItem('users'));
  if(cachedImages == null) cachedImages = {};
  if(cachedPublications == null) cachedPublications = {};
  if(cachedUsers == null) cachedUsers = {};
}
//Mostar modal
function loadModal(mod,callback){
  modal.load("/modals/"+ mod + ".html",function(){
    modal.fadeIn(200);
    if(callback === undefined)return;
    callback();
  });
}

//Eventos del modal
function modalEvents(){
  //modal.click(function(e){if(e.target == this) modal.fadeOut(200)});
}

//Obtener edad
function getAge(birthdate){
  var n = new Date();
  var b = new Date(birthdate);
  var dif = Math.abs(n.getTime() - b.getTime());
  var years = Math.trunc(dif / (1000 * 3600 * 24 * 365));
  return years;
}

//Obtener tiempo transcurrido
function getTransTime(moment){
  var n = new Date();
  var b = new Date(moment);
  var dif = Math.abs(n.getTime() - b.getTime());
  var sec = dif/1000;
  if(sec > 3600*24*28){
    return b.toISOString().substring(0, 10);
  }
  if(sec > 3600*24){
    return "Hace "+ Math.trunc(sec/(60*60*24))+" dia(s)";
  }
  if(sec > 3600){
    return "Hace "+ Math.trunc(sec/(60*60))+" hora(s)";
  }
  if(sec > 60){
    return "Hace "+ Math.trunc(sec/60)+" minuto(s)";
  }
  if(sec < 60){
    return "Hace unos segundos";
  }
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

//Actualiza el tiempo de las publicaciones
function refreshTime(){
  for(var i in timeElements){
    timeElements[i].element.html(getTransTime(timeElements[i].moment));
  }
  setTimeout(function(){ refreshTime() }, 60000);
}

//Carga imagen
function loadImage(e,img){
  e.src = img;
  e.onload = function(){
    $(e).removeClass( "loading" )
  }
}

//Elimina el cargando
function imageReady(e){
  $(e).removeClass( "loading" )
}

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
        _profileImage.attr("src","").addClass("loading");
        imageToDataUri(img,128,128,function(img2){
          $.ajax({
              url: '/uploadPhoto',
              type: 'POST',
              data: {img1:img,img2:img2},
              error:function(){},
              success: function(data){
                user.profileImage = data.images;
                user.photos.push(data.images);
                data.publication.photos = [data.images];
                user.publications.push(data.publication);
                saveUserData(user);
                currentProfileSection = "";
                showSection(currentSection);
                _profileImage.show();
              }
            });
          })
        });
      });
    });
  });
}
