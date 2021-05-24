let form = document.querySelector("#form");

const { usermsg } = form;
const chatbox = document.getElementById('chatbox')


//функция получения текущей даты 
function getDate(timeFromBack) {

    let date = new Date(timeFromBack); //получаем форму с датой
    let minutes = date.getMinutes(); // получаем минуты 
    let hours = date.getHours(); // получаем часы

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
    await fetch("/send", {
        method: "POST",
        body: message
    })
}

//каждые 2 секунды обновляем отрисовку
setInterval(renderMessageFromServer, 2000);
renderMessageFromServer(); //вызов функции чтобы отрисовка произошла сразу 

let messageLength = 0;

//отрисовка на фронте прилетевших с неё данных
function renderMessageFromServer() {
    fetch('/get-messages', { method: "GET" }).then((response) => {
        return response.json()
    }).then(messages => {
        if (messageLength < messages.length) { // проверка на отрисовку сразу после следующего сообщения 
            chatbox.innerHTML = "";
            messages.forEach(message => renderMessage(message.user, message.message, message.timestamp));
        }

        messageLength = messages.length;
    })

}