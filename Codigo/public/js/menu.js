$(document).ready(function(){
  var i = 0;
  var dragging = false;
     $('#dragbar').mousedown(function(e){
         e.preventDefault();

         dragging = true;
         var main = $('#main');
         var dragbar = $("#dragbar");
         var ghostbar = $('<div>',
                          {id:'ghostbar',
                           css: {
                                  height: dragbar.outerHeight(),
                                  width: dragbar.outerWidth(),
                                  top: main.offset().top,
                                  bottom: main.offset().bottom
                                 }
                          }).appendTo('body');

          $(document).mousemove(function(e){
            ghostbar.css("top",e.pageY+2);
         });
      });

     $(document).mouseup(function(e){
         if (dragging)
         {
             $('#sidebar').css("height",e.pageY+2);
             $('#main').css("top",e.pageY+2);
             $('#ghostbar').remove();
             $(document).unbind('mousemove');
             dragging = false;
         }
      });
});
