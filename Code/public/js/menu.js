var currentSection = "users";
var currentProfileSection = "publications";
$(document).ready(function(){
  //-------------------------------------------------------------------------
  //-------------------------------------------------------------------------
  //CAMBIEN EL "profile" POR EL NOMBRE DE ARCHIVO DE SU SECCIÓN (SIN EL .html)
  //-------------------------------------------------------------------------
  //-------------------------------------------------------------------------

  showSection(currentSection); // < - ESTE DEBEN CAMBIAR


  $( window ).resize(function(size) {
    var width = $(document).width();
    if(width < 995){
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
  $(".blackBackground .close").click(function(){
    $(".blackBackground,.modal").fadeOut(200);
  })
});

function showSection(id){
  currentSection = id;
  $(".middleBar").hide().load(id + ".html",function(){
    $(this).fadeIn(200);

    //Profile
    $(".newPost").click(function(){
      $(".blackBackground,.modal").fadeIn(200);
    })
    if(currentSection == "profile"){
      function displaySection(section){
        $(".sections .section").css({background:"none"});
        $(".sections [section='"+section+"']").css({background:"#EEE"});
        if(section != currentProfileSection){
          $("."+currentProfileSection).hide();
          $("."+section).show();
        }
        currentProfileSection = section;
      }
      $(".sections .section").click(function(){
        displaySection($(this).attr("section"));
      });
      displaySection(currentProfileSection);
    }


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
