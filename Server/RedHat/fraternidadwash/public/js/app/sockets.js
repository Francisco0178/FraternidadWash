function startSockets(){
  var port = user.host + ":8000";
  if(port.length<25){
    port = null;
  }
  io = io(port);
  io.on('deletePublication', function(data){
     if(data.user == user._id){
       user.publications.splice(user.publications.indexOf(data.publication));
       saveCurrentUser();
     }
     if(data.user in cachedUsers){
       cachedUsers[data.user].publications.splice(cachedUsers[data.user].publications.indexOf(data.publication));
       saveCurrentUsers();
     }
     $("[publicationID='"+data.publication+"']").hide(300);
  });

  io.on('chatMessageArrived',function(data){
    if(!isChatInCache(data.id)){
      user.chats.push(data.id);
      saveCurrentUser();
      printChats();
      return;
    }
    else{
      if(cachedChats[data.id].messages.length == 0){
        cachedChats[data.id].messages.push(data);
        saveChatsInCache();
        printChats();
        return;
      }
    }
    $("[chatID='"+data.id+"']").find(".lastMessage").html(safe(data.text));
    cachedChats[data.id].messages.push(data);
    saveChatsInCache();
    addMessage(data);
  });

  io.on('likePublication', function(data){
    if(!isPublicationInCache(data.id))return;
    if(data.add){
      cachedPublications[data.id].likes.push(data.userID);
      savePublicationsInCache();
      var pub = $("[publicationid='"+data.id+"']").find(".gus");
      pub.find(".num").html(cachedPublications[data.id].likes.length);
      if(data.userID == user._id){
        pub.addClass("liked");
        pub.find(".name").html("Te gusta")
      }
    }
    else{
      cachedPublications[data.id].likes.splice(cachedPublications[data.id].likes.indexOf(data.userID),1);
      savePublicationsInCache();
      var pub = $("[publicationid='"+data.id+"']").find(".gus");
      pub.find(".num").html(cachedPublications[data.id].likes.length);
      if(data.userID == user._id){
        pub.removeClass("liked")
        pub.find(".name").html("Me gusta")
      }
    }
  });

  io.on('editPublication', function(data){
    var pub = $("[publicationid='"+data.id+"']");
    cachedPublications[data.id].message = data.message;
    savePublicationsInCache();
    pub.find(".content").html(safe(data.message));
  });

  io.on('loadingPublication', function(percent){
    modal.find(".bar").css({width:percent});
    modal.find(".percent").html(percent);
  });


  io.on('newPublication', function(data){
    if(currentUser._id == data.to && !imgurError){
      modal.fadeOut(200);
    }
    var pubs = middleBar.find(".sec.publications");

    //Elimina el mensaje de no hay publicaciones
    pubs.find(".noPub").remove();

    //Obtiene las publicaciones a partir de los IDs
    getPublicationsFromID([data.pid],pubs,function(rp, pubs) {


      //Se crea un clon del prefab publicacion
      var cloned = publication.clone();

      //Se le asigna el ID al html
      cloned.attr("publicationID",rp[0]._id);

      //Se añade el html a el contenedor de publicaciones
      cloned.prependTo(pubs).attr("publicationID",rp[0]._id).show();

      //Se le añade el actualizador de tiempo
      cloned.find(".date").html(getTransTime(rp[0].creationTime));
      timeElements.push({moment:rp[0].creationTime,element:cloned.find(".date")});

      //Le asigna el mensaje
      cloned.find(".content").html(safe(rp[0].message));


      //Imprime el numero de likes y comentarios
      cloned.find(".gus .num").html(rp[0].likes.length);
      cloned.find(".com .num").html(rp[0].comments.length);

      //Detecta si tiene un like propio
      if(rp[0].likes.indexOf(user._id) != -1){
        cloned.find(".gus").addClass("liked");
      }

      //Detecta si tiene url
      if('url' in rp[0]){
        if(rp[0].url.length != 0){
          urlCard(rp[0].url,false,function(da,cloned){
            cloned.find(".urls").append(da);
          },cloned);
        }
      }

      //Se obtienen sus imagenes
      getImagesFromID(rp[0].photos,{element:cloned,pub:rp[0]},function(src, data){
        if(data.pub.type == "profileImage"){
          data.element.find(".attach").append('<img style="height:300px;min-width:'+iW(300,src[0].height,src[0].width)+'" class="imageAdded loading btn" onload="imageReady(this)" src="'+src[0].url+'">');
        }
        else{
          data.element.find(".type").html("Ha publicado")
          if(data.pub.photos.length == 1){
            data.element.find(".attach").append('<img style="height:300px;min-width:'+iW(300,src[0].height,src[0].width)+'"  class="imageAdded loading hidden btn" onload="imageReady(this)" src="'+src[0].url+'">');
          }
          else{
            var total = data.pub.photos.length;
            var limit = data.pub.photos.length;
            if(total > 5){
              limit = 5;
            }
            for(var f = 0; f<limit;f++){
              data.element.find(".attach").append('<img style="min-width:'+iW(100,src[0].height,src[0].width)+'"  class="miniImageAdded hidden loading btn" onload="imageReady(this)" src="'+src[f].url+'m">');
            }
            if(total > 5){
              data.element.find(".attach").append('<div style="min-width:'+iW(100,src[0].height,src[0].width)+'"  class="miniMoreImageAdded btn">'+(total - 5)+'</div>');
            }
          }
        }
      });


      //Se obtiene su creador
      getUsersFromID([rp[0].creator],cloned,function(src, element){
        if(src[0]._id == user._id){
          user.publications.push(rp[0]._id);
        }
        cachedUsers[src[0]._id].publications.push(rp[0]._id);
        element.find(".fullname").html(src[0].fname + " " + src[0].lname);

        //Se obtiene la imagen de perfil del creador
        if(src[0].profileImage == null){
          element.find(".profImage").attr('src',IMG_USER);
        }
        else{
          getImagesFromID([src[0].profileImage],element,function(src1,element1){
            element1.find(".profImage").attr('src',imgSize(src1[0].url,'s'));
          });
        }
      });
    });
  });

  io.on('deleteComment', function(data){
    $("[commentid='"+data.id+"']").hide(500);
    if(data.pid in cachedPublications){
      var index = cachedPublications[data.pid].comments.indexOf(data.id);
      if(index != -1){
        cachedPublications[data.pid].comments.splice(index,1);
        saveCurrentPublications();
        $("[publicationid='"+data.pid+"']").find(".com .num").html(cachedPublications[data.pid].comments.length);
      }
    }
    if(data.id in cachedComments){
      delete cachedComments[data.id];
      saveCurrentComments();
    }
  });

  io.on('newComment', function(data){
    var pub = $("[publicationid='"+data.pubId+"']");
    pub.find(".noComms").remove();
    cachedPublications[data.pubId].comments.push(data.id)
    savePublicationsInCache();
    pub.find(".com .num").html(cachedPublications[data.pubId].comments.length);
    getCommentsFromID([data.id],pub,function(data3){
      var com = comment.clone();
      com.find(".text").html(safe(data3[0].text));
      com.find(".time").html(getTransTime(data3[0].time));
      pub.find(".comms").append(com);
      com.attr("commentID",data3[0]._id);
      if(data3[0].creator == user._id){
        pub.find(".comms").animate({ scrollTop: pub.find(".comms").prop('scrollHeight') + 1000 }, 1000);
      }
      else{
        if(pub.find(".comms").scrollTop()>pub.find(".comms").prop('scrollHeight') - 381){
          pub.find(".comms").animate({ scrollTop: pub.find(".comms").prop('scrollHeight') + 1000 }, 1000);
        }
      }
      getUsersFromID([data3[0].creator],com,function(data1,com){
        com.find(".fullname").html(data1[0].fname +" "+ data1[0].lname);
        if(data1[0].profileImage == null){
          com.find(".profImg").attr('src',IMG_USER);
        }
        else{
          getImagesFromID([data1[0].profileImage],com,function(data2,com){
            com.find(".profImg").attr("src",imgSize(data2[0].url,'s'));
          });
        }
      });
    });
  });
}


function send(chanel,data){
  var msg = {email:user.email,pass:user.pass,data:data};
  io.emit(chanel, msg);
}
