/////////////////////////////////////////////////////////////////
// - - - - - - - - - - - REQUESTS - - - - - - - - - - - - //////
///////////////////////////////////////////////////////////////

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

//Envia una solicitud para obtener los datos del usuario o los carga desde el cache
function getUserData(callback){
  post({},"/getMyData",function(res){
    user = res;
    saveCurrentUser()
    callback();
  });
}

//Obtiene URLs de imagenes a partir de sus IDs
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

//Obtiene publicaciones a partir de sus IDs
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

//Obtiene usuarios a partir de sus IDs
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

//Obtiene chats a partir de sus IDs
function getChatsFromID(ids,element,callback){

  var s   = new Array();
  var ns  = new Array();

  for(var id in ids){
    if(isChatInCache(ids[id])){
      s.push(cachedChats[ids[id]]);
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
    post(ns,"/getChats",function(res){
      saveChatsInCache(res);
      var usr = new Array();
      for(var id in ids){
        usr.push(cachedChats[ids[id]]);
      }
      callback(usr,element);
    });
  }
}

//Obtiene chats a partir de sus IDs
function getCommentsFromID(ids,element,callback){

  var s   = new Array();
  var ns  = new Array();

  for(var id in ids){
    if(isCommentInCache(ids[id])){
      s.push(cachedComments[ids[id]]);
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
    post(ns,"/getComments",function(res){
      saveCommentsInCache(res);
      var usr = new Array();
      for(var id in ids){
        usr.push(cachedComments[ids[id]]);
      }
      callback(usr,element);
    });
  }
}

//Busca usuarios

function searchUsers(query,callback){
  post(query,"/searchUsers",function(res){
    saveUsersInCache(res);
    callback(res);
  });
}
