# RNedu Backend

## Описание

Этот проект представляет собой backend для системы RNedu, который обрабатывает назначения и обновления треков для агентов. 

## Структура проекта

### Файл `rnedu_agent_AssingTracks.js`

#### Основные функции

1. **include(ts, p)**
   - Включает треки.
   - Обрабатывает ошибки и выполняет скрипты треков.

2. **ld(tc)**
   - Форматирует код трека для выполнения.
   - Вставляет пользовательский код в шаблон трека.

3. **cmc(c)**
   - Проверяет наличие подстроки в строке.
   - Используется для проверки условий в треках.

### Файл `rnedu_agent_UpdateTracks.js`

#### Основные функции

1. **include(ts, p)**
   - Обновляет треки.
   - Обрабатывает ошибки и выполняет скрипты треков.

2. **ld(tc)**
   - Форматирует код трека для выполнения.
   - Вставляет пользовательский код в шаблон трека.

3. **cmc(c)**
   - Проверяет наличие подстроки в строке.
   - Используется для проверки условий в треках.

### Файл `rnedu_tpl_API.js`

#### Основные функции

1. **normalizeUrl(url)**
   - Нормализует URL.

2. **GetInitData()**
   - Возвращает начальные данные для агента.

3. **GetMyActiveMiscTasks()**
   - Возвращает список активных задач агента.

4. **GetMyMiscTask(taskID)**
   - Возвращает информацию о конкретной задаче по её ID.

5. **GetMyActiveTracks()**
   - Возвращает список активных треков агента.

6. **GetTrack(trackID)**
   - Возвращает информацию о конкретном треке по его ID.

7. **GetTrackDay(trackID, dayID)**
   - Возвращает информацию о дне трека по его ID.

8. **SetTrackDayTaskStatus(trackID, dayID, taskID, newStatus)**
   - Обновляет статус задачи трека.

9. **GetAvailableWebinarEvent(trackID, dayID, taskID)**
   - Возвращает доступные вебинары для агента.

10. **IncludeCurPersonInWebinarEvent(trackID, dayID, taskID, eventID)**
    - Включает агента в вебинар.

11. **RemoveCurPersonFromWebinarEvent(trackID, dayID, taskID, eventID)**
    - Удаляет агента из вебинара.
