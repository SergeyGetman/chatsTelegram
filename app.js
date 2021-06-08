let form = document.querySelector("#form");

const { usermsg } = form;
const chatbox = document.getElementById('chatbox')


const myWs = new WebSocket(`ws://${location.hostname}:9000`);
myWs.onmessage = function(event) {
    let messageObjec = JSON.parse(event.data);
    (new Message(messageObjec.user, messageObjec.message, messageObjec.timestamp)).render();
};


class AudioMsg {
    constructor(name) {
        this.audio = new Audio(`wavs/${name}.mp3`);
    }

    play() {
        this.stop();
        this.audio.play();
    }

    stop() {
        this.audio.pause()
        this.audio.currentTime = 0;
    }
}

let audio = new AudioMsg("beep");
let audioAdmin = new AudioMsg("beep2");


class Clock {
    constructor(timeFromBack) {
        this.date = new Date(timeFromBack); //получаем форму с датой
        this.minutes = this.date.getMinutes(); // получаем минуты
        this.hours = this.date.getHours(); // получаем часы

        this.minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
        this.hours = this.hours < 10 ? "0" + this.hours : this.hours;
    }

    getTimeNow(){
        return `${this.hours}:${this.minutes}`;
    }
}






form.addEventListener("submit", (event) => {
    event.preventDefault();
    Message.send(usermsg.value);

}); // отправка


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
            messages.forEach(message => {
                let obj = new Message(message.user, message.message, message.timestamp);
                obj.render();
            });
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

class Message {
    /**
     *
     * @param {string} nameUser
     * @param {string} textMessage
     * @param {number} timeStamp
     */
    constructor(nameUser, textMessage, timeStamp) {
        Object.assign(this, {nameUser, textMessage, timeStamp})


    }

    // функция отрисовки HTML на странице
    /**
     * rendering message.
     */
    render() {

        chatbox.innerHTML += `
    <div class="message${ this.nameUser === "Admin" ? " admin" : "" }">
       <div class="user-name"><b>${ this.nameUser } ${ (new Clock(this.timeStamp)).getTimeNow() }</b> </div>
      <div class="text">  ${ this.textMessage } </div>
    </div>`;

        //поле ввода при добавленнии сообщения ползунок опускается в самый низ
        chatbox.scrollTop = chatbox.scrollHeight

        audio.play();
    }

    static send(value) {

        if (!usermsg.value) return;

        sendToServer(usermsg.value); // отправляем то, что передаем в input

        //проверка на не пустую строку
        if (usermsg.value) {
            usermsg.value = "";
        }
    }


}