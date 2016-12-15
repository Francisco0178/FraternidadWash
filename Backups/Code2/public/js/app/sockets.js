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
        getImagesFromID([data1[0].profileImage],com,function(data2,com){
          com.find(".profImg").attr("src",imgSize(data2[0].url,'s'));
        });
      });
    });
  });
}


function send(chanel,data){
  var msg = {email:user.email,pass:user.pass,data:data};
  io.emit(chanel, msg);
}
