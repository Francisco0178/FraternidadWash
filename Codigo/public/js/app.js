var basePath = "http://146.83.216.162:8080/";
var usuarios;
var currentid;
//cuando el documentos ya este cargado
//$ = JQuery
//get: obtener recurso
//put: actualiza recurso
//post: enviar un recurso
//delete: eliminar un recurso
$(document).ready(function(){
	$.ajax({
		url: basePath + "users/",
		type: "GET",
		dataType: "JSON",
		success: function(data){
			var users=data.data; //estructura del data a la que se puede ingresar
			usuarios = users;
			console.log(users);
			var php = '<div class="container-fluid">'+'<div class="row">';
			for(var i=0;i<users.length;i++){
				php=php + '<div id="'+users[i]._id+'" class="col-sm-4 col-xs-4 col-md-4 col-lg-4 col-xl-4">'+
								'<div class="card">'+
								  '<div class="card-block">'+
								    '<h4 class="card-title">'+users[i].first_name+' '+users[i].last_name+'</h4>'+
								    '<h6 class="card-subtitle text-muted">'+users[i].comment+'</h6>'+
								  '</div>'+
								  '<center><img src="'+users[i].img+'" class="img-circle" alt="'+users[i].comment+'"></center>'+
								  '<div class="modal-footer">'+
								    '<p class="card-text"></p>'+
								    '<button id="edit" href="#" class="btn btn-primary" onclick="mostrar_modal('+i+')" class="card-link">Editar Usuario</button>'+
								    '<button id="elim" href="#" class="btn btn-secondary" onclick="eliminado('+i+')" class="card-link">&nbspEliminar Usuario</button>'+
								  '</div>'+
								'</div>'+
  						'</div>';
			}
			php = php +'</div>'+'</div>';
			$("body").append(php);

		},
		error: function() {
			
		}

	});
	
});

function mostrar_modal(id){
	currentid = id;
	//$('#ids').val(usuarios[currentid]._id);
	$('#nombre').val(usuarios[currentid].first_name);
	$('#apellido').val(usuarios[currentid].last_name);
	$('#comentario').val(usuarios[currentid].comment);
	$('#imagen').val(usuarios[currentid].img);
	$('#Modal02').modal('show');
}

function desplegar() {
	$('.dropdown-toggle').dropdown();
}


function crear_modal(){
	$('#Modal01').modal('show');
}

function crear(){
	$.ajax({
		url: basePath + "users/",
		type: "POST",
		dataType: "JSON",
		data:{
			first_name:$('#nombrenuevo').val(),
			last_name:$('#apellidonuevo').val(),
			comment:$('#comentarionuevo').val(),
			img:$('#imagennueva').val()
		},
		success: function(data){
			alert("Usuario Creado: " + data.data._id);
			location.reload();
		},
		error: function(){
			
		}
	});
}

function modificar(){
	$.ajax({
		url: basePath + "users/" + usuarios[currentid]._id,
		type: "PUT",
		dataType: "JSON",
		data:{
			first_name:$('#nombre').val(),
			last_name:$('#apellido').val(),
			comment:$('#comentario').val(),
			img:$('#imagen').val()
		},
		success: function(data){
			alert("Usuario Modificado");
			location.reload();
		},
		error: function(){

		}
	});
}

function eliminado(id){
	currentid = id;
	$.ajax({
		url: basePath + "users/" + usuarios[currentid]._id,
		type: "DELETE",
		dataType: "JSON",
		data:{
			_id:$('#id').val()
		},
		success: function(data){
			alert("Usuario Eliminado");
			location.reload();
		},
		error: function(){

		}
	});
}

function ver_autor(){
	alert("Creado por: \n José Luis Acuña Oyarce");
}

/**function buscar_usuario(nombre){
	data:$('#usuario').val(nombre);
	$.ajax({
		url: basePath + "users/" +,
		type: "POST",
		dataType: "JSON",
		success: function(data){
			var users=data.data; //estructura del data a la que se puede ingresar
			var php = '<div class="container-fluid">'+'<div class="row">';
			for(var i=0;i<users.length;i++){
				php=php + '<div id="'+users[i]._id+'">'+
								'<div class="card">'+
								  '<div class="card-block">'+
								    '<h4 class="card-title">'+users[i].first_name+' '+users[i].last_name+'</h4>'+
								    '<h6 class="card-subtitle text-muted">'+users[i].comment+'</h6>'+
								  '</div>'+
								  '<img src="'+users[i].img+'" alt="'+users[i].comment+'">'+
								  '<div class="card-block">'+
								    '<p class="card-text"></p>'+
								    '<a href="#" onclick="mostrar_modal('+i+')" class="card-link">&nbspEditar Usuario</a>'+
								    '<a href="#" onclick="eliminado('+i+')" class="card-link">&nbspEliminar Usuario</a>'+
								  '</div>'+
								'</div>'+
  						'</div>';
			}
			php = php +'</div>'+'</div>';
			$("body").append(php);
			alert("Usuario Encontrado");
			location.reload();

		},
		error: function(){

		}
	});
}*/