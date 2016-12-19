function showConfigurationsSection() {

  $('#nname').html(user.fname + ' ' + user.lname);
  passcod(user.pass);
  $('#ncareer').html(user.carreras[user.city][user.career]);
  $('#ncity').html(user.city);
  $('#nyear').html(user.yearIn);
  $('#ndate').html(user.birthdate.split('T')[0]);

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
}

//Modales de la seccion de datos personales

function modal_nombre() {
  loadModal('nameChange');
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

//Modales de codificacion de contraseñas

function passcod(pass) {
  var html = "*";
  for (var i = 1; i < pass.length; i++) {
    html += "*";
  }
  $('#npass').html(html);
}

// Bloqueos Fraternos

function block_fraterno() {
    var conf = $("#general");
    var _name = conf.find(".ffraterno");
    var _ap = conf.find(".lfraterno");
    post({blockedUsers:conf.find(".ffraterno").val() + ' ' + conf.find(".lfraterno").val()},'/updateUser',function(res) {
      user.blockedUsers=conf.find(".ffraterno").val() + ' ' + conf.find(".lfraterno").val();
      alert("Fraterno: " + conf.find(".ffraterno").val() + ' ' + conf.find(".lfraterno").val() + " bloqueado");
      $(".ffraterno").html(' ');
      $(".lfraterno").html(' ');
    });

}