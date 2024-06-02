<%
function GetInitData()
{
	var taskTypes = [
	  { id: 'task', name: 'Задача', isDefault: true },
	  { id: 'course', name: 'Электронный курс', catalog: 'course' },
	  { id: 'test', name: 'Тест', catalog: 'assessment' },
	  { id: 'webinar', name: 'Вебинар', catalog: 'education_method' },
	  //{ id: 'video', name: 'Видео', catalog: 'education_method' }
	]
	
	//taskTypes = ArraySort(taskTypes, 'isDefault', '-', 'name', '+');
	taskTypes = ArraySort(taskTypes, 'name', '+');
	
	return {
		ok: true,
		taskTypes: taskTypes
	}
}

function GetTracks()
{
	var xodTrackTemplates = getElemsByKey('object_data', { object_data_type_id: getODTypeID_TrackTemplate() });
	
	var trackTemplates = [];
	
	for (xodTrackTemplate in xodTrackTemplates)
	{
		trackTemplates.push({
			id: xodTrackTemplate.id +'',
			name: xodTrackTemplate.name +''
		});
	}
	
	return {
		ok: true,
		errorMessages: [],
		trackTemplates: trackTemplates
	}
}

function GetTrack(trackID)
{
	var docOdTrackTemplate = tools.open_doc(trackID);
	
	var teOdTrackTemplate = docOdTrackTemplate.TopElem;
	
	var track = getCustomElemJson(teOdTrackTemplate, 'data_json');
	
	track.id = docOdTrackTemplate.DocID +'';
	
	return {
		ok: true,
		errorMessages: [],
		track: track
	};
		
	/*return {
		ok: true,
		errorMessages: [],
		track: {
			name: 'sdfdsfdsf',
			subdivs: [{
				id: '3243432',
				name: 'Подразделение 1'
			}],
			positions: [{
				id: '3243432',
				name: 'Подразделение 1'
			}],
			workedPeriod: {
				min: 2,
				max: 4,
				unit: 'month'
			},
			requiredTracks: [{
				id: '3243432',
				name: 'Подразделение 1'
			}],
			requiredCourses: [{
				id: '3243432',
				name: 'Подразделение 1'
			}],
			requiredTests: [{
				id: '3243432',
				name: 'Подразделение 1'
			}],
			requiredPrograms: [{
				id: '3243432',
				name: 'Подразделение 1',
				periodAfterCompleting: {
					min: 3,
					unit: 'month'
				}
			}],
			days: [{
				id: 1,
				tasks: [{
					id: '32k43h43',
					type: 'course',
					objectId: '324342',
					name: 'Первичный сектор экономики',
					desc: 'Так называемая сфера услуг. Часто выделяют из третичного сектора экономики',
				}]
			}]
		}
	}*/
}

function SaveTrack(trackID, data)
{
	alert("trackID: "+trackID);
	alert("data: "+EncodeJson(data));
	
	var docOdTrackTemplate;
	
	if (trackID == 0)
	{
		docOdTrackTemplate = tools.new_doc_by_name('object_data');
		docOdTrackTemplate.BindToDb(DefaultDb);
	}
	else if (trackID > 0)
	{
		docOdTrackTemplate = tools.open_doc(trackID);
	}
		
	var teOdTrackTemplate = docOdTrackTemplate.TopElem;
	
	if (docOdTrackTemplate.NeverSaved)
	{
		teOdTrackTemplate.object_data_type_id = getODTypeID_TrackTemplate();
	}
	
	try {
		teOdTrackTemplate.name = data.name;
	} catch(e) {}
	
	data.id = undefined;
	
	
	
	for (day in data.days)
	{
		for (oTask in day.tasks)
		{
			if (oTask.type == 'course')
				updateCourseTaskSubitemsData(oTask);
			
			if (oTask.type == 'course' || oTask.type == 'test' || oTask.type == 'webinar')
			{
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
		trackTemplateId: docOdTrackTemplate.DocID +'',
		errorMessages: []
	}
}

function DeleteTrackTemplate(trackTemplateID)
{
	var xodTrackTemplateID = getElemIDByKey('object_data', {
		id: trackTemplateID,
		object_data_type_id: getODTypeID_TrackTemplate()
	});
	
	var docOdTrackTemplate = tools.open_doc(trackTemplateID);
	
	var isTrackTemplate =
		docOdTrackTemplate != undefined
		&& docOdTrackTemplate.Form.TopElem.Name == 'object_data'
		&& docOdTrackTemplate.TopElem.object_data_type_id == getODTypeID_TrackTemplate();
	
	if (!isTrackTemplate)
		return { ok: false, errorMessages: ['Данный объект не является шаблоном трека']};
	
	var deleted = deleteOptDoc(docOdTrackTemplate.DocID);
	
	return {
		ok: deleted
	};
}

function SearchColls(searchText, includeBosses)
{
	includeBosses = bool(includeBosses, true);
	
	// TODO includeBosses
	
	if (StrCharCount(searchText) < 3)
		return { ok: false, errorMessages: ['Введенный текст слишком короткий']};
	
	var xColls = ArraySelectAll(XQuery("
		for $elem in collaborators
		where
			contains($elem/fullname, "+XQueryLiteral(searchText)+")
		return
			$elem/id,
			$elem/fullname,
			$elem/position_name,
			$elem/position_parent_name
	"));
	
	if (ArrayCount(xColls) > 1000)
		return { ok: false, errorMessages: ['Найдено слишком много результатов. Уточните ваш запрос.']};
	
	var oColls = [];
	
	for (xColl in xColls)
	{
		oColls.push({
			id: xColl.id +'',
			fullname: xColl.fullname +'',
			positionName: xColl.position_name +'',
			subdivName: xColl.position_parent_name +'',
		});
	}
	
	return {
		ok: true,
		colls: oColls,
		errorMessages: []
	};
}

function SearchSubdivs(searchText)
{	
	if (StrCharCount(searchText) < 3)
		return { ok: false, errorMessages: ['Введенный текст слишком короткий']};
	
	var xSubdivs = ArraySelectAll(XQuery("
		for $elem in subdivisions
		where
			contains($elem/name, "+XQueryLiteral(searchText)+")
		return
			$elem/id,
			$elem/name
	"));
	
	if (ArrayCount(xSubdivs) > 1000)
		return { ok: false, errorMessages: ['Найдено слишком много результатов. Уточните ваш запрос.']};
	
	var oSubdivs = [];
	
	for (xSubdiv in xSubdivs)
	{
		oSubdivs.push({
			id: xSubdiv.id +'',
			name: xSubdiv.name +''
		});
	}
	
	return {
		ok: true,
		subdivs: oSubdivs,
		errorMessages: []
	};
}

function SearchInCatalog(virtualCatalog, searchText, getAllData)
{		
	if (getAllData == undefined)
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
			xquery: '$elem/object_data_type_id = '+getODTypeID_TrackTemplate(),
			nameField: 'name'
		},
	};
	
	

	var allowedCatalog = allowedCatalogs.GetOptProperty(virtualCatalog);
	
	if (allowedCatalog == undefined)
		return { ok: false, errorMessages: ['Поиск в этом каталоге недоступен']};

	var catalog = allowedCatalog.GetOptProperty('realCatalog', virtualCatalog);

	if (StrCharCount(searchText) < 3 && !getAllData)
		return { ok: false, errorMessages: ['Введенный текст слишком короткий']};
	
	var xqFilters = [];
	
	if (allowedCatalog.HasProperty('xquery'))
		xqFilters.push(allowedCatalog.xquery);
	
	if (!getAllData)
		xqFilters.push("contains($elem/"+allowedCatalog.nameField+", "+XQueryLiteral(searchText)+")");
	
	var xqFiltersStr = xqFilters.length > 0 ? ' where '+xqFilters.join(' and ') : '';
	
	var xElems = ArraySelectAll(safeXQuery("
		for $elem in "+catalog+"s
		"+xqFiltersStr+"
		return $elem
	"));
	
	if (allowedCatalog.GetOptProperty('onlyUniqNames', false))
		xElems = ArraySelectDistinct(xElems, 'This.name');
		
	
	if (ArrayCount(xElems) > 1000 && !getAllData)
		return { ok: false, errorMessages: ['Найдено слишком много результатов. Уточните ваш запрос.']};
	
	var oElems = [];
	
	for (xElem in xElems)
	{
		oElems.push({
			id: xElem.id +'',
			name: xElem.Child(allowedCatalog.nameField) +''
		});
	}
	
	return {
		ok: true,
		elems: oElems,
		errorMessages: []
	};
}

function getAvailableTrackImages()
{
	var fileUrls = ReadDirectory("x-local://wt/web/rnedu/images/tracks");
	
	var images = [];
	
	for (fileUrl in fileUrls)
	{
		if (IsDirectory(fileUrl))
			continue;
		
		images.push({
			//id: Md5Hex(fileUrl),
			url: StrReplace(fileUrl, 'x-local://wt/web/', '')
		});
	}
	
	return images;
}


curPersonID = curUserID;
curPerson = tools.open_doc(curPersonID).TopElem;

action = getFormValText('action');

if (action == 'GetInitData')
{
	outAsJson(GetInitData());
}
else if (action == 'GetAvailableTrackImages')
{
	outAsJson(getAvailableTrackImages());
}
else if (action == 'GetTracks')
{
	outAsJson(GetTracks());
}
else if (action == 'GetTrack')
{
	trackID = getFormValInt('trackID');
	
	outAsJson(GetTrack(trackID));
}
else if (action == 'SaveTrack')
{
	trackID = getFormValInt('trackID');
	trackData = getFormValJson('data_json').track;
	
	outAsJson(SaveTrack(trackID, trackData));
}
else if (action == 'DeleteTrackTemplate')
{
	trackID = getFormValInt('trackID');
	
	outAsJson(DeleteTrackTemplate(trackID));
}
else if (action == 'SearchColls')
{
	searchText = getFormValText('search_text');
	
	outAsJson(SearchColls(searchText));
}
else if (action == 'SearchSubdivs')
{
	searchText = getFormValText('search_text');
	
	outAsJson(SearchSubdivs(searchText));
}
else if (action == 'SearchInCatalog')
{
	catalog = getFormValText('catalog');
	searchText = getFormValText('searchText');
	getAll = getFormValBool('getAll');
	
	alert("catalog: "+catalog);
	alert("searchText: "+searchText);
	
	outAsJson(SearchInCatalog(catalog, searchText, getAll));
}
else
{
	outAsJson({
		ok: false,
		message: 'No such method'
	});
}

%>