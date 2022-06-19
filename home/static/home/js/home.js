$(document).ready(function(){

  // JS for chatbox
 
  // Remove unread messages when chat box openned and load messages
  $('.chatbox-open').click(function(){
    $(".modal").animate({scrollTop: $('#modal-focus').offset().top + 9999}, 200);
  
    let csrfToken = $('#csrfmiddlewaretoken').attr('value');
    let username = $(this).attr('value') // the receiver of a sent message
    let counter = $(this).attr('data-bs-target') + '-unread'
    let envelope = $(this).attr('data-bs-target') + '-envelope'
    let modalRef = $(this).attr('data');
    let usernameId = $(this).attr('data-id'); 

    // clear chat box and make new request
    $( ".chatbox" ).html('');

    // request and load all messages from authenticated logged in user and contact when modal openned
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
          let trash = '';              
          if(message.message!='Message Deleted'){
            trash = '<i class="fas fa-trash"></i>'
          }
          if(message.sender!=username){                
            $(`.chatbox-${modalRef}`).append(`<div class="chatbox-${message.id} col-10 card pull-2 text-start h6 fw-normal p-2 fst-italic chat-bg ">
            ${message.message}<div class="date-text fw-light">${d}</div><div class="col-12 text-end fs-6 fw-light">${seen} <div class="d-inline text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div><div class="d-inline text-danger btn btn-sm p-0 delete-message" value=${message.id} data=${message.user_two}> ${trash}</div></div></div>`);
          }else{
            $(`.chatbox-${modalRef}`).append(`<div class="chatbox-${message.id} col-10 card offset-2 text-start h6 fw-normal p-2 fst-italic chat-bg">
            ${message.message}<div class="date-text fw-light">${d}</div><div class="col-12 text-end date-text"><div class="d-inline text-danger text-danger btn btn-sm p-0 clear-message fw-normal" value=${message.id} data=${message.user_two}>Clear</div></div></div>`);
          }             
        }); 
      })
      .catch((error) => {
            console.log(error)
    });       
    
    // mark messages as read when modal openned
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

    // WEBSOCKET LOGIC!

    // open websocket
    var roomName = $(this).attr('data');

    const chatSocket = new WebSocket(
        'ws://' + window.location.host + '/ws/chat/' + roomName + '/');

    chatSocket.onopen = function open() {
        console.log('WebSockets connection created.');
    };

    // close websocket 
    $(`.user-modal-close-${username}`).click(function(){

      $(`.chatbox-${modalRef}`).html(''); //remove all messages
      chatSocket.close()

    })

    chatSocket.onclose = function(e) {
        console.log('Chat socket closed');
    }

    // receive websocket messsage
    chatSocket.onmessage = function(e) {

      const dataMessage = JSON.parse(e.data);

      let seen = 'Seen';
      if(dataMessage.users!='1'){
        seen = 'Seen'
      }else{
        seen = "Unseen"
      }
      let trash = '';              
      if(dataMessage.message!='Message Deleted'){
        trash = '<i class="h6 fas fa-trash"></i>'
      }
      if(dataMessage.sender!=username){                
        $(`.chatbox-${modalRef}`).append(`<div class="chatbox-${dataMessage.message_id-1} col-10 card pull-2 text-start h6 fw-normal p-2 fst-italic chat-bg">
        ${dataMessage.message}<div class="date-text fw-light">${dataMessage.created_at}</div><div class="col-12 text-end h6 fw-light fs-6">${seen} <div class="d-inline text-danger btn btn-sm p-0 clear-message" value=${dataMessage.message_id-1} data=${usernameId}>Clear</div><div class="d-inline text-danger btn btn-sm p-0 delete-message" value=${dataMessage.message_id-1} data=${usernameId}> ${trash}</div></div></div>`);
      }else{
        $(`.chatbox-${modalRef}`).append(`<div class="chatbox-${dataMessage.message_id} col-10 card offset-2 text-start h6 fw-normal p-2 fst-italic chat-bg">
        ${dataMessage.message}<div class="date-text fw-light">${dataMessage.created_at}</div><div class="col-12 text-end date-text"><div class="d-inline text-danger text-danger btn btn-sm p-0 clear-message" value=${dataMessage.message_id} data=${usernameId}>Clear</div></div></div>`);
      }
    }
    // submit message via ajax
    let form = $( ".submit-message" )
    form.submit(function(event) {
      if(chatSocket.readyState == WebSocket.OPEN) {
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
          $(".chatbox" ).html('');
          $('textarea').val('');

          let lastEntry = responseJson.data[responseJson.data.length-1]

          // send message to websocket
          
          chatSocket.send(JSON.stringify({
              'type': 'send_message',
              'message': message,
              'receiver': username,
              'sender': $('#logged-in-user').attr('value'),
              'message_id': lastEntry.id,
              'modal_number': modalRef,
          }));

          // reload all messages to update
          // responseJson.data.forEach(function(message) {
            // covert date format
            
          //   var d = new Date(message.created_at);
          //   var options = { year: 'numeric', month: 'long', day: 'numeric', hour12: true,
          //                 hour: "2-digit",
          //                 minute: "2-digit"};
          //   d = d.toLocaleDateString("en-US", options)
          //   let seen = 'Seen'
          //   if(message.message_read){
          //     seen = 'Seen'
          //   }else{
          //     seen = "Unseen"
          //   }
          //   let trash = ''
          //   if(message.message!='Message Deleted'){
          //     trash = '<i class="fas fa-trash"></i>'
          //   }
          //   if(message.sender!=username){                
          //     $( ".chatbox" ).append(`<div class="col-10 card pull-2 text-start h5 p-2 fst-italic chat-bg">
          //     ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end h6">${seen} <div class="d-inline text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div><div class="d-inline text-danger btn btn-sm p-0 delete-message" value=${message.id} data=${message.user_two}> ${trash}</i></div></div></div>`);
          //   }else{
          //     $( ".chatbox" ).append(`<div class="col-10 card offset-2 text-start h5 p-2 fst-italic chat-bg">
          //     ${message.message}<div class="date-text">${d}</div><div class="col-12 text-end date-text"><div class="d-inline text-danger text-danger btn btn-sm p-0 clear-message" value=${message.id} data=${message.user_two}>Clear</div></div></div>`);
          //   }          
          // });
        })
        .catch((error) => {
              console.log(error)
        });
      }
    });
  })  

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
            // clear chat box and update messages
            $(`.chatbox-${messageId}`).hide('slow');                          
        })
        .catch((error) => {
              console.log(error)
      });
  });

  // delete message from dialog box
  $(document).on('click', '.delete-message', function(){
    let messageId = $(this).attr('value');
    let username = $(this).attr('data');
    let csrfToken = $('#csrfmiddlewaretoken').attr('value');

    fetch(`/message/delete_message/${messageId}/${username}`, { method: 'DELETE', headers: {'X-CSRFToken': csrfToken} })
      .then((response) => {
          if (response.ok) {          
              return response.json();
          }
          throw new Error('Something went wrong');
        })
        .then((responseJson) => {
            // clear chat box and update messages
            $(`.chatbox-${messageId}`).html('Message Deleted!');                   
        })
        .catch((error) => {
              console.log(error)
    });
  });
});