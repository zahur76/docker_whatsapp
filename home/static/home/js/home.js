$(document).ready(function(){

    // JS for chatbox
    
    // Remove unread messages when chat box openned and load messages
      $('.chatbox-open').click(function(){

        $(".modal").animate({scrollTop: $('#modal-focus').offset().top + 9999}, 200);
      
        let csrfToken = $('#csrfmiddlewaretoken').attr('value');
        let username = $(this).attr('value')
        let counter = $(this).attr('data-bs-target') + '-unread'
        let envelope = $(this).attr('data-bs-target') + '-envelope'

        // clear chat box and make new request
        $( ".chatbox" ).html('');

        // request all messages from authenticated user and contact
        fetch(`/message/userMessages/${username}`)
        .then((response) => {
            if (response.ok) {        
                return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
            responseJson.forEach(function(message) {
              // covert date format
              var d = new Date(message.created_at);
              var options = { year: 'numeric', month: 'long', day: 'numeric', hour12: true,
                            hour: "2-digit",
                            minute: "2-digit"};
              d = d.toLocaleDateString("en-US", options)
              let seen = 'Seen'
              if(message.message_read){
                seen = 'Seen'
              }else{
                seen = "Unseen"
              }
              if(message.sender!=username){                
                $( ".chatbox" ).append(`<div class="col-10 card pull-2 text-start h5 p-2 fst-italic chat-bg">
                ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end h6">${seen} <div class="d-inline text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div><div class="d-inline text-danger btn btn-sm p-0"> <i class="fas fa-trash"></i></div></div></div>`);
              }else{
                $( ".chatbox" ).append(`<div class="col-10 card offset-2 text-start h5 p-2 fst-italic chat-bg">
                ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end date-text"><div class="d-inline text-danger text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div></div></div>`);
              }             
            }); 
          })
          .catch((error) => {
                console.log(error)
        });       
        
        // mark messages as read
        fetch(`/message/messages_read/${username}`, { method: 'UPDATE', headers: {'X-CSRFToken': csrfToken} })
        .then((response) => {
            if (response.ok) {          
                return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
            if(responseJson.status!='no messages from sender'){
              $(`${counter}`).hide();
              $(`${envelope}`).hide(); 
            }   
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
            // clear chat box and make new request
            $( ".chatbox" ).html('');
            // reload all messages to update
            responseJson.data.forEach(function(message) {
              // covert date format
              $('textarea').val('');
              var d = new Date(message.created_at);
              var options = { year: 'numeric', month: 'long', day: 'numeric', hour12: true,
                            hour: "2-digit",
                            minute: "2-digit"};
              d = d.toLocaleDateString("en-US", options)
              let seen = 'Seen'
              if(message.message_read){
                seen = 'Seen'
              }else{
                seen = "Unseen"
              }
              if(message.sender!=username){                
                $( ".chatbox" ).append(`<div class="col-10 card pull-2 text-start h5 p-2 fst-italic chat-bg">
                ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end h6">${seen} <div class="d-inline text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div><div class="d-inline text-danger btn btn-sm p-0"> <i class="fas fa-trash"></i></div></div></div>`);
              }else{
                $( ".chatbox" ).append(`<div class="col-10 card offset-2 text-start h5 p-2 fst-italic chat-bg">
                ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end date-text"><div class="d-inline text-danger text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div></div></div>`);
              }            
            });
          })
          .catch((error) => {
                console.log(error)
          });
    });

    // clear messages from dialog box
    $(document).on('click', '.clear-message', function(){
      let messageId = $(this).attr('value')
      let username = $(this).attr('data')
      let csrfToken = $('#csrfmiddlewaretoken').attr('value');
      fetch(`/message/clear_message/${messageId}/${username}`, { method: 'DELETE', headers: {'X-CSRFToken': csrfToken} })
        .then((response) => {
            if (response.ok) {          
                return response.json();
            }
            throw new Error('Something went wrong');
          })
          .then((responseJson) => {
            
              // clear chat box and make new request
              $( ".chatbox" ).html('');
              // reload all messages to update
              responseJson.data.forEach(function(message) {
                // covert date format
                $('textarea').val('');
                var d = new Date(message.created_at);
                var options = { year: 'numeric', month: 'long', day: 'numeric', hour12: true,
                              hour: "2-digit",
                              minute: "2-digit"};
                d = d.toLocaleDateString("en-US", options)
                let seen = 'Seen'
                if(message.message_read){
                  seen = 'Seen'
                }else{
                  seen = "Unseen"
                }
                if(message.sender!=username){                
                  $( ".chatbox" ).append(`<div class="col-10 card pull-2 text-start h5 p-2 fst-italic chat-bg">
                  ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end h6">${seen} <div class="d-inline text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div><div class="d-inline text-danger btn btn-sm p-0"> <i class="fas fa-trash"></i></div></div></div>`);
                }else{
                  $( ".chatbox" ).append(`<div class="col-10 card offset-2 text-start h5 p-2 fst-italic chat-bg">
                  ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end date-text"><div class="d-inline text-danger text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div></div></div>`);
                }            
              });              
          })
          .catch((error) => {
                console.log(error)
          });
    });
});