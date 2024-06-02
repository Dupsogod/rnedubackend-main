<%
// https://editor.jsight.io/r/DBYADB3/6

//alert("Request.Body 111: "+Request.Body);


HOST_URL = 'http://srvap1664.rccf.ru/';
DEFAULT_IMAGE_URL = 'http://srvap1664/images/competence_profile.png';



//-----------------------------------------------API Methods-------------------------------------------

function normalizeUrl(url)
{
	if (StrContains(url, HOST_URL))
		return url;
	else
		return UrlAppendPath(HOST_URL, url);
}

function GetInitData()
{	
	var collTracksProgress = getCollTracksProgress(curPersonID);


	return {
	    person: makeApiObj_Person(curPerson), //@person,
	    progressOf: {
	        person: //@eduProgressBlock,
	        {
	            averageScore: makeApiObj_Progress(collTracksProgress.averageScore),
	            mandatory: makeApiObj_Progress(collTracksProgress.mandatory),
	            auxiliary: makeApiObj_Progress(collTracksProgress.auxiliary)
	        },
	        team: //@eduProgressBlock
	        {
	            averageScore: makeApiObj_Progress(),
	            mandatory: makeApiObj_Progress(),
	            auxiliary: makeApiObj_Progress()
	        }
	    },
	    gauges: {
	        averageScore: makeApiObj_Progress()
	    },
		defaultActivityImageUrl: DEFAULT_IMAGE_URL,
		taskTypes: TASK_TYPES
	}
}

function GetMyActiveMiscTasks()
{
	var xActiveLearnings = getElemsByKey('active_learning', { person_id: curPersonID });
	var xActiveTestLearnings = getElemsByKey('active_test_learning', { person_id: curPersonID });
	
	var elemIDs = ArrayUnion(
		ArrayExtract(xActiveLearnings, 'course_id'),
		ArrayExtract(xActiveTestLearnings, 'assessment_id')
	);
	
	
	var trackElemIDs = filterElemIDsInTracks(elemIDs, curPersonID);
	
	var xActiveLearnings_NotInTracks = arraySubtract(xActiveLearnings, trackElemIDs, 'This.course_id', 'This');
	var xActiveTestLearnings_NotInTracks = arraySubtract(xActiveTestLearnings, trackElemIDs, 'This.assessment_id', 'This');
	
	//var xActiveLearnings_NotInTracks = xActiveLearnings;
	//var xActiveTestLearnings_NotInTracks = xActiveTestLearnings;
	
	var oTasks = [];
	
	for (xActiveLearning in xActiveLearnings_NotInTracks)
	{
		oTasks.push({
			id: xActiveLearning.id +'',
			name: xActiveLearning.course_name +'',
			type: 'course',
			status: 'inProgress',
			elem: {
				id: xActiveLearning.course_id +'',
				name: xActiveLearning.course_name +'',
				activeID: xActiveLearning.id +''
			}
		});
	}
	
	for (xActiveTestLearning in xActiveTestLearnings_NotInTracks)
	{
		oTasks.push({
			id: xActiveTestLearning.id +'',
			name: xActiveTestLearning.assessment_name +'',
			type: 'test',
			status: 'inProgress',
			elem: {
				id: xActiveTestLearning.assessment_id +'',
				name: xActiveTestLearning.assessment_name +'',
				activeID: xActiveTestLearning.id +''
			}
		});
	}
	
	var apiTasks = [];
	
	for (oTask in oTasks)
		apiTasks.push(makeApiObj_TrackDayTask(oTask));
	
	return apiTasks;
}

function GetMiscTask(taskID)
{
	var docElem = tools.open_doc(taskID);
	
	if (docElem == undefined)
		return {
			ok: false,
			errorMessage: "Не найден элемент с указанным ID"
		}
		
	var teElem = docElem.TopElem;
		
	var allowedDocTypes = ['learning', 'active_learning', 'test_learning', 'active_test_learning'];	
	
	var elemFormName = teElem.Form.TopElem.Name;
	
	var isAllowedDocType = ArrayOptFind(allowedDocTypes, 'This == elemFormName') != undefined;
	
	if (!isAllowedDocType)
		return {
			ok: false,
			errorMessage: "Доступ к элементу не разрешен"
		}
		
	var oTask = { id: docElem.DocID +'' };
	
	if (elemFormName == 'learning' || elemFormName == 'active_learning')
	{
		oTask.name = teElem.course_name +'';
		oTask.type = 'course';
		oTask.status = elemFormName == 'active_learning' ? 'inProgress' : 'done';
		oTask.selfAssigned = teElem.is_self_enrolled;
		oTask.elem = {
			id: teElem.course_id +'',
			name: teElem.course_name +'',
			activeID: docElem.DocID +''
		}
	}
	else if (elemFormName == 'test_learning' || elemFormName == 'active_test_learning')
	{
		oTask.name = teElem.assessment_name +'';
		oTask.type = 'test';
		oTask.status = elemFormName == 'active_test_learning' ? 'inProgress' : 'done';
		oTask.elem = {
			id: teElem.assessment_id +'',
			name: teElem.assessment_name +'',
			activeID: docElem.DocID +''
		}
	}
	
	var apiTask = makeApiObj_TrackDayTask(oTask);
	
	return apiTask;
}

function GetMyActiveTasks()
{
	var oTasks = getActiveTasks(curPersonID);
	
	var apiTasks = [];
	
	for (oTask in oTasks)
	{
		apiTasks.push(makeApiObj_TrackDayTask(oTask));
	}
	
	return apiTasks;
}

function GetMyActiveTracks()
{
	var apiTracks = [];

	var xOdTracks = getActiveTracks(curPersonID);

	for (xOdTrack in xOdTracks)
		apiTracks.push(makeApiObj_Track(xOdTrack.id));
	
	return apiTracks;
}

function GetTrack(trackID)
{	
	updateTrack(trackID, { useCache: false });

	var docOdTrack = tools.open_doc(trackID);
	
	if (docOdTrack == undefined)
		return {
			ok: false,
			errorMessage: 'Не найден трек с указанным ID'
		}

	return makeApiObj_Track(trackID);
}

function GetTrackDay(trackID, dayID)
{
	updateTrack(trackID, { useCache: false });
	
	var docOdTrack = tools.open_doc(trackID);
	
	if (docOdTrack == undefined)
		throw "Не найден трек с указанным ID";
	
	var teOdTrack = docOdTrack.TopElem;
	
	var trackDays = getCustomElemJson(teOdTrack, 'days_json');
	
	var trackDay = ArrayOptFind(trackDays, 'This.id == OptInt(dayID)');
	
	if (trackDay == undefined)
		throw "Не найден день с указанным ID";
	
	return makeApiObj_TrackDay_Detailed(trackDay);
}

function GetTrackDayTask(trackID, dayID, taskID)
{
	updateTrack(trackID, { useCache: false });
	
	var docOdTrack = tools.open_doc(trackID);
	
	if (docOdTrack == undefined)
		throw "Не найден трек с указанным ID";
	
	var teOdTrack = docOdTrack.TopElem;
	
	var trackDays = getCustomElemJson(teOdTrack, 'days_json');
	
	var trackDay = ArrayOptFind(trackDays, 'This.id == OptInt(dayID)');
	
	if (trackDay == undefined)
		throw "Не найден день с указанным ID";
	
	var oTask = ArrayOptFind(trackDay.tasks, 'This.id == taskID');
	
	if (oTask == undefined)
		throw "Не найдена задача с указанным ID";
	
	return makeApiObj_TrackDayTask(oTask, trackDay);
}

function SetTrackDayTaskStatus(trackID, dayID, taskID, newStatus)
{
	var docOdTrack = tools.open_doc(trackID);
	
	if (docOdTrack == undefined)
		throw "Не найден трек с указанным ID";
	
	var teOdTrack = docOdTrack.TopElem;
	
	var trackDays = getCustomElemJson(teOdTrack, 'days_json');
	
	var trackDay = ArrayOptFind(trackDays, 'This.id == OptInt(dayID)');
	
	if (trackDay == undefined)
		throw "Не найден день с указанным ID";
	
	var oTask = ArrayOptFind(trackDay.tasks, 'This.id == taskID');
	
	if (oTask == undefined)
		throw "Не найдена задача с указанным ID";
	
	var taskType = ArrayOptFind(TASK_TYPES, 'This.code == oTask.type');
	
	if (taskType == undefined || !taskType.manualCompletion)
		throw "Этой задаче нельзя изменить статус вручную";
	
	var isNewStatusAllowed = false;
	
	for (key in TASK_STATUS)
	{
		if (TASK_STATUS[key] == newStatus)
		{
			isNewStatusAllowed = true;
			break;
		}
	}
	
	if (!isNewStatusAllowed)
		throw "Задаче нельзя установить такой статус";
	
	oTask.status = newStatus;
	
	setCustomElemVal(teOdTrack, 'days_json', EncodeJson(trackDays));
	
	docOdTrack.Save();
	
	updateTrack(docOdTrack, { useCache: false });
	
	return { ok: true };
}

function GetMyArchivedTasks(skip, take)
{
	var oTasks_Done = getTracksTasks({
		collID: curPersonID,
		status: TASK_STATUS.DONE
	});
	
	var oTasks_Failed = getTracksTasks({
		collID: curPersonID,
		status: TASK_STATUS.FAILED
	});
	
	var oTasks = ArrayUnion(oTasks_Done, oTasks_Failed);
	//var oTasks = oTasks_Done;
	
	var apiTasks = [];
	
	//oTasks = ArraySort(oTasks, 'lastActivityDate', '-');
	
	skip = OptInt(skip);
	take = OptInt(take);
	
	var filter = decodeJsonOpt(Request.Body);
	
	var apiTask;
	
	var orderBy = 'lastActivityDate';
	var orderDirection = 'DESC';
	var skipTask;
	
	//alert("filter: "+EncodeJson(filter));
	//alert("ArrayCount(oTasks): "+ArrayCount(oTasks));
	
	for (oTask in oTasks)
	{
		//alert("oTask: "+EncodeJson(oTask));
		
		apiTask = makeApiObj_TrackDayTask(oTask);
		
		skipTask = false;
		
		if (filter != undefined)
		{
			for (fieldKey in filter.fields)
			{
				field = filter.fields[fieldKey];
				
				//alert("fieldKey: "+fieldKey);
				//alert("field: "+EncodeJson(field));
				
				if (field.HasProperty('order'))
				{
					orderBy = fieldKey;
					orderDirection = field.order;
				}
				
				if (field.HasProperty('filter'))
				{
					filterDataType = DataType(field.filter);
					
					//alert("filterDataType: "+filterDataType);
					
					if (filterDataType == 'string')
					{
						if (!apiTask.HasProperty(fieldKey) || !StrContains(apiTask[fieldKey], field.filter, true))
						{
							//alert("skip 1");
							skipTask = true;
							break;
						}
					}
					else if (filterDataType == 'object' && IsArray(field.filter))
					{
						//alert("##cond array");
						
						skipTask = true;
						
						if (apiTask.HasProperty(fieldKey))
						{
							//alert("##cond array #1 apiTask[fieldKey]: "+apiTask[fieldKey]);
							
							for (filterItem in field.filter)
							{
								//alert("##cond array #2 filterItem: "+filterItem);
								
								
								if (apiTask[fieldKey] == filterItem)
								{
									//alert("##cond array #3");
									skipTask = false;
									break;
								}
							}
						}
						
						if (skipTask)
							break;
					}
					else if (filterDataType == 'object' && !IsArray(field.filter))
					{
						//alert("##cond object");
						
						if (field.filter.HasProperty('from'))
						{
							//alert("##cond from")
							//alert("OptDate(field.filter.from): "+OptDate(field.filter.from));
							//alert("OptDate(apiTask[fieldKey]): "+OptDate(apiTask[fieldKey]));
							
							
							if (OptDate(field.filter.from) > OptDate(apiTask[fieldKey]))
							{
								//alert("skip 2");
								skipTask = true;
								break;
							}
						}
						
						if (field.filter.HasProperty('to'))
						{
							//alert("##cond to")
							//alert("OptDate(field.filter.to): "+OptDate(field.filter.to));
							//alert("OptDate(apiTask[fieldKey]): "+OptDate(apiTask[fieldKey]));
							
							if (OptDate(apiTask[fieldKey]) > OptDate(field.filter.to))
							{
								//alert("skip 3");
								skipTask = true;
								break;
							}
						}
					}
				}
			}
		}
		
		//break;
		
		if (skipTask)
			continue;
		
		apiTasks.push(apiTask);
	}
	
	var totalCount = ArrayCount(apiTasks);
	
	if (orderBy != undefined)
	{
		apiTasks = ArraySort(apiTasks, orderBy, (orderDirection == 'DESC' ? '-' : '+'));
	}
	
	if (skip >= 0 && take > 0)
	{
		apiTasks = ArrayRange(apiTasks, skip, take);
	}
	
	/*return {
		skip: skip,
		take: take,
	};*/
	
	
	return {
		totalCount: totalCount,
		items: apiTasks
	};
}

function GetAvailableWebinarEvent(trackID, dayID, taskID)
{
	var docOdTrack = tools.open_doc(trackID);
	
	if (docOdTrack == undefined)
		throw "Не найден трек с указанным ID";
	
	var teOdTrack = docOdTrack.TopElem;
	
	var trackDays = getCustomElemJson(teOdTrack, 'days_json');
	
	var trackDay = ArrayOptFind(trackDays, 'This.id == OptInt(dayID)');
	
	if (trackDay == undefined)
		throw "Не найден день с указанным ID";
	
	var oTask = ArrayOptFind(trackDay.tasks, 'This.id == taskID');
	
	if (oTask == undefined)
		throw "Не найдена задача с указанным ID";
	
	var xEvents_Available = findImmediateEventsByEduMethod(oTask.elem.id);
	var xEvent_Finished = getFinishedWebinarEvent(curPersonID, oTask.elem.id);
	var xEvent_Active = getActiveWebinarEvent(curPersonID, oTask.elem.id);

	var result = {};
	
	result.avcnt = ArrayCount(xEvents_Available);
	
	if (xEvents_Available != undefined && IsArray(xEvents_Available) && ArrayCount(xEvents_Available) > 0)
	{
		result.availableEvents = [];
		
		for (xEvent_Available in xEvents_Available)
		{
			result.availableEvents.push(makeApiObj_WebinarEvent(xEvent_Available));
		}
	}
	else
	{
		result.availableEvents = null;
	}
	
	result.finishedEvent = xEvent_Finished != undefined ? makeApiObj_WebinarEvent(xEvent_Finished) : null;
	result.activeEvent = xEvent_Active != undefined ? makeApiObj_WebinarEvent(xEvent_Active) : null;
	
	return result;
}

function IncludeCurPersonInWebinarEvent(trackID, dayID, taskID, eventID)
{
	var docOdTrack = tools.open_doc(trackID);
	
	if (docOdTrack == undefined)
		throw "Не найден трек с указанным ID";
	
	var teOdTrack = docOdTrack.TopElem;
	
	var trackDays = getCustomElemJson(teOdTrack, 'days_json');
	
	var trackDay = ArrayOptFind(trackDays, 'This.id == OptInt(dayID)');
	
	if (trackDay == undefined)
		throw "Не найден день с указанным ID";
	
	var oTask = ArrayOptFind(trackDay.tasks, 'This.id == taskID');
	
	if (oTask == undefined)
		throw "Не найдена задача с указанным ID";
	
	var xEvents_Available = findImmediateEventsByEduMethod(oTask.elem.id);
	
	var xEvent = ArrayOptFind(xEvents_Available, 'This.id == OptInt(eventID)');
	
	if (xEvent == undefined)
		throw "Нельзя участвовать в этом мероприятии"+ArrayCount(xEvents_Available);
	
	if (tools.add_person_to_event(curPersonID, xEvent.id) != null)
	{
		oTask.eventID = xEvent.id;
		
		setCustomElemVal(teOdTrack, 'days_json', EncodeJson(trackDays));
		
		docOdTrack.Save();
	}
	
	return {
		ok: true
	}
}

function RemoveCurPersonFromWebinarEvent(trackID, dayID, taskID, eventID)
{
	var docOdTrack = tools.open_doc(trackID);
	
	if (docOdTrack == undefined)
		throw "Не найден трек с указанным ID";
	
	var teOdTrack = docOdTrack.TopElem;
	
	var trackDays = getCustomElemJson(teOdTrack, 'days_json');
	
	var trackDay = ArrayOptFind(trackDays, 'This.id == OptInt(dayID)');
	
	if (trackDay == undefined)
		throw "Не найден день с указанным ID";
	
	var oTask = ArrayOptFind(trackDay.tasks, 'This.id == taskID');
	
	if (oTask == undefined)
		throw "Не найдена задача с указанным ID";
	
	tools.del_person_from_event(curPersonID, OptInt(eventID));
	
	oTask.eventID = undefined;
		
	setCustomElemVal(teOdTrack, 'days_json', EncodeJson(trackDays));
	
	docOdTrack.Save();
	
	return {
		ok: true
	}
}

function TestRoutes() {
	return "
		{ url: '/init/', handler: 'GetInitData' },
		{ url: '/misc_tasks/my/assigned/', handler: 'GetMyActiveMiscTasks' },
		{ url: '/misc_task/{task_id:int}/', handler: 'GetMiscTask' },
		{ url: '/tasks/my/assigned/', handler: 'GetMyActiveTasks' },
		{ url: '/tracks/my/active/', handler: 'GetMyActiveTracks' },
		{ url: '/track/{id:int}', handler: 'GetTrack' },
		{ url: '/track/{track_id:int}/day/{day_id:int}', handler: 'GetTrackDay' },
		{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/set_status/{status}', handler: 'SetTrackDayTaskStatus' },
		{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}', handler: 'GetTrackDayTask' },
		{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/events', handler: 'GetAvailableWebinarEvent' },
		{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/event/{event_id:int}/join', handler: 'IncludeCurPersonInWebinarEvent' },
		{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/event/{event_id:int}/leave', handler: 'RemoveCurPersonFromWebinarEvent' },
		{ url: '/archive/{skip:int}/{take:int}', handler: 'GetMyArchivedTasks' },
		{ url: '/archive/', handler: 'GetMyArchivedTasks' },
		{ url: '/testit/', handler: 'TestIt' },
	";
	
}
	
function TestIt() {
	
	var collID1 = 6597890888223519365;
	var collID2 = 7118528726527853530;
	var collID3 = 6790627446108461055;
	
	var tracks1 = getTracks({collID: collID1});
	var tracks2 = getTracks({collID: collID2});
	var tracks3 = getTracks({collID: collID3});
		
	
	var oTasks1 = getTracksTasks({
		collID: collID1,
		status: TASK_STATUS.DONE
	});
	
	var oTasks2 = getTracksTasks({
		collID: collID2,
		status: TASK_STATUS.DONE
	});
	
	var oTasks3 = getTracksTasks({
		collID: collID3,
		status: TASK_STATUS.DONE
	});
	
	
	return {
		tracks1: ArrayCount(tracks1),
		tracks2: ArrayCount(tracks2),
		tracks3: ArrayCount(tracks3),
		oTasks1: ArrayCount(oTasks1),
		oTasks2: ArrayCount(oTasks2),
		oTasks3: ArrayCount(oTasks3),
	}
}

function makeApiObj_Track(docOdTrackOrID)
{
	var docOdTrack = openDocElemID(docOdTrackOrID);
	var teOdTrack = docOdTrack.TopElem;
	
	var docOdTrackTemplate = tools.open_doc(teOdTrack.object_id);
	var teOdTrackTemplate = docOdTrackTemplate != undefined ? docOdTrackTemplate.TopElem : undefined; 
	
	var trackTemplateData = teOdTrackTemplate != undefined ? getCustomElemJson(teOdTrackTemplate, 'data_json') : {};
	
	var trackDays = getCustomElemJson(teOdTrack, 'days_json');
	
	var apiTrackDays = [];
	
	for (trackDay in trackDays)
	{
		apiTrackDays.push(makeApiObj_TrackDay_Detailed(trackDay));
	}
	
	var nextActiveTask = getTrackFirstAssignedTask(docOdTrack);
	
	return {
	    id: docOdTrack.DocID + '',
	    name: (teOdTrackTemplate != undefined ? teOdTrackTemplate.name + '' : '---Трек удален---'),
		desc: trackTemplateData.GetOptProperty('desc', ''),
		mentor: makeApiObj_Person(), //@person,
		imageUrl: (teOdTrackTemplate != undefined ? normalizeUrl(trackTemplateData.GetOptProperty('imageUrl', DEFAULT_IMAGE_URL)) : DEFAULT_IMAGE_URL),
		nextTaskId: (nextActiveTask != undefined ? nextActiveTask.id : null),
		showBigBanner: tools_web.is_true(trackTemplateData.GetOptProperty('showBigBanner', '')),
		status: normalizeTrackStatus(teOdTrack.status_id),
	    days: apiTrackDays
	}
}

function makeApiObj_TrackDay(trackDay)
{	
	var tasks_Common = ArraySelect(trackDay.tasks, "This.type == 'task'");
	var tasks_Video = ArraySelect(trackDay.tasks, "This.type == 'video'");
	var tasks_Tests = ArraySelect(trackDay.tasks, "This.type == 'test'");
	
	var nextActiveTask = getDayFirstAssignedTask(trackDay);
	
	return {
		id: trackDay.id,
		desc: trackDay.GetOptProperty('desc', 'Описание дня'),
		status: trackDay.status,
		progress: makeApiObj_Progress(countTrackDayProgress(trackDay)), // @progress,
		nextTaskId: (nextActiveTask != undefined ? nextActiveTask.id : null),
		tasksNumber: ArrayCount(tasks_Common),
		videosNumber: ArrayCount(tasks_Video),
		testsNumber: ArrayCount(tasks_Tests),
	}
}

function makeApiObj_TrackDay_Detailed(trackDay)
{
	var apiObj_TrackDay = makeApiObj_TrackDay(trackDay);
	
	apiObj_TrackDay.tasks = [];
	
	for (oTask in trackDay.tasks)
	{
		apiObj_TrackDay.tasks.push(makeApiObj_TrackDayTask(oTask, trackDay));
	}
	
	return apiObj_TrackDay;
}

/*function makeApiObj_TrackDayTask(trackDayTask, trackDay)
{
	var oApiTask;
	
	if (isTaskWebinar(trackDayTask))
	{
		var xEvents = findImmediateEventsByEduMethod(trackDayTask.elem.id);
		
		oApiTask = makeApiObj_TrackDayWebinarTask(trackDayTask, trackDay);
	}
	else
	{
		oApiTask = makeApiObj_TrackDayGenericTask(trackDayTask, trackDay);
	}
}*/

function isTaskWebinar(oTask)
{
	return oTask.type == 'webinar';
}

function makeApiObj_TrackDayTask(trackDayTask, trackDay)
{	
	var taskName = trackDayTask.name;
	
	if (taskName == '')
	{
		if (trackDayTask.HasProperty('elem') && trackDayTask.elem.HasProperty('name'))
			taskName = trackDayTask.elem.name;
	}
	
	var subtasks = [];
	
	alert("EncodeJson(subtasks): "+EncodeJson(subtasks));
	
	for (oSubTask in trackDayTask.GetOptProperty('subtasks', []))
	{
		alert("EncodeJson(oSubTask): "+EncodeJson(oSubTask));
		subtasks.push(makeApiObj_TrackDayTask(oSubTask, trackDay));
	}

	return {
		id: trackDayTask.id, // { type: "string", regex: "\\d+" }
		type: trackDayTask.type, // { enum: [ "simple", "course", "test", "webinar", "video" ] }
		name: taskName,
		status: trackDayTask.status, // { enum: [ "assigned", "inProgress", "done", "cancelled" ] }
		day: (trackDay != undefined ? trackDay.id : undefined),
		duration: {
			value: 1,
			unit: "hour" // { enum: [ "second", "minute", "hour", "day", "week", "month", "year" ] }
		},
		educationType: "required", // { enum: [ "required", "auxiliary" ] }
		selfAssigned: tools_web.is_true(trackDayTask.GetOptProperty('selfAssigned', false)),
		progress: makeApiObj_Progress({ current: trackDayTask.GetOptProperty('score', '-'), total: trackDayTask.GetOptProperty('maxScore', '-') }),
		executionTime: (tools_web.is_true(trackDayTask.GetOptProperty('useExecutionTime') ? trackDayTask.GetOptProperty('executionTime', 0) : undefined)),
		assignedAtDate: OptDate(trackDayTask.GetOptProperty('assignedAtDate')), // { type: "date", optional: true }
		assignedBy: trackDayTask.GetOptProperty('assignedBy', ''),
		lastActivityDate: OptDate(trackDayTask.GetOptProperty('assignedAtDate')), // { type: "date", optional: true }
		finishDate: OptDate(trackDayTask.GetOptProperty('assignedAtDate')), // { type: "date", optional: true }
		desc: trackDayTask.GetOptProperty('desc', ''), // { optional: true }
		imageUrl: trackDayTask.GetOptProperty('imageUrl', DEFAULT_IMAGE_URL),
		linkUrl: trackDayTask.GetOptProperty('linkUrl', makeDayTaskUrl(trackDayTask)),
		showBigBanner: trackDayTask.GetOptProperty('showBigBanner', ''),
		subtasks: subtasks,
		event: {
			id: 0,
			date: "23.34.2024 44:55"
		},
		materials: [],
		tags: []
	};
}

/*function makeApiObj_TrackDayWebinarTask(trackDayTask, trackDay)
{
	var xEvents_Available = findImmediateEventsByEduMethod(trackDayTask.elem.id);
	var xEvent_Finished = getFinishedWebinarEvent(curPersonID, trackDayTask.elem.id);
	
	var apiObj_Task = makeApiObj_TrackDayTask(trackDayTask, trackDay);
	
	if (xEvents_Available != undefined && IsArray(xEvents_Available) && ArrayCount(xEvents_Available) > 0)
	{
		apiObj_Task.availableEvents = [];
		
		for (xEvent_Available in xEvents_Available)
		{
			apiObj_Task.availableEvents.push(makeApiObj_WebinarEvent(xEvent_Available));
		}
	}
	else
	{
		apiObj_Task.availableEvents = null;
	}
	
	apiObj_Task.finishedEvent = xEvent_Finished != undefined ? makeApiObj_WebinarEvent(xEvent_Finished) : null;
	
	return apiObj_Task;
}*/

function makeApiObj_WebinarEvent(teEvent)
{
	return {
		id: teEvent.id +'',
		name: teEvent.name +'',
		startDate: teEvent.start_date +'',
		endDate: teEvent.finish_date +'',
	}
}

function makeApiObj_Person(tePerson)
{
	var oPerson = {
		firstname: "",
		lastname:  "",
		location: "", // { optional: true }
		positionName:  "" // { optional: true }
	};
	
	if (tePerson != undefined)
	{
		oPerson = {
			firstname: tePerson.firstname +"",
			lastname: tePerson.lastname +"",
			location: "", // { optional: true }
			positionName: tePerson.position_name +"" // { optional: true }
		};
	}
	
	return oPerson;
}

function makeApiObj_Progress(data)
{
	if (data == undefined)
		data = { current: 0, total: 0 };
	
	return {
		current: data.current,
		total: data.total
	}
}

function makeDayTaskUrl(dayTask)
{
	//testUrl = "test_launch.html?assessment_id="+000+"&object_id="+000+"&sid="+tools_web.get_sum_sid(procID, Request.Session.sid)
	//courseUrl = "course_launch.html?course_id="+000+"&object_id="+000+"&sid="+tools_web.get_sum_sid(procID, Request.Session.sid)
	
	var relUrl;
	
	if (!dayTask.HasProperty('elem') || !dayTask.elem.HasProperty('activeID'))
		return '';
	
	if (dayTask.type == 'test')
		//relUrl = 'test_learning_proc?&object_id='+getRealTestLearningID(dayTask.elem.activeID);
		relUrl =
			"test_launch.html?assessment_id="+dayTask.elem.id
			+"&object_id="+getRealTestLearningID(dayTask.elem.activeID)
			+"&sid="+tools_web.get_sum_sid(dayTask.elem.id, Request.Session.sid);
	else if (dayTask.type == 'course')
		//relUrl = 'learning_proc?&object_id='+getRealLearningID(dayTask.elem.activeID);
		relUrl =
			"course_launch.html?course_id="+dayTask.elem.id
			+"&object_id="+getRealLearningID(dayTask.elem.activeID)
			+"&sid="+tools_web.get_sum_sid(dayTask.elem.id, Request.Session.sid)
			+"&launch_id="+tools_web.encrypt_launch_id(dayTask.elem.activeID, DateOffset(Date(), 86400*365));
	
	//return UrlAppendPath(global_settings.settings.portal_base_url, relUrl);
	return UrlAppendPath(HOST_URL, relUrl);
}

//function makeCourseUrl(courseID

testPersonID = OptInt(tools_web.get_web_param(curParams, 'testPersonID', '', true));
useTestPerson = tools_web.is_true(tools_web.get_web_param(curParams, 'useTestPerson', '', true));

curPersonID = useTestPerson && testPersonID > 0 ? testPersonID : curUserID;
//curPersonID = curUserID;
curPerson = tools.open_doc(curPersonID).TopElem;


Request.RespContentType = "application/json";

Request.AddRespHeader("Access-Control-Allow-Origin", Request.Header.GetOptProperty("Origin", "*"));
//Request.AddRespHeader("Access-Control-Allow-Origin", 'http://srvap869');
//Request.AddRespHeader("Access-Control-Allow-Origin", '*');
Request.AddRespHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control, Cookie, Connection, Host, Origin, X-Auth-Token, X-Ivs-Session");
Request.AddRespHeader("Access-Control-Allow-Credentials", "true");
Request.AddRespHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
//Request.AddRespHeader("Access-Control-Allow-Methods", "*");
Request.AddRespHeader("Access-Control-Max-Age", "60");


apiPath = Request.UrlPath;

alert("Request.Method: "+Request.Method);

//alert("apiPath: "+apiPath);

useApiRoute(apiPath, [
	{ url: '/init/', handler: 'GetInitData' },
	{ url: '/misc_tasks/my/assigned/', handler: 'GetMyActiveMiscTasks' },
	{ url: '/misc_task/{task_id:int}/', handler: 'GetMiscTask' },
	{ url: '/tasks/my/assigned/', handler: 'GetMyActiveTasks' },
	{ url: '/tracks/my/active/', handler: 'GetMyActiveTracks' },
	{ url: '/track/{id:int}', handler: 'GetTrack' },
	{ url: '/track/{track_id:int}/day/{day_id:int}', handler: 'GetTrackDay' },
	{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/set_status/{status}', handler: 'SetTrackDayTaskStatus' },
	{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}', handler: 'GetTrackDayTask' },
	{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/events', handler: 'GetAvailableWebinarEvent' },
	{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/event/{event_id:int}/join', handler: 'IncludeCurPersonInWebinarEvent' },
	{ url: '/track/{track_id:int}/day/{day_id:int}/task/{task_id}/event/{event_id:int}/leave', handler: 'RemoveCurPersonFromWebinarEvent' },
	{ url: '/archive/{skip:int}/{take:int}', handler: 'GetMyArchivedTasks' },
	{ url: '/archive/', handler: 'GetMyArchivedTasks' },
	{ url: '/testit/', handler: 'TestIt' },
	{ url: '/test_routes/', handler: 'TestRoutes' },
], {
	prefix: '/rneduapi'
});

%>