$(document).ready(function(){

    // JS for chatbox
    
    // Remove unread messages when chat box openned
    $('.chatbox-open').click(function(){
        let csrfToken = $('#csrfmiddlewaretoken').attr('value');
        let username = $(this).attr('value')
        let counter = $(this).attr('data-bs-target') + '-unread'
        let envelope = $(this).attr('data-bs-target') + '-envelope'
        let loggedInUSer = $('#logged-in-user').attr('value');
        console.log(loggedInUSer)

        fetch(`/message/userMessages/${loggedInUSer }`)
        .then((response) => {
            if (response.ok) {          
                return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
            console.log(responseJson) 
          })
          .catch((error) => {
                console.log(error)
        });
        
        
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

    // submit message via ajax
    let form = $( ".submit-message" )
    form.submit(function(event) {
        event.preventDefault();
        let username = $.trim(this.username.value)
        let message = $.trim(this.message.value)
        let csrfToken = $('#csrfmiddlewaretoken').attr('value');

        let data = {
            'username': username,
            'message': message,
        }

        fetch(`/message/send_message`, { method: 'POST', headers: {'X-CSRFToken': csrfToken}, body: JSON.stringify(data)})
        .then((response) => {
            if (response.ok) {          
                return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
            console.log(responseJson)
          })
          .catch((error) => {
                console.log(error)
          });

    });
});