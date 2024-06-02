# RNedu Backend

## Описание

Этот проект представляет собой backend для системы RNedu, который обрабатывает назначения и обновления треков для агентов. 

## Установка

1. Склонируйте репозиторий:
    ```bash
    git clone https://github.com/Dupsogod/rnedubackend-main.git
    ```
2. Установите зависимости:
    ```bash
    cd rnedubackend-main
    npm install
    ```

## Запуск

1. Запустите сервер:
    ```bash
    npm start
    ```

## Структура проекта

- `rnedu_agent_AssingTracks.js`: Назначает треки агентам.
- `rnedu_agent_UpdateTracks.js`: Обновляет информацию о треках агентов.
- `rnedu_tpl_API.js`: Содержит API методы для работы с треками и заданиями.

## Зависимости

- Node.js и npm
- MongoDB
- Express.js
- Lodash
- Axios

## Лицензия

Этот проект лицензирован под лицензией MIT.
