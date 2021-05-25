let form = document.querySelector("#form");
const myWs = new WebSocket(`ws://${location.hostname}:9000`);
const {
    usermsg
} = form;
const chatbox = document.getElementById('chatbox')


//функция получения текущей даты 
function getDate(timeFromBack) {

    let date = new Date(timeFromBack); //получаем форму с датой
    let minutes = date.getMinutes(); // получаем минуты 
    let hours = date.getHours(); // получаем часы
    //проверка времени если цифра без ноля
    minutes = minutes < 10 ? "0" + minutes : minutes;
    hours = hours < 10 ? "0" + hours : hours;
    return `${hours}:${minutes}`;

}

// функция отрисовки HTML на странице 
function renderMessage(nameUser, textMessage, time) {
    let classNameAdmin = nameUser == "Admin" ? " admin" : "";
    chatbox.innerHTML += `
    <div class="message${classNameAdmin}">
       <div class="user-name"><b>${nameUser} ${ getDate(time)}</b> </div>
      <div class="text">  ${textMessage} </div>
    </div>`;
    //поле ввода при добавленнии сообщения ползунок опускается в самый низ 
    chatbox.scrollTop = chatbox.scrollHeight
}

function sendMessage(e) {
    e.preventDefault();

    if (!usermsg.value) return;

    sendToServer(usermsg.value); // отправляем то, что передаем в input 
    ;

    //проверка на не пустую строку
    if (usermsg.value) {
        usermsg.value = "";
    }

}

form.addEventListener("submit", sendMessage); // отправка 


// отправка на сервер методом POST
async function sendToServer(message) {
    myWs.send(message);
}

renderMessageFromServer(); //вызов функции чтобы отрисовка произошла сразу 


let messageLength = 0

//отрисовка на фронте прилетевших с неё данных
function renderMessageFromServer() {
    fetch('/get-messages', {
        method: "GET"
    }).then((response) => {
        return response.json()
    }).then(messages => {
        if (messageLength < messages.length) { // проверка на отрисовку сразу после следующего сообщения 
            chatbox.innerHTML = "";
            messages.forEach(message => renderMessage(message.user, message.message, message.timestamp));
        }
        messageLength = messages.length;

    })
}
// сколько человек онлайн
function renderUserOnline() {
    fetch("/count-users").then((response) => {
        response.text().then(c => document.querySelector("#user-count").innerHTML = c);
    })
}

renderUserOnline();

myWs.onmessage = function(event) {
    let messageObjec = JSON.parse(event.data);
    renderMessage(messageObjec.user, messageObjec.message, messageObjec.timestamp);
};