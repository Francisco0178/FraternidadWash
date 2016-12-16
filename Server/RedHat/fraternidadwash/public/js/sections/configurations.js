function showConfigurationsSection() {

   $('#nname').html(user.fname + ' ' + user.lname);
   $('#ncorreo').html(user.email);

  //Ocultar secciones

  $('#datos').click(function() {
    $('.oculto').hide();
    $('.confListDos').show();
  });
  $('#privacidad').click(function() {
    $('.oculto').hide();
    $('.confListTres').show();
  });
  $('#bloqueos').click(function() {
    $('.oculto').hide();
    $('.confListCuatro').show();
  });
  $('#notificaciones').click(function() {
    $('.oculto').hide();
    $('.confListCinco').show();
  });

  //Modales de la seccion de datos personales


}

function modal_nombre() {
  loadModal('nameChange');
  $('.nnombre').html(user.fname);
  $('.napellido').html(user.lname);
}
function modal_correo() {
  loadModal('mailChange');
}
function modal_cont() {
  loadModal('passChange');
}
function modal_carrera() {
  loadModal('carreraChange');
}
function modal_ciudad() {
  loadModal('cityChange');
}
function modal_ingreso() {
  loadModal('yearChange');
}
function modal_fecha() {
  loadModal('dateChange');
}

//Modales de la seccion de bloqueos

function lock_fraterno() {
  loadModal('lockFraterno');
}
function list_lock() {
  loadModal('listLockFraterno');
}
function list_message() {
  loadModal('listLockMessage');
}
function list_label() {
  loadModal('listLockLabel');
}
function list_invitation() {
  loadModal('listLockInvitation');
}
function list_publications() {
  loadModal('listLockPublication');
}