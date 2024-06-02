/**
 * Выполняет включение треков для агента
 * @param {Array} ts - треки
 * @param {Object} p - параметры
 */
function include(ts, p) {
    var mc;
    try {
        mc = TopElem.script;
    } catch (e) {
        try {
            te = tools.get_doc_by_key(p.to, 'code', p.code).TopElem;
            if (p.to == 'server_agent') mc = te.run_code;
            else throw 'unknown object in params: ' + p.to;
        } catch (e) {
            throw "TopElem or self_id not found!";
        }
    }
    mc += '';
    if (!Array.isArray(ts)) ts = [ts];
    var c = "";
    for (t in ts) c += '\n' + ld(t);
    c += '\n' + cmc(mc);
    eval(c);
    return false;
}

/**
 * Обрабатывает код трека
 * @param {string} tc - код трека
 * @returns {string} - отформатированный код
 */
function ld(tc) {
    curActiveWebTemplate = null;
    var es = tools_web.insert_custom_code(tc, null, false, false);
    es = StrReplace(es, '\\<\\%', '');
    es = StrReplace(es, '%\\>', '');
    return es;
}

/**
 * Проверяет наличие подстроки в строке
 * @param {string} c - строка
 * @returns {string} - строка с заменами
 */
function cmc(c) {
    var x = 'if (inc' + 'luded)';
    var i = c.indexOf(x);
    if (i < 0) throw '"' + x + '" not found in the main code!';
    var cc = StrRightRangePos(c, i);
    cc = StrReplaceOne(cc, x, 'if (true)');
    return cc;
}

// Включение функций инициализации
included = include('rnedu_common_funcs', {to: 'server_agent', code: 'rnedu_UpdateTracks'});

if (included) {
    if (LdsIsServer)
        alert("Обновление треков на сервере...");

    xOdTracks = getActiveTracks();

    updatedTracksCount = 0;

    collID = OptInt(Param.collID);

    for (xOdTrack in xOdTracks) {
        if (collID != undefined && xOdTrack.sec_object_id != collID)
            continue;

        updateTrack(xOdTrack.id);

        updatedTracksCount++;
    }

    alert("Обновлено треков: " + updatedTracksCount);
}

/**
 * Обновляет активные треки
 * @returns {Array} - активные треки
 */
function getActiveTracks() {
    return tools.xquery(`
        for $elem in object_data
        where
            $elem/object_data_type_id = ` + getODTypeID_Track() + `
        return $elem
    `);
}

/**
 * Обновляет трек по ID
 * @param {string} trackID - ID трека
 */
function updateTrack(trackID) {
    var docOdTrack = tools.open_doc(trackID);

    var teOdTrack = docOdTrack.TopElem;

    // Здесь можно добавить логику обновления трека, если потребуется

    docOdTrack.Save();
}
