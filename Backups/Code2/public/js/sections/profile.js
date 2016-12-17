function showProfileSection(id){
  getUsersFromID([id],null,function(data){

  var currentUser;

  if(currentSection == "users"){
    $(".userProfile").show();
    $(".usersWindow,.usersList,.bar").hide();
  }
  if(id == user._id){
    currentUser = user;
  }
  else {
    currentUser = data[0];
  }

  setUrl("/users/"+currentUser.email.split("@")[0]);

  _sections         = middleBar.find(".sections .section");
  _followOptions    = middleBar.find(".followOptions");
  _profileImageCont = middleBar.find(".profileImage");
  _fullName         = middleBar.find(".fullName");
  _newPost          = middleBar.find(".newPost");
  _career           = middleBar.find(".career");
  _age              = middleBar.find(".age");
  _city             = middleBar.find(".city");
  _msg              = middleBar.find(".message");
  _followers        = middleBar.find(".followers .number");
  _following        = middleBar.find(".following .number");
  _askpass          = middleBar.find(".askpass .number");

  _profileImage     = _profileImageCont.find("img");

  //Esconder opciones de seguimiento
  _followOptions.hide();

  //Cargar imagen de perfil
  if(currentUser.profileImage == null){
    _profileImage.attr("src",IMG_USER);
  }
  else{
    getImagesFromID([currentUser.profileImage],null,function(src){
      _profileImage.attr("src",imgSize(src[0].url,'s'));
    });
  }


  //Imprime datos del perfil

  _fullName.html(currentUser.fname + " " + currentUser.lname);
  _career.html(user.carreras[currentUser.city][currentUser.career]+" ("+currentUser.yearIn+")");
  _age.html(getAge(currentUser.birthdate)+" años");
  _followers.html(currentUser.followers.length);
  _following.html(currentUser.following.length);
  _askpass.html(currentUser.askpass);
  _city.html(currentUser.city);
  _msg.find(".text").html(safe(currentUser.message));

  if(currentUser.message.length == 0){
    _msg.find(".text").html('"Añade una biografía o mensaje"');
  }
  else{
    _msg.find(".text").html(safe(currentUser.message));
  }



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

  //Edita el mensaje
  _msg.find("img").click(function(){
    loadModal("editStory");
  });

  //Muestra la sección en el menu perfil
  function displaySection(section){

    //Le quita la sombra a los botones de la sección
    _sections.css({background:"none"}).filter("[section='"+section+"']").css({background:"#EEE"});

    //Esconde la sección anterior
    if(currentProfileSection != ""){
      middleBar.find("."+currentProfileSection).hide();
    }
    //Asigna la miniseccion a la actual
    currentProfileSection = section;

    //Guarda el html de las seccion actual y la muestra
    var curSec = middleBar.find("."+section).show();

    //CARGA LA MINI SECCIÓN FOTOS
    if(section == "photos"){

      //Limpia la sección
      curSec.empty();

      //Detecta si hay fotos
      if(currentUser.photos.length == 0) {

        //Muestra mensaje si no hay fotos
        curSec.html('<div style="font-size:30px;color:#CCC;margin:0 auto;padding:15px;text-align:center">Aún no has subido fotos</div>');
        return;
      }

      //Carga las fotos
      for(var photo in currentUser.photos){

        //Clona una imagen de los prefabs
        var clone = miniImage.clone().attr("photoID",currentUser.photos[photo]).appendTo(curSec);

        //Busca las imagenes del usuario y las añade
        getImagesFromID([currentUser.photos[photo]],clone,function(src,element){
          element.find("img").attr("onload",'loadImage(this,"'+imgSize(src[0].url,'s')+'")');

        });
      }
      curSec.append("<div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div><div class='invPhoto'></div>");

      var fotos = middleBar.find(".photos");

      //Añade evento click a las imagenes
      curSec.find(".imgCont").click(function(){
        var id = $(this).attr("photoid");
        //Muestra un modal al hacer click
        loadModal("showPhoto",function(){
          getImagesFromID([id],null,function(data){
            getUsersFromID([data[0].uploader],null,function(data1){
              modal.find("._photo").attr("src",data[0].url);
            });
          });
        });

      });
    }

    //CARGA LA MINI SECCIÓN PUBLICACIONES
    if(section == "publications"){

      //Almacena las publicaciones
      var pubs = middleBar.find(".sec.publications").empty();


      //Detecta si hay publicaciones
      if(currentUser.publications.length == 0){
        pubs.html('<div class="publication noPub"><div style="font-size:30px;color:#CCC;margin:15px;text-align:center">Aún no has publicado</div></div>').find(".noPub").show();
        return;
      }

      //Elimina el mensaje de no hay publicaciones
      pubs.find(".noPub").remove();

      //Obtiene las publicaciones a partir de los IDs
      getPublicationsFromID(currentUser.publications,pubs,function(rp, pubs) {

        //Almacena los IDs en una variable
        var ides = currentUser.publications;

        //Recorre las publicaciones
        for(var p = rp.length -1;p>=0; p--){

          //Se crea un clon del prefab publicacion
          var cloned = publication.clone();

          //Se le asigna el ID al html
          cloned.attr("publicationID",rp[p]._id);

          //Se añade el html a el contenedor de publicaciones
          cloned.appendTo(pubs).attr("publicationID",rp[p]._id).show();

          //Se le añade el actualizador de tiempo
          cloned.find(".date").html(getTransTime(rp[p].creationTime));
          timeElements.push({moment:rp[p].creationTime,element:cloned.find(".date")});

          //Le asigna el mensaje
          cloned.find(".content").html(safe(rp[p].message));


          //Imprime el numero de likes y comentarios
          cloned.find(".gus .num").html(rp[p].likes.length);
          cloned.find(".com .num").html(rp[p].comments.length);

          //Detecta si tiene un like propio
          if(rp[p].likes.indexOf(user._id) != -1){
            cloned.find(".gus").addClass("liked");
          }

          //Se obtienen sus imagenes
          getImagesFromID(rp[p].photos, cloned,function(src, element){
            element.find(".attach").append('<img class="imageAdded loading" onload="imageReady(this)" src="'+src[0].url+'">');
          });

          //Se obtiene su creador
          getUsersFromID([rp[p].creator],cloned,function(src, element){
            element.find(".fullname").html(src[0].fname + " " + src[0].lname);

            //Se obtiene la imagen de perfil del creador
            getImagesFromID([src[0].profileImage],element,function(src1,element1){
              element1.find(".profImage").attr('src',imgSize(src1[0].url,'s'));
            });
          });
        }
      });
    }
  }

  //Añade el evento click a las mini secciones
  _sections.on("click",function(){
    displaySection($(this).attr("section"));
  });

  //Muestra las publicaciones por defecto
  displaySection("publications");
  });
}
