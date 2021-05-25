const expres = require('express'); // подключаем express методом require 
const path = require('path'); // подключаем путь с пути 
const absolutePath = path.resolve(__dirname); //абсолютный путь
const bodyParser = require('body-parser'); //извлечение модулем body-parser HTTP post
const WebSocket = require('ws'); // подключение сокета 
const wsServer = new WebSocket.Server({ port: 9000 });

const app = expres(); // инициализируем express записывая в переменную app, теперь app это обьект, 
//который имеет множество методов для работы с данным приложением



app.use(bodyParser.text()); // использование модуля bodyParser в форматах
app.use(bodyParser.json()); // JSON и text



//получаем файлы с node.js 
app.get(/\w+\.(css|js|html)|^\/$/, (req, res) => {
    res.sendFile(absolutePath + req.path);
})

let messageBase = []; // внутреннее хранилище сообщений 


app.get('/get-messages', (request, response) => { // Aдресс на который отсылаются сообщения 
    response.send(messageBase) //отправляем мы с backend на фронт( которая в функции renderMessageFromServer запросила)

})



async function startServer() {
    await app.listen(80, () => { // мeтодом listen указываем порт 
        console.log('its started', new Date());
    });
}
startServer();



//маршрутизация применяется для того чтобы сервер понимал как взаимодействовать с разными типами запросов

// инициализируем обьект для записи 
const users = {}

//
wsServer.on('connection', onConnect);

function onConnect(wsClient) {

    users[wsClient._socket.remoteAddress] = wsClient;


    console.log("длинна массива " + Object.values(users).length);
    console.log('Новый пользователь');


    wsClient.on('close', function() {
        delete users[wsClient._socket.remoteAddress];
        console.log('Пользователь отключился');
    });

    wsClient.on('message', function(message) {
        let userName = wsClient._socket.remoteAddress; //получение инициализированного ip

        if (userName === '::1' || userName == "::ffff:127.0.0.1") { // проверка и перезапись имём в чате
            userName = "Admin"
        } else {
            userName = "User (" + userName.split('.').pop() + ')' // удаляем последний элемент с массива 
                //и возвращаем его
        }

        const messageObject = { // добавляем данные который приходят, в массив messageBase
            user: userName,
            'message': message,
            timestamp: +new Date()
        }

        messageBase.push(messageObject);
        console.log(messageBase);

        let sockets = Object.values(users);
        for (let socket of sockets) {
            socket.send(JSON.stringify(messageObject));
        }

    });

}


//отсылаем количество юзеров на сайте на фронт
app.get("/count-users", (req, res) => {
    res.send(Object.values(users).length.toString());
})



console.log('Сервер запущен на 9000 порту');