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
included = include('rnedu_common_funcs', {to: 'server_agent', code: 'rnedu_AssignTracks'});

if (included) {

    xOD1_TRACKS = undefined;
    xOD_PASSED_TRACKS = undefined;

    /**
     * Возвращает статус трека
     * @param {string} collID - ID коллекции
     * @param {string} trackTemplateID - ID шаблона трека
     * @returns {Object} - статус трека
     */
    function getTrackStatus(collID, trackTemplateID) {
        if (xOD_PASSED_TRACKS == undefined) {
            xOD_PASSED_TRACKS = ArraySelectAll(tools.xquery(`
                for $elem in events
                order by
                    $elem/object_id
                where
                    $elem/object_data_type_id = ` + getODTypeID_Track() + `
                    and $elem/status_id = 'pay'
                return
                    $elem/id,
                    $elem/object_id,
                    $sec_object_id
            `));
        }

        var xOdTracks_ofPerson = ArraySelectBySortedKey(xOD_PASSED_TRACKS, collID, 'object_id');

        var xOdTrack_ofPerson_ofTemplate = ArrayOptFind(xOdTracks_ofPerson, 'This.sec_object_id == trackTemplateID');

        return {
            done: (xOdTrack_ofPerson_ofTemplate != undefined)
        };
    }

    /**
     * Преобразует значение в дни
     * @param {number} value - значение
     * @param {string} unit - единица измерения
     * @returns {number} - количество дней
     */
    function termToDays(value, unit) {
        var resultDays;
        if (unit == 'days')
            resultDays = value;
        else if (unit == 'month')
            resultDays = value * 30;
        else if (unit == 'year')
            resultDays = value * 365;

        return resultDays;
    }

    /**
     * Возвращает коллекции, релевантные для трека
     * @param {string} trackTemplateID - ID шаблона трека
     * @returns {Array} - релевантные коллекции
     */
    function getCollsRelevantToTrack(trackTemplateID) {
        var docOdTrackTemplate = tools.open_doc(trackTemplateID);
        var teOdTrackTemplate = docOdTrackTemplate.TopElem;

        var oTrack = getCustomElemJson(teOdTrackTemplate, 'data_json');

        var xqFilters = [];

        if (!oTrack.HasProperty('assignBySubdiv'))
            oTrack.assignBySubdiv = false;

        if (!oTrack.HasProperty('assignByPosition'))
            oTrack.assignByPosition = false;

        if (!oTrack.HasProperty('assignByPerson'))
            oTrack.assignByPerson = false;

        alert("trackTemplate " + teOdTrackTemplate.name + " =>  assignBySubdiv: " + oTrack.assignBySubdiv + "; assignByPosition: " + oTrack.assignByPosition + "; assignByPerson: " + oTrack.assignByPerson + "; ");

        if (!oTrack.assignBySubdiv && !oTrack.assignByPosition && !oTrack.assignByPerson)
            return [];

        if (oTrack.assignBySubdiv && oTrack.subdivs.length > 0)
            xqFilters.push("MatchSome($elem/position_parent_id, (" + ArrayMerge(oTrack.subdivs, "OptInt(This.id)", ",") + "))");

        if (oTrack.assignByPosition && oTrack.commonPositions.length > 0)
            xqFilters.push("MatchSome($elem/position_name, (" + ArrayMerge(oTrack.commonPositions, "XQueryLiteral(This.name)", ",") + "))");

        if (oTrack.assignByPerson && oTrack.colls.length > 0)
            xqFilters.push("MatchSome($elem/id, (" + ArrayMerge(oTrack.colls, "OptInt(This.id)", ",") + "))");

        var xqFiltersStr = xqFilters.length > 0 ? " where " + xqFilters.join(' and ') : '';

        var XQString = `
            for $elem in collaborators
            ` + xqFiltersStr + `
            return $elem/id, $elem/fullname, $elem/position_id
        `;

        alert("XQString: " + XQString);

        var xColls = ArraySelectAll(safeXQuery(XQString));

        alert("ArrayCount(xColls): " + ArrayCount(xColls));

        var xColls_Fitting = [];
        var courseStatus, testStatus, eduMethodEventVisitStatus, trackStatus;

        var collFits;
        var positionTermMatchs;
        var termMin, termMax;

        for (xColl in xColls) {
            collFits = true;

            if (oTrack.assignByPosition) {
                xPosition = xColl.position_id.OptForeignElem();

                if (xPosition == undefined)
                    continue;

                positionDaysMin = termToDays(oTrack.termMin, oTrack.termTimeUnitMin);
                positionDaysMax = termToDays(oTrack.termMax, oTrack.termTimeUnitMax);

                if (xPosition.position_date == null)
                    continue;

                positionDays = DateDiff(Date(), xPosition.position_date) / (24*60*60);

                positionTermMatchs = positionDaysMin <= positionDays && positionDays <= positionDaysMax;

                // alert("xColl.fullname: " + xColl.fullname);
                // alert("positionDaysMin: " + positionDaysMin);
                // alert("positionDays: " + positionDays);
                // alert("positionDaysMax: " + positionDaysMax);
                // alert("positionTermMatchs: " + positionTermMatchs);

                if (!positionTermMatchs) {
                    collFits = false;
                    break;
                }
            }

            if (oTrack.requiredCourses.length > 0) {
                for (requiredCourse in oTrack.requiredCourses) {
                    courseStatus = getCourseStatus(xColl.id, [requiredCourse.id]);

                    if (!courseStatus.done) {
                        collFits = false;
                        break;
                    }
                }
            }

            if (oTrack.requiredTests.length > 0) {
                for (requiredTest in oTrack.requiredTests) {
                    testStatus = getCourseStatus(xColl.id, [requiredTest.id]);

                    if (!testStatus.done) {
                        collFits = false;
                        break;
                    }
                }
            }

            if (oTrack.requiredPrograms.length > 0) {
                for (requiredProgram in oTrack.requiredPrograms) {
                    eduMethodEventVisitStatus = getEduMethodEventVisitStatus(xColl.id, [requiredProgram.id]);

                    if (!eduMethodEventVisitStatus.done) {
                        collFits = false;
                        break;
                    }
                }
            }

            if (oTrack.requiredTracks.length > 0) {
                for (requiredTrack in oTrack.requiredTracks) {
                    if (!requiredTrack.HasProperty('id'))
                        continue;

                    trackStatus = getTrackStatus(xColl.id, [requiredTrack.id]);

                    if (!trackStatus.done) {
                        collFits = false;
                        break;
                    }
                }
            }

            if (collFits)
                xColls_Fitting.push(xColl);
        }

        return xColls_Fitting;
    }

    /**
     * Проверяет, назначен ли трек агенту
     * @param {string} trackTemplateID - ID шаблона трека
     * @param {string} collID - ID коллекции
     * @returns {boolean} - true, если трек назначен
     */
    function isTrackAssignedToColl(trackTemplateID, collID) {
        var xodAssignedTrack = getElemByKey('object_data', {
            object_data_type_id: getODTypeID_Track(),
            object_id: OptInt(trackTemplateID),
            sec_object_id: OptInt(collID)
        });

        return xodAssignedTrack != undefined;
    }

    /**
     * Назначает трек агенту
     * @param {string} trackTemplateID - ID шаблона трека
     * @param {string} collID - ID коллекции
     * @returns {boolean} - true, если назначение успешно
     */
    function assignTrackToColl(trackTemplateID, collID) {
        if (isTrackAssignedToColl(trackTemplateID, collID))
            return false;

        var docColl = tools.open_doc(collID);

        var docOdTrackTemplate = tools.open_doc(trackTemplateID);
        var teOdTrackTemplate = docOdTrackTemplate.TopElem;

        var oTrackTemplate = getCustomElemJson(teOdTrackTemplate, 'data_json');

        var docOdTrack = tools.new_doc_by_name('object_data');
        docOdTrack.BindToDb(DefaultDb);

        var teOdTrack = docOdTrack.TopElem;

        teOdTrack.object_data_type_id = getODTypeID_Track();
        teOdTrack.object_type = 'object_data';
        teOdTrack.object_id = docOdTrackTemplate.DocID;
        teOdTrack.object_name = docOdTrackTemplate.name;
        teOdTrack.sec_object_type = 'collaborator';
        teOdTrack.sec_object_id = collID;
        teOdTrack.sec_object_name = docColl.TopElem.fullname;
        teOdTrack.name = docColl.TopElem.fullname + ' - ' + teOdTrackTemplate.name;

        for (day in oTrackTemplate.days) {
            day.status = DAY_STATUS.LOCKED;

            for (oTask in day.tasks)
                oTask.status = TASK_STATUS.LOCKED;
        }

        setCustomElemVal(teOdTrack, 'days_json', EncodeJson(oTrackTemplate.days));

        updateShortTrackData(teOdTrack);

        docOdTrack.Save();

        return true;
    }

    /**
     * Назначает треки агентам
     * @returns {Object} - результаты назначения
     */
    function assignTracksToColls() {
        var xodTrackTemplates = getElemsByKey('object_data', { object_data_type_id: getODTypeID_TrackTemplate() });

        var xColls;

        var newTracksCount = 0;

        for (xodTrackTemplate in xodTrackTemplates) {
            // if (xodTrackTemplate.id != 73150340250758765999)
            // continue;

            // alert("xodTrackTemplate: " + xodTrackTemplate.code);

            xColls = getCollsRelevantToTrack(xodTrackTemplate.id);

            // alert("ArrayCount(xColls): " + ArrayCount(xColls));

            for (xColl in xColls) {
                newTrackAssigned = assignTrackToColl(xodTrackTemplate.id, xColl.id);

                // alert("xodTrackTemplate: " + xodTrackTemplate.code + " >> " + xColl.fullname);

                if (newTrackAssigned)
                    newTracksCount++;
            }
        }

        return {
            newTracksCount: newTracksCount
        };
    }

    if (LdsIsServer)
        alert("Назначение треков для агентств на сервере...");
    else
        throw "Назначение треков возможно только на сервере.";

    result = assignTracksToColls();

    alert("Назначено треков для агентств: " + result.newTracksCount);
}
