const expres = require('express'); // подключаем express методом require 
const path = require('path'); // подключаем путь с пути 
const absolutePath = path.resolve(__dirname);
const bodyParser = require('body-parser');



const app = expres(); // инициализируем express записывая в переменную app, теперь app это обьект, 
//который имеет множество методов для работы с данным приложением

app.use(bodyParser.text()); // использование модуля bodyParser в форматах
app.use(bodyParser.json()); // JSON и text

app.get('/', (req, res, next) => { // методом get отправляем запрос в корневую дирректорию localhost
        res.sendFile(absolutePath + "/index.html") // забираем с ноды файлы с расширениями
    })
    // получаем style.css по пути через метод get с фронта
app.get("/style.css", (req, res) => {
    res.sendFile(absolutePath + "/style.css")
})

app.get("/app.js", (req, res) => { //получаю файл js, методом sendFile
    res.sendFile(`${absolutePath}/app.js`)
})

let messageBase = []; // внутреннее хранилище сообщений 

app.post('/send', (request, response) => { // AДРЕСС НА КОТОРЫЙ ШЛЮТСЯ СООБЩЕНИЯ С ФРОНТА 

    let userName = request.socket.remoteAddress;

    if (userName === '::1') {
        userName = "Admin"
    } else {
        userName = "User (" + userName.split('.').pop() + ')'
    }

    messageBase.push({ // добавляем данные который приходят, в массив messageBase
        user: userName, // выводим 
        message: request.body
    });
    console.log(messageBase);
});

app.get('/get-messages', (request, response) => { // Aдресс на который отсылаются сообщения 
    response.send(messageBase)
})

async function startServer() {
    await app.listen(80, () => { // мeтодом listen указываем порт 
        console.log('its started', new Date());
    });
}
startServer();



//маршрутизация применяется для того чтобы сервер понимал как взаимодействовать с разными типами запросов