<%
/**
 * Функция возвращает начальные данные, включая типы задач
 */
function GetInitData() {
    // Определение типов задач
    var taskTypes = [
        { id: 'task', name: 'Задача', isDefault: true },
        { id: 'course', name: 'Курс', catalog: 'course' },
        { id: 'test', name: 'Тест', catalog: 'assessment' },
        { id: 'webinar', name: 'Вебинар', catalog: 'education_method' }
    ];

    // Сортировка типов задач по имени
    taskTypes = ArraySort(taskTypes, 'name', '+');

    // Возвращение данных
    return {
        ok: true,
        taskTypes: taskTypes
    };
}

/**
 * Функция возвращает шаблоны треков
 */
function GetTracks() {
    var xodTrackTemplates = getElemsByKey('object_data', { object_data_type_id: getODTypeID_TrackTemplate() });

    var trackTemplates = [];

    // Формирование списка шаблонов треков
    for (xodTrackTemplate in xodTrackTemplates) {
        trackTemplates.push({
            id: xodTrackTemplate.id + '',
            name: xodTrackTemplate.name + ''
        });
    }

    // Возвращение данных
    return {
        ok: true,
        errorMessages: [],
        trackTemplates: trackTemplates
    };
}

/**
 * Функция возвращает информацию о конкретном треке по его ID
 * @param {string} trackID - ID трека
 */
function GetTrack(trackID) {
    var docOdTrackTemplate = tools.open_doc(trackID);

    var teOdTrackTemplate = docOdTrackTemplate.TopElem;

    var track = getCustomElemJson(teOdTrackTemplate, 'data_json');

    // Добавление ID документа
    track.id = docOdTrackTemplate.DocID + '';

    // Возвращение данных
    return {
        ok: true,
        errorMessages: [],
        track: track
    };
}

/**
 * Функция сохраняет информацию о треке
 * @param {string} trackID - ID трека
 * @param {object} data - данные трека
 */
function SaveTrack(trackID, data) {
    alert("trackID: " + trackID);
    alert("data: " + EncodeJson(data));

    var docOdTrackTemplate;

    if (trackID == 0) {
        docOdTrackTemplate = tools.new_doc_by_name('object_data');
        docOdTrackTemplate.BindToDb(DefaultDb);
    } else if (trackID > 0) {
        docOdTrackTemplate = tools.open_doc(trackID);
    }

    var teOdTrackTemplate = docOdTrackTemplate.TopElem;

    // Установка типа данных объекта
    if (docOdTrackTemplate.NeverSaved()) {
        teOdTrackTemplate.object_data_type_id = getODTypeID_TrackTemplate();
    }

    // Обновление данных трека
    try {
        teOdTrackTemplate.name = data.name;
    } catch (e) {}

    data.id = undefined;

    for (day in data.days) {
        for (oTask in day.tasks) {
            if (oTask.type == 'course') updateCourseTaskSubitemsData(oTask);

            if (oTask.type == 'course' || oTask.type == 'test' || oTask.type == 'webinar') {
                if (oTask.HasProperty('elem') && oTask.elem.HasProperty('id'))
                    oTask.desc = getDescFromElem(oTask.elem.id);
            }
        }
    }

    setCustomElemVal(teOdTrackTemplate, 'data_json', EncodeJson(data));

    docOdTrackTemplate.Save();

    updateRelatedTracksByTrackTemplate(docOdTrackTemplate.DocID);

    return {
        ok: true,
        trackTemplateId: docOdTrackTemplate.DocID + '',
        errorMessages: []
    };
}

/**
 * Функция удаляет шаблон трека по его ID
 * @param {string} trackTemplateID - ID шаблона трека
 */
function DeleteTrackTemplate(trackTemplateID) {
    var xodTrackTemplateID = getElemIDByKey('object_data', {
        id: trackTemplateID,
        object_data_type_id: getODTypeID_TrackTemplate()
    });

    var docOdTrackTemplate = tools.open_doc(xodTrackTemplateID);

    var isTrackTemplate =
        docOdTrackTemplate != undefined &&
        docOdTrackTemplate.Form.TopElem.Name == 'object_data' &&
        docOdTrackTemplate.TopElem.object_data_type_id == getODTypeID_TrackTemplate();

    if (!isTrackTemplate)
        return { ok: false, errorMessages: ['Документ не найден'] };

    var deleted = deleteOpDoc(docOdTrackTemplate.DocID);

    return {
        ok: deleted
    };
}

/**
 * Функция ищет колонки в таблицах по тексту
 * @param {string} searchText - текст для поиска
 * @param {boolean} includeBosses - включать ли начальников
 */
function SearchColls(searchText, includeBosses) {
    includeBosses = bool(includeBosses, true);

    if (StrCharCount(searchText) < 3)
        return { ok: false, errorMessages: ['Введите более 3 символов для поиска'] };

    var xColls = ArraySelectAll(XQuery(`
        for $elem in collaborators
        where
            contains($elem/fullname, "` + XQueryLiteral(searchText) + `")
        return
            $elem/id,
            $elem/fullname,
            $elem/position_name,
            $elem/position_parent_name
    `));

    if (ArrayCount(xColls) > 1000)
        return { ok: false, errorMessages: ['Найдено более 1000 записей, уточните запрос'] };

    var oColls = [];

    for (xColl in xColls) {
        oColls.push({
            id: xColl.id + '',
            fullname: xColl.fullname + '',
            positionName: xColl.position_name + '',
            subdivName: xColl.position_parent_name + ''
        });
    }

    return {
        ok: true,
        colls: oColls,
        errorMessages: []
    };
}

/**
 * Функция ищет подразделения по тексту
 * @param {string} searchText - текст для поиска
 */
function SearchSubdivs(searchText) {
    if (StrCharCount(searchText) < 3)
        return { ok: false, errorMessages: ['Введите более 3 символов для поиска'] };

    var xSubdivs = ArraySelectAll(XQuery(`
        for $elem in subdivisions
        where
            contains($elem/name, "` + XQueryLiteral(searchText) + `")
        return
            $elem/id,
            $elem/name
    `));

    if (ArrayCount(xSubdivs) > 1000)
        return { ok: false, errorMessages: ['Найдено более 1000 записей, уточните запрос'] };

    var oSubdivs = [];

    for (xSubdiv in xSubdivs) {
        oSubdivs.push({
            id: xSubdiv.id + '',
            name: xSubdiv.name + ''
        });
    }

    return {
        ok: true,
        subdivs: oSubdivs,
        errorMessages: []
    };
}

/**
 * Функция ищет данные в каталоге
 * @param {string} virtualCatalog - виртуальный каталог
 * @param {string} searchText - текст для поиска
 * @param {boolean} getAllData - возвращать все данные
 */
function SearchInCatalog(virtualCatalog, searchText, getAllData) {
    if (getAllData === undefined)
        getAllData = false;

    var allowedCatalogs = {
        collaborator: {
            nameField: 'fullname'
        },
        subdivision: {
            nameField: 'name'
        },
        position: {
            nameField: 'name',
            onlyUniqNames: true
        },
        position_common: {
            nameField: 'name'
        },
        compound_program: {
            nameField: 'name'
        },
        course: {
            nameField: 'name'
        },
        assessment: {
            nameField: 'title'
        },
        education_method: {
            nameField: 'name'
        },
        event: {
            nameField: 'name'
        },
        track_template: {
            realCatalog: 'object_data',
            xquery: '$elem/object_data_type_id = ' + getODTypeID_TrackTemplate(),
            nameField: 'name'
        }
    };

    var allowedCatalog = allowedCatalogs.GetOptProperty(virtualCatalog);

    if (allowedCatalog == undefined)
        return { ok: false, errorMessages: ['Каталог не найден'] };

    var catalog = allowedCatalog.GetOptProperty('realCatalog', virtualCatalog);

    if (StrCharCount(searchText) < 3 && !getAllData)
        return { ok: false, errorMessages: ['Введите более 3 символов для поиска'] };

    var xFilters = [];

    if (allowedCatalog.HasProperty('xquery'))
        xFilters.push(allowedCatalog.xquery);

    if (!getAllData)
        xFilters.push("contains($elem/" + allowedCatalog.nameField + ", " + XQueryLiteral(searchText) + ")");

    var xFiltersStr = xFilters.length > 0 ? ' where ' + xFilters.join(' and ') : '';

    var xElems = ArraySelectAll(safeXQuery(`
        for $elem in ` + catalog + `s` + xFiltersStr + `
        return $elem
    `));

    if (allowedCatalog.GetOptProperty('onlyUniqNames', false))
        xElems = ArraySelectDistinct(xElems, 'This.name');

    if (ArrayCount(xElems) > 1000 && !getAllData)
        return { ok: false, errorMessages: ['Найдено более 1000 записей, уточните запрос'] };

    var oElems = [];

    for (xElem in xElems) {
        oElems.push({
            id: xElem.id + '',
            name: xElem.Child(allowedCatalog.nameField) + ''
        });
    }

    return {
        ok: true,
        elems: oElems,
        errorMessages: []
    };
}

/**
 * Функция возвращает доступные изображения треков
 */
function getAvailableTrackImages() {
    var fileUrls = ReadDirectory("x-local://wt/web/rnedu/images/tracks");

    var images = [];

    for (fileUrl in fileUrls) {
        if (IsDirectory(fileUrl))
            continue;

        images.push({
            url: StrReplace(fileUrl, 'x-local://wt/web/', '')
        });
    }

    return images;
}

// Получение текущего ID пользователя
curPersonID = curUserID;
curPerson = tools.open_doc(curPersonID).TopElem;

// Получение значения из формы
action = getFormValText('action');

if (action == 'GetInitData') {
    outAsJson(GetInitData());
} else if (action == 'GetAvailableTrackImages') {
    outAsJson(getAvailableTrackImages());
} else if (action == 'GetTracks') {
    outAsJson(GetTracks());
} else if (action == 'GetTrack') {
    trackID = getFormValInt('trackID');
    outAsJson(GetTrack(trackID));
} else if (action == 'SaveTrack') {
    trackID = getFormValInt('trackID');
    trackData = getFormValJson('data_json').track;

    outAsJson(SaveTrack(trackID, trackData));
} else if (action == 'DeleteTrackTemplate') {
    trackID = getFormValInt('trackID');

    outAsJson(DeleteTrackTemplate(trackID));
} else if (action == 'SearchColls') {
    searchText = getFormValText('search_text');

    outAsJson(SearchColls(searchText));
} else if (action == 'SearchSubdivs') {
    searchText = getFormValText('search_text');

    outAsJson(SearchSubdivs(searchText));
} else if (action == 'SearchInCatalog') {
    catalog = getFormValText('catalog');
    searchText = getFormValText('searchText');
    getAll = getFormValBool('getAll');

    alert("catalog: " + catalog);
    alert("searchText: " + searchText);

    outAsJson(SearchInCatalog(catalog, searchText, getAll));
} else {
    outAsJson({
        ok: false,
        message: 'No such method'
    });
}
%>
