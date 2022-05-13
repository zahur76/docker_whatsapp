$(document).ready(function(){

    // Required to display toasts //    
    $('.toast').toast('show');

    /* Function to clear flash messages after 3's*/  
    setTimeout(function(){
        $(".message-container").hide("slow");
    }, 3000 ); // 5 secs
   
})