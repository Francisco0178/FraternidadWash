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
    $('#bmsg').hide();
    $('#labels').hide();
    $('#invs').hide();
    $('#bpub').hide();
    $('#bpreg').hide();
    sel_bloqueos();
  });
  $('#notificaciones').click(function() {
    $('.oculto').hide();
    $('.confListCinco').show();
  });
}

//Mostar Usuarios
function sel_bloqueos() {
  var sel = $('.selfrat');
  var query = {'yearIn':$('#nyear').val()};
  var lleno;
  searchUsers(query,function(usrs){
    var vacio = "<option value='' disabled selected>Nombre del Fraterno a Bloquear</option>";
    if(usrs.length === 0){
        sel.html(vacio);
        return;
    }
    for(var usr in usrs){
      lleno += '<option value="'+usrs[usr]._id+'">'+usrs[usr].fname+ ' ' +usrs[usr].lname+'</option>';
    }
    sel.html(lleno);
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
function list_questions() {
  loadModal('listLockQuestion');
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

//1) Bloquear en general a los fraternos

function block_fraterno() {
    var conf = $("#general");
    var _name = conf.find(".ffraterno");
    _name.on("change",function() {
      post(_name.val(),'/searchUsers',function(req) {
        console.log(req);
      });
    });
}

//2) Bloquear a los fraternos para que inviten a uno para los eventos

function block_invitacion() {
    var conf = $("#invs");
    var _name = conf.find(".finvitacion");
    var _ap = conf.find(".linvitacion");
    post({blockedInv:conf.find(".finvitacion").val() + ' ' + conf.find(".linvitacion").val()},'/updateUser',function(res) {
      user.blockedInv=conf.find(".finvitacion").val() + ' ' + conf.find(".linvitacion").val();
      alert("Fraterno: " + conf.find(".finvitacion").val() + ' ' + conf.find(".linvitacion").val() + " bloqueado para enviarme invitaciones");
      $(".finvitacion").val('');
      $(".linvitacion").val('');
    });

}

//3) Bloquear a los fraternos para que no me etiqueten

function block_label() {
    var conf = $("#labels");
    var _name = conf.find(".fetiquetar");
    var _ap = conf.find(".letiquetar");
    post({blockedLabel:conf.find(".fetiquetar").val() + ' ' + conf.find(".letiquetar").val()},'/updateUser',function(res) {
      user.blockedLabel=conf.find(".fetiquetar").val() + ' ' + conf.find(".letiquetar").val();
      alert("Fraterno: " + conf.find(".fetiquetar").val() + ' ' + conf.find(".letiquetar").val() + " bloqueado para etiquetarme");
      $(".fetiquetar").val('');
      $(".letiquetar").val('');
    });

}

//4) Bloquear a los fraternos para que no me envien mensajes del chat

function block_msg() {
    var conf = $("#bmsg");
    var _name = conf.find(".fmensajes");
    var _ap = conf.find(".lmensajes");
    post({blockedMsg:conf.find(".fmensajes").val() + ' ' + conf.find(".lmensajes").val()},'/updateUser',function(res) {
      user.blockedMsg=conf.find(".fmensajes").val() + ' ' + conf.find(".lmensajes").val();
      alert("Fraterno: " + conf.find(".fmensajes").val() + ' ' + conf.find(".lmensajes").val() + " bloqueado para enivarme mensajes");
      $(".fmensajes").val('');
      $(".lmensajes").val('');
    });

}

//5) Bloquear a los fraternos para que no ver sus publicaciones

function block_pub() {
    var conf = $("#bpub");
    var _name = conf.find(".fpublicacion");
    var _ap = conf.find(".lpublicacion");
    post({blockedPub:conf.find(".fpublicacion").val() + ' ' + conf.find(".lpublicacion").val()},'/updateUser',function(res) {
      user.blockedPub=conf.find(".fpublicacion").val() + ' ' + conf.find(".lpublicacion").val();
      alert("Fraterno: " + conf.find(".fpublicacion").val() + ' ' + conf.find(".lpublicacion").val() + " bloqueado para ver sus publicaciones");
      $(".fpublicacion").val('');
      $(".lpublicacion").val('');
    });

}

//6) Bloquear a los fraternos para que no me lleguen las preguntas

function block_preg() {
    var conf = $("#bpreg");
    var _name = conf.find(".fpregunta");
    var _ap = conf.find(".lpregunta");
    post({blockedPub:conf.find(".fpregunta").val() + ' ' + conf.find(".lpregunta").val()},'/updateUser',function(res) {
      user.blockedPub=conf.find(".fpregunta").val() + ' ' + conf.find(".lpregunta").val();
      alert("Fraterno: " + conf.find(".fpregunta").val() + ' ' + conf.find(".lpregunta").val() + " bloqueado para que me pregunten");
      $(".fpregunta").val('');
      $(".lpregunta").val('');
    });

}