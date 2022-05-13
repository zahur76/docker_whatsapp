$(document).ready(function(){

    // JS for chatbox
    
    // Remove unread messages when chat box openned
    $('.chatbox-open').click(function(){
        let csrfToken = $('#csrfmiddlewaretoken').attr('value');
        let username = $(this).attr('value')
        let counter = $(this).attr('data-bs-target') + '-unread'
        let envelope = $(this).attr('data-bs-target') + '-envelope'        
        
        console.log(username)
        fetch(`/message/messages_read/${username}`, { method: 'UPDATE', headers: {'X-CSRFToken': csrfToken} })
        .then((response) => {
            if (response.ok) {          
                return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
            $(`${counter}`).hide();
            $(`${envelope}`).hide();  
          })
          .catch((error) => {
                console.log(error)
          });
    })
});