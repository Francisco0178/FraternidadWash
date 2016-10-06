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


$(document).ready(function(){

});
