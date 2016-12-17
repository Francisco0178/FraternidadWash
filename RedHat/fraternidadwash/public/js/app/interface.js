
////////////////////////////////////////////////////////////
// - - - - - - - - - - - INTERFACE - - - - - - - - - - - //
//////////////////////////////////////////////////////////

//Mostar modal
function loadModal(mod,callback){
  modal.load("/modals/"+ mod + ".html",function(){
    modal.fadeIn(200);
    if(callback === undefined)return;
    callback();
  });
}

//Carga el chat
function loadChat(){

  chat.find(".chatInput input").keypress(function(e){
    if(e.which == 13){
      send("chatMessage",{id:currentChatID,text:$(this).val(),from:user._id,files:[],photos:[],seenBy:[user._id]});
      $(this).val('');
    }
  });

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

  printChats();

}

//Actualiza el tiempo de las publicaciones
function refreshTime(){
  for(var i in timeElements){
    timeElements[i].element.html(getTransTime(timeElements[i].moment));
  }
  setTimeout(function(){ refreshTime() }, 60000);
}

//Actualiza el tiempo de las publicaciones
function clearConsole(){
  console.clear();
  setTimeout(function(){ clearConsole() }, 1000);
}
//clearConsole();

function printChats(){

  var messages = chatWindow.find(".messages");
  var cht = chatMessages;

  if(user.chats.length == 0){
    messages.html('<div style="font-size:13px;color:#CCC;padding-top:8px;text-align:center">Sin conversaciones</div>');
  }
  else{
    getChatsFromID(user.chats,null,function(data,el){
      for(var c in data){
        if(data[c].messages.length == 0 && data[c].creator != user._id ){
          break;
        }
        var conta = contact.clone();
        conta.attr("chatID",data[c]._id);
        conta.click(function(){
          chat.find(".chatName").html($(this).find(".contactName").html());
          cht.empty();
          var idd = $(this).attr("chatID");
          currentChatID = idd;
          var msgs = cachedChats[idd].messages;
          if(msgs.length > 0){
            for(var m in msgs){
              addMessage(msgs[m]);
            }
          }
          chatObj.open();
          chatMessages.css({opacity:0}).animate({ scrollTop: chatMessages.prop('scrollHeight') }, 10,function(){
            $(this).css({opacity:1});
          });
        });
        if(data[c].messages.length == 0){
          conta.find(".lastMessage").html("Sin mensajes");
          conta.find(".counter").hide();
        }
        else{
          conta.find(".lastMessage").html(safe(data[c].messages[data[c].messages.length -1].text));
        }
        var us;
        for(var i in data[c].integrants){
          if(data[c].integrants[i]!=user._id){
            us = data[c].integrants[i];
          }
        }
        getUsersFromID([us],conta,function(usr){
          messages.empty();
          conta.find(".contactName").html(safe(usr[0].fname + " " +usr[0].lname));
          conta.appendTo($(messages));
          if(usr[0].profileImage == null){
            conta.find(".contactImage").attr("src",IMG_USER);
          }
          else{
            getImagesFromID([usr[0].profileImage],conta,function(img){
              conta.find(".contactImage").attr("src",imgSize(img[0].url,'s'));
            })
          }
        });
      }
    });
  }
}

function globalEvents(){

  //Like publication
  middleBar.on("click",".infoBar .gus",function(){
    send("likePublication",$(this).parent().parent().attr("publicationID"))
  });

  //Show likes
  middleBar.on("mouseover",".infoBar .gus",function(){
    //$(this).parent().parent().attr("publicationID");
  });

  //Dropdown de comentario
  modal.on("click",".comms .options",function(event){

    //Previene que se cierre automaticamente
    event.stopPropagation();

    var parent = $(this).parent();
    var id = parent.parent().parent().attr("publicationID");
    var dd = pubDropdown.clone().append('<div class="btn delete">Eliminar</div>').show().css({top:22,right:1,"z-index":100})
    parent.append(dd);
    dd.find(".delete").click(function(){
      send("deleteComment",{id:$(this).parent().parent().attr("commentID"),pid:id});
    });
  });

  //Muestra los comentarios
  middleBar.on("click",".infoBar .com",function(){
    var id = $(this).parent().parent().attr("publicationID");
    loadModal("comments",function(){
      $(".modal.comments").attr("publicationID",id);
      getCommentsFromID(cachedPublications[id].comments,null,function(data){
        if(data.length == 0){
          $(".modal .comms").html("<div class='noComms'>Nadie ha comentado</div>");
          return;
        }
        for(var c in data){
          var com = comment.clone();
          com.find(".text").html(safe(data[c].text));
          com.attr("commentID",data[c]._id);
          com.find(".time").html(getTransTime(data[c].time));
          if(data[c].creator != user._id){
            com.find(".options").hide();
          }
          com.appendTo(".modal .comms");
          modal.find(".comms").animate({ scrollTop: modal.find(".comms").prop('scrollHeight') + 1000 }, 0);
          getUsersFromID([data[c].creator],com,function(data1,com){
            com.find(".fullname").html(data1[0].fname +" "+ data1[0].lname);
            if(data1[0].profileImage == null){
              com.find(".profImg").attr("src",IMG_USER);
            }
            else{
              getImagesFromID([data1[0].profileImage],com,function(data2,com){
                com.find(".profImg").attr("src",imgSize(data2[0].url,'s'));
              });
            }
          });
        }
      });
    });
  });

  $(window).click(function(){
    $(".dropdown").remove();
  });

  //Dropdow de publicaciones
  middleBar.on("click",".publication .options",function(event){

    //Previene que se cierre automaticamente
    event.stopPropagation();

    //Guarda la publicacion en una variable
    var parent = $(this).parent().parent();

    //Si el menu ya esta abierto se detiene la funcion
    if(parent.find(".dropdown")[0]) return;

    //Se crea un clon de menu y se añade a la publicación
    var menu = pubDropdown.clone().append('<div class="btn edit">Editar mensaje</div><div class="btn delete">Eliminar</div>').show().appendTo(parent);

    menu.find(".delete").click(function(){
      var id = parent.attr("publicationID");
      loadModal("alert",function(){
        modal.find(".sve").click(function(){
          send("deletePublication",{id:id});
          modal.empty().fadeOut(200);
        });
      });
    });

    menu.find(".edit").click(function(){
      var id = parent.attr("publicationID");
      loadModal("editPublication",function(){
        modal.find(".text").val(cachedPublications[id].message);
        modal.find(".sve").click(function(){
          send("editPublication",{id:id,message:modal.find(".text").val()});
          _msg.children(".text").html(safe(user.message));
          modal.empty().fadeOut(200);
        });
      })
    });


  });
  //Dropdow de logout
  topBar.find(".logout").click(function(event){

    //Previene que se cierre automaticamente
    event.stopPropagation();

    //Guarda la publicacion en una variable
    var parent = $(this).parent();

    //Si el menu ya esta abierto se detiene la funcion
    if(parent.find(".dropdown")[0]) return;

    //Se crea un clon de menu y se añade a la publicación
    var menu = pubDropdown.clone().css({top:'50px',right:'13px','box-shadow':'0px 0px 1px 0px gray'}).append('<div style="white-space: nowrap;margin-left:10px;margin-right:10px" class="btn lo">Cerrar Sesión</div>').show().appendTo(parent);

    menu.find(".lo").click(function(){
      window.location = "/logout"
    })

  });
}
function addMessage(msg){
  if(currentChatID == msg.id){
    chatMessages.animate({ scrollTop: chatMessages.prop('scrollHeight') }, 10);
    var hms = chatMessage.clone();
    hms.find(".texto").html(safe(msg.text));
    if(msg.from == user._id){
      hms.addClass("messageA");
      if(msg.seenBy.length > 1){
        hms.find(".view").html("✓ 3:46");
      }
      else{
        hms.find(".view").html("3:46");
      }
    }
    else{
      hms.addClass("messageB");
      hms.find(".view").html("3:46");
    }
    hms.appendTo($(chatMessages));
  }
}
//Eventos del modal
function modalEvents(){
  //modal.click(function(e){if(e.target == this) modal.fadeOut(200)});
}

//Activa el responsive de la pagina
function responsive(){
  rsize();
  win.resize(function() {
    rsize()
  });
  function rsize(){
    var width = doc.width();
    if(width < 995){
      rightBar.hide();
      middleBar.css({"width":"calc(100vw - 245px)"});
    }
    else{
      rightBar.show();
      middleBar.css({"width":"calc(100vw - 525px)"});
    }
  }
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
