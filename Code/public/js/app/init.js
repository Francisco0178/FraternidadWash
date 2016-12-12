

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
  chatMessages     = chat.find(".chatMessages");
  publication      = prefabs.find(".publication");
  miniImage        = prefabs.find(".imgCont");
  pubDropdown      = prefabs.find(".dropdown");
  userCard         = prefabs.find(".userCard");
  contact          = prefabs.find(".contact");
  chatMessage      = prefabs.find(".normalMessage");
  comment          = prefabs.find(".comm");



  //Añade eventos
  modalEvents();

  //Añade eventos globales
  globalEvents();

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

    //Inicia los sockets
    startSockets();

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

    if(currentSection == "profile")showProfileSection(user._id);  //Mostrar el perfil
    if(currentSection == "users")showUsersSection();      //Mostrar los usuarios
  });

  //Muestra el cambio de seccion en la barra superior
  topBar.find(".selectionLine").hide(200);
  topBar.find(".topBarItem[section='"+id+"']").children(".selectionLine").show(200);
}
