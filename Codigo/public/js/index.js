function muestraContraseña() {
    
    var key_attr = $('#key').attr('type');
    
    if(key_attr != 'text') {
        
        $('.checkbox').addClass('show');
        $('#key').attr('type', 'text');
        
    } else {
        
        $('.checkbox').removeClass('show');
        $('#key').attr('type', 'password');
        
    }
    
}

function recuperar(){
    $('#modal01').modal('show');
}

function crear() {
    $('#modal02').modal('show');
}

function usuario_recuperado() {
    window.alert("Usuario recuperado");
    $('#modal01').modal('hide');
}

function usuario_creado() {
    window.alert("Usuario creado");
    $('#modal02').modal('hide');
}