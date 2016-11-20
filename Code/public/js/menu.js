$(document).ready(function(){
  //-------------------------------------------------------------------------
  //-------------------------------------------------------------------------
  //CAMBIEN EL "profile" POR EL NOMBRE DE ARCHIVO DE SU SECCIÓN (SIN EL .html)
  //-------------------------------------------------------------------------
  //-------------------------------------------------------------------------

  showSection("questions"); // < - ESTE DEBEN CAMBIAR

  $( window ).resize(function(size) {
    var width = $(document).width();
    if(width < 965){
      $(".rightBar").hide();
      $(".middleBar").css({'min-width':'450px',"width":"calc(100vw - 245px)"});
    }
    else{
      $(".rightBar").show();
      $(".middleBar").css({'min-width':'450px',"width":"calc(100vw - 525px)"});
    }
  });
  $(".topBarItem").click(function(){
    showSection($(this).attr("section"));
  })
});

function showSection(id){
  $(".middleBar").hide().load(id + ".html",function(){
    $(".btn").click(function(){
      $(".list").show(300);
    });
    $(document).click(function(evento){
      if(!$(".btn").is(evento.target)){
        $(".list").hide(300);
      }
    });
    $(this).fadeIn(200);
  });
  $(".topBarItem .selectionLine").hide(200);
  $(".topBarItem[section='"+id+"']").children(".selectionLine").show(200);
}
var chat = {
  active:false,
  open:function(){
    $(".chat").slideDown(256,function(){
      $(".messages").css('height','calc(100% - 420px)');
    });
    this.active = true;
  },
  close:function(){
    $(".chat").slideUp(256);
    $(".messages").css("height","100%");
    this.active = false;
  }
};
