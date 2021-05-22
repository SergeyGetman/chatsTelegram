let form = document.querySelector("#form");
let data = new Date();
const { usermsg } = form;
const chatbox = document.getElementById('chatbox')

// 
function renderMessage(nameUser, textMessage) {

    chatbox.innerHTML += '<div>' +
        '<b>' + nameUser + ': </b>' + data.getHours() + ":" + data.getMinutes() + " " + textMessage + "\n" +
        " </div> ";
}

function sendMessage(e) {
    e.preventDefault();
    if (!usermsg.value) return;

    sendToServer(usermsg.value);

    //проверка на не пустую строку
    if (usermsg.value) {
        usermsg.value = "";
    }
    //поле ввода при добавленнии сообщения  
    chatbox.scrollTop = chatbox.scrollHeight;
}

form.addEventListener("submit", sendMessage); // отправка 

async function sendToServer(message) {
    await fetch("/send", {
        method: "POST",
        body: message
    })
}

setInterval(renderMessageFromServer, 2000);


function renderMessageFromServer() {
    chatbox.innerHTML = "";
    fetch('/get-messages', { method: "GET" }).then((response) => {
        return response.json()
    }).then(messages => messages.forEach((obj) => {
        renderMessage(obj.user, obj.message);
    }))
}