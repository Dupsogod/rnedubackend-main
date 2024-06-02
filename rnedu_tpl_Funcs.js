<%

ROLE_TRACKS_CODE = 'rnedu_tracks';

OD_TYPE_TRACK_TEMPLATE_CODE = 'rnedu_track_template';
OD_TYPE_TRACK_CODE = 'rnedu_track';

DAY_STATUS = {
	LOCKED: 'locked',
	ACTIVE: 'active',
	DONE: 'done'
}
	
TASK_STATUS = {
	LOCKED: 'locked',
	ASSIGNED: 'assigned',
	IN_PROGRESS: 'inProgress',
	FAILED: 'failed',
	DONE: 'done',
	CANCELLED: 'cancelled',
}

TRACK_STATUS = {
	ACTIVE: 'active',
	CLOSED: 'close',
	CANCELLED: 'ignore',
	DONE: 'pay',
}

TASK_TYPES = [
	//{ code: 'task', name: 'Задача', isPractical: true, manualCompletion: true, initStatus: TASK_STATUS.DONE },
	{ code: 'task', name: 'Задача', isPractical: true, manualCompletion: true },
	{ code: 'course', name: 'Курс', isPractical: false, manualCompletion: false },
	{ code: 'test', name: 'Тест', isPractical: true, manualCompletion: false },
	{ code: 'webinar', name: 'Вебинар', isPractical: false, manualCompletion: false },
	{ code: 'video', name: 'Видео', isPractical: false, manualCompletion: true, initStatus: TASK_STATUS.DONE },
	//{ code: '', name: '', isPractical: true },
];


function alertExecTime(label, tempObj)
{
	if (tempObj.HasProperty('disabled') && tempObj.disabled)
		return true;
	
	var curTicks = GetCurTicks();
	
	if (!tempObj.HasProperty('startExecTime') || tempObj.startExecTime == undefined)
		tempObj.startExecTime = curTicks;
	
	var execTime = Real(curTicks - tempObj.startExecTime) / 1000;
	alert(label+": "+execTime+" sec.");
	
	tempObj.startExecTime = curTicks;
}

function getExecTime(tempObj)
{
	if (tempObj.HasProperty('disabled') && tempObj.disabled)
		return false;
	
	var curTicks = GetCurTicks();
	
	if (!tempObj.HasProperty('startExecTime') || tempObj.startExecTime == undefined)
		tempObj.startExecTime = curTicks;
	
	var execTime = Real(curTicks - tempObj.startExecTime) / 1000;
	
	tempObj.startExecTime = curTicks;
	
	return execTime;
}

function decodeJsonOpt(jsonStr, defaultVal)
{
	try
	{	
		return DecodeJson(jsonStr);
	}
	catch(e)
	{
		return defaultVal;
	}
}

function getQueryValText(name, defaultVal)
{
	if (defaultVal == undefined)
		defaultVal = "";

	var _value = Request.Query.GetOptProperty(name, defaultVal);
	return _value;
}

function getQueryValInt(name, defaultVal)
{
	if (defaultVal == undefined)
		defaultVal = 0;

	try {
		var _value = Request.Query.GetOptProperty(name, defaultVal);
		return Int(_value);
	} catch(e) {
		return defaultVal;
	}	
}

function getQueryValBool(name, defaultVal)
{
	return tools_web.is_true(getQueryValText(name, defaultVal));
}

function getFormValText(name, defaultVal)
{
	if (defaultVal == undefined)
		defaultVal = "";

	var _value = Request.Form.GetOptProperty(name, defaultVal);
	return _value;
}

function getFormValBool(name, defaultVal)
{
	return tools_web.is_true(getFormValText(name, defaultVal));
}

function getFormValTextArray(name, delimiter, defaultVal)
{		
	if (delimiter == undefined)
		throw "Delimiter not defined";

	var _value = Trim(getFormValText(name, defaultVal));
	
	var resultArray = [];
	
	if (_value != "")
		resultArray = _value.split(delimiter);
	
	return resultArray;
}

function getFormValIntArray(name, delimiter, defaultVal)
{		
	var textArray = getFormValTextArray(name, delimiter, defaultVal);
	
	return ArrayExtract(textArray, "OptInt(This)");
}

function getFormValDate(name, defaultVal)
{
	var _value = getFormValText(name, "");

	if (_value == "")
		return defaultVal;

	try {
		_value = ParseDate(_value);
	} catch(e) {
		return defaultVal;
	}

	return _value;
}

function getFormValInt(name, defaultVal)
{
	if (defaultVal == undefined)
		defaultVal = 0;

	try {
		var _value = Request.Form.GetOptProperty(name, defaultVal);
		return Int(_value);
	} catch(e) {
		return defaultVal;
	}	
}

function getFormValJson(name, defaultVal)
{
	var _value = decodeJsonOpt( getFormValText(name), defaultVal);
	return _value;
}

function setCustomElemVal(teObj, customElemName, newValue)
{
	if (DataType(customElemName) != 'string')
		throw 'customElemName must be string';
	
	teObj.custom_elems.ObtainChildByKey(customElemName).value = newValue;
}

function setCustomElemVals(teObj, oData)
{
	if (DataType(oData) != 'object' || IsArray(oData))
		throw 'data must be object';
	
	for (key in oData)
	{
		teObj.custom_elems.ObtainChildByKey(key).value = oData[key];
	}
}

function copyCustomFields(teSource, teTarget, customElemCodes)
{
	for (customElemCode in customElemCodes)
	{
		setCustomElemVal(teTarget, customElemCode, getCustomElemVal(teSource, customElemCode));
	}
}

function getCustomElemVal(teObj, customElemName, defaultVal)
{
	if (defaultVal == undefined)
		defaultVal = "";

	var customElem;
	customElem = teObj.custom_elems.GetOptChildByKey(customElemName);

	if (customElem != undefined)
		return customElem.value;
	else
		return defaultVal;
}

function getCustomElemInt(teObj, customElemName, defaultVal)
{
	return OptInt(getCustomElemVal(teObj, customElemName, defaultVal), defaultVal);
}

function getCustomElemBool(teObj, customElemName, defaultVal)
{
	return tools_web.is_true(getCustomElemVal(teObj, customElemName, defaultVal));
}

function getCustomElemDate(teObj, customElemName, defaultVal)
{
	try
	{
		return Date(getCustomElemVal(teObj, customElemName, ''));
	}
	catch(e)
	{
		return defaultVal;
	}
}

function getCustomElemJson(teObj, customElemName, defaultVal)
{
	return decodeJsonOpt(getCustomElemVal(teObj, customElemName, ''), defaultVal);
}

function getCustomFieldVal(teObj, customFieldName, defaultVal)
{
	if (defaultVal == undefined)
		defaultVal = "";

	var customField;
	customField = teObj.custom_fields.GetOptChildByKey(customFieldName);

	if (customField != undefined)
		return customField.value;
	else
		return defaultVal;
}

function getCustomFieldInt(teObj, customFieldName, defaultVal)
{
	return OptInt(getCustomFieldVal(teObj, customFieldName, defaultVal), defaultVal);
}

function getCustomFieldBool(teObj, customFieldName, defaultVal)
{
	return tools_web.is_true(getCustomFieldVal(teObj, customFieldName, defaultVal));
}

function getCustomFieldDate(teObj, customFieldName, defaultVal)
{
	try
	{
		return Date(getCustomFieldVal(teObj, customFieldName, ''));
	}
	catch(e)
	{
		return defaultVal;
	}
}

function getCustomFieldJSON(teObj, customFieldName, defaultVal)
{
	return decodeJsonOpt(getCustomFieldVal(teObj, customFieldName, ''), defaultVal);
}

function out(text)
{
	Response.Write(text);
}

function outAsJson(obj)
{
	Response.Write(EncodeJson(obj));
}

function outbr(text)
{
	Response.Write(text+"<br>\n");
}

function bool(val, defaultVal)
{
	if (val == undefined && defaultVal != undefined)
		return defaultVal;
	
	return tools_web.is_true(val);
}

function translate(str, dict, defaultVal)
{
	if (dict.HasProperty(str))
		return dict.GetProperty(str);
	else
		return defaultVal;
}

function translateBack(str, dict, defaultVal)
{
	for (key in dict)
		if (dict[key] == str)
			return key;
		
	return defaultVal;
}

function safeXQuery(XQString)
{
	XQString = StrReplace(XQString, 'return $elem', ' return $elem');
	
	return tools.xquery(XQString);
}

function dateOpt(str, defaultVal)
{	
	try
	{
		return Date(str);
	}
	catch(e)
	{
		return defaultVal;
	}
}

function parseDateOpt(str, defaultVal)
{	
	try
	{
		return ParseDate(str);
	}
	catch(e)
	{
		return defaultVal;
	}
}

function strDateOpt(date, showTime, showSeconds, defaultVal)
{
	try
	{
		return StrDate(date, showTime, showSeconds);
	}
	catch(e)
	{
		return defaultVal;
	}
}

function countDatesDiffInDays(date1, date2)
{
	var diffSeconds = OptReal(DateDiff(date1, date2));

	if (diffSeconds < 0)
		diffSeconds = diffSeconds * (-1);

	var diffDays = ( diffSeconds / (24*60*60));

	return diffDays;
}

function getDaysInMonth(month, year)
{
	return month === 2 ? (year & 3) > 0 || ((year % 25) == 0 && (year & 15) > 0) ? 28 : 29 : 30 + (month + (month >> 3) & 1);
}

function shiftDate(date, value, unit)
{
	if (unit == 'day')
	{
		return tools.AdjustDate(date, value);
	}
	else if (unit == 'month')
	{
		return shiftDateMonths(date, value);
	}
	else if (unit == 'year')
	{
		return shiftDateMonths(date, value * 12);
	}
	else
	{
		throw "Not supported unit: "+unit;
	}
}

function shiftDateMonths(date, months, options)
{
	options = setDefaultOptions(options, {
		keepDayInSameMonth: false
	});
	
	months = Int(months);
	
	var dateYear = Year(date);
	var dateMonth = Month(date);
	var dateDay = Day(date);
	
	var years = Int(months / 12);
	
	var restMonths = months - (years * 12);
	
	dateYear += years;
	dateMonth += restMonths;
	
	if (dateMonth > 12)
	{
		dateMonth -= 12;
		dateYear++;
	}
	
	var daysInMonth = getDaysInMonth(dateMonth, dateYear);
	
	if (dateDay > daysInMonth)
	{
		if (options.keepDayInSameMonth)
		{
			dateDay = daysInMonth;
		}
		else
		{
			dateMonth++;
			dateDay -= daysInMonth;
		}
	}
	
	if (dateMonth > 12)
	{
		dateMonth -= 12;
		dateYear++;
	}
	
	return Date(dateYear, dateMonth, dateDay);
}

function deleteOptDoc(docID, checkExisting)
{
	try
	{
		if (checkExisting == undefined)
			checkExisting = false;
		
		if (checkExisting)
		{
			var doc = tools.open_doc(docID);
			
			if (doc == undefined)
				return false;
		}
		
		DeleteDoc(UrlFromDocID(Int(docID)));
		return true;
	}
	catch(e)
	{
		alert('deleteOptDoc error: '+e);
		return false;
	}
}

function openDocElemID(docElemOrID, dbgStr)
{
    var docElem;
	
	if (OptInt(docElemOrID, 0) > 0)
	{
		if (dbgStr) alert('openDocElemID '+dbgStr+': id');
        docElem = tools.open_doc(OptInt(docElemOrID));
	}
	else
	{
		if (dbgStr) alert('openDocElemID '+dbgStr+': doc');
        docElem = docElemOrID;
	}

	return docElem;
}

function cloneObject(source)
{
	return DecodeJson(EncodeJson(source));
}

function setDefaultOptions(options, defaultOptions)
{	
	if (options == undefined)
		options = {};
	
	for (key in defaultOptions)
	{
		if (!options.HasProperty(key) || options.GetOptProperty(key) == undefined)
			options.SetProperty(key, defaultOptions[key]);
	}
	
	return options;
}

function defineObjectFields(obj, fields)
{
	if (obj == undefined)
		throw 'object not defined'
	
	var field;
	var missingRequiredFields = [];
	var unknownFields = [];
	
	
	for (fieldKey in fields)
	{
		field = setDefaultOptions(fields[fieldKey], {
			required: false,
			defaultVal: undefined
		});
		
		if (!obj.HasProperty(fieldKey))
		{
			if (field.required)
				missingRequiredFields.push(fieldKey);
			else
				obj.SetProperty(fieldKey, field.defaultVal);
		}
	}
	
	if (missingRequiredFields.length > 0)
		throw 'Required fields not defined: '+missingRequiredFields.join(', ');
	
	for (objKey in obj)
	{
		if (!fields.HasProperty(objKey))
			unknownFields.push(objKey);
	}
	
	if (unknownFields.length > 0)
		throw 'Unknown fields: '+unknownFields.join(', ');
	
	return obj;
}



function inArray(haystack, needles)
{
	if (!IsArray(needles))
		needles = [needles];
	
	var needle;
	
	for (needle in needles)
	{
		if (ArrayOptFind(haystack, "This == needle") != undefined)	
			return true;
	}
	
	return false;
}

function arrayUnionFast(array1, array2)
{
	for (elem in array2)
		array1.push(elem);
	
	return array1;
}

function arrayMap(elems, evalStr)
{
	var This, result;
	for (i = 0; i < ArrayCount(elems); i++)
	{
		This = elems[i];
		result = tools.safe_execution(evalStr);
		 
		if (DataType(This) != 'object')
			elems[i] = result;
	}
	return elems;
}

function arraySubtract(arrayMinuend, arraySubtrahend, fieldMinuend, fieldSubtrahend)
{
	if (fieldMinuend == undefined)
		fieldMinuend = 'This';
	
	if (fieldSubtrahend == undefined)
		fieldSubtrahend = fieldMinuend;
	
	var arrayCond = 'ArrayOptFind(arraySubtrahend, "'+fieldSubtrahend+' == "+CodeLiteral('+fieldMinuend+')) == undefined';
	
	var arrayResult = ArraySelect(arrayMinuend, arrayCond);
	
	return arrayResult;
}

function arrayOptLastElem(array)
{
	if (IsArray(array))
		return ArrayCount(array) > 0 ? array[ArrayCount(array)-1] : undefined;
	else
		return undefined;
}

function getCellValue(oWorkSheet, rowNum, columnNum, defaultVal)
{	
	var oCell = oWorkSheet.Cells.GetCell(getCellName(rowNum, columnNum));
	
	if (oCell.Value != undefined)
		return oCell.Value;
	else
		return defaultVal;
}

function getCellName(rowNum, columnNum)
{
	if (columnNum < 0 || rowNum < 0)
		return "";
		
	var columnLetterCodes = [];
	
	var lettersInAlphabet = Real(26);
	var columnNumRem = columnNum;
	
	while (columnNumRem >= lettersInAlphabet)
	{
		columnLetterCodes.push(columnNumRem % lettersInAlphabet);
		columnNumRem = Int(columnNumRem / lettersInAlphabet)-1;
	}
	columnLetterCodes.push(columnNumRem);
	
	var columnLetter = "";

	for (letterCode in columnLetterCodes)
		columnLetter = String.fromCharCode(65+letterCode) + columnLetter;
	
	return columnLetter+(rowNum+1);
}

function obtainDocByKey(catalog, keyValPairs, options)
{
	options = setDefaultOptions(options, {
		saveNewDoc: true,
		debug: false
	});
	
	var xElem = getElemByKey(catalog, keyValPairs);
	
	var docElem;
	
	if (xElem == undefined)
	{
		docElem = tools.new_doc_by_name(catalog);
		docElem.BindToDb(DefaultDb);
		
		for (key in keyValPairs)
		{
			if (key == 'app_instance_id')
				docElem.TopElem.doc_info.creation.app_instance_id = keyValPairs[key];
			else
				docElem.TopElem.Child(key).Value = keyValPairs[key];
		}
		
		if (options.saveNewDoc)
			docElem.Save();
	}
	else
	{
		docElem = tools.open_doc(xElem.id);
	}
	
	return docElem;
}

function existsElemByKey(catalog, keyValPairs, options)
{
	return getElemIDByKey(catalog, keyValPairs, options) != undefined;
}

function getElemByKey(catalog, keyValPairs, options)
{
	var xElems = getElemsByKey(catalog, keyValPairs, options);
	
	return ArrayOptFirstElem(xElems);
}

function getElemIDByKey(catalog, keyValPairs, options)
{
	return ArrayOptFirstElem(getElemIDsByKey(catalog, keyValPairs, options));
}

function getElemIDsByKey(catalog, keyValPairs, options)
{
	options = setDefaultOptions(options, {
		fields: ['id']
	});
	
	var xElems = getElemsByKey(catalog, keyValPairs, options);
	
	return ArrayExtract(xElems, 'id');
}

function getElemsByKey(catalog, keyValPairs, options)
{
	options = setDefaultOptions(options, {
		debug: false,
		fields: undefined
	});
	
	var XQString;
	
	try
	{		
		var XQFilters = [];
		var val, valVarians;
		
		for (key in keyValPairs)
		{
			val = keyValPairs[key];
			
			if (IsArray(val))
			{
				if (ArrayCount(val) == 0)
					return [];
				
				valVarians = [];
				
				for (valVariant in val)
					valVarians.push('$elem/'+key+' = '+XQueryLiteral(valVariant));
				
				XQFilters.push( '('+valVarians.join(' or ')+')');
			}
			else
				XQFilters.push('$elem/'+key+' = '+XQueryLiteral(val));
		}
		
		var XQFiltersStr = XQFilters.join(' and ');
		
		var XQReturnStr;
		
		if (options.fields != undefined && IsArray(options.fields))
			XQReturnStr = ArrayMerge(options.fields, "'$elem/'+This", ", ");
		else
			XQReturnStr = "$elem";
		
		XQString = "for $elem in "+catalog+"s where "+XQFiltersStr+" return "+XQReturnStr;
		
		if (options.debug)
			alert(XQString);
		
		//if (options.fields != undefined && IsArray(options.fields))
		//	alert(XQString);
		
		var result = ArraySelectAll(tools.xquery(XQString));
		return result;
	}
	catch(e)
	{
		//alert("getElemsByKey ERROR: "+e);
		alert("XQString: "+(XQString));
		
		throw e;
		//return [];
	}
}

var CACHED_ELEMs_BY_CODE = [];

function getCachedElemIDByCode(catalog, code, options)
{
	options = setDefaultOptions(options, {
		errorMessageWhenNotFound: undefined
	});
	
	var elemID;
	
	var cachedElem = ArrayOptFind(CACHED_ELEMs_BY_CODE, 'This.catalog == catalog && This.code == code');
	
	if (cachedElem != undefined)
	{
		elemID = cachedElem.id;
	}
	else
	{
		elemID = getElemIDByKey(catalog, { code: code });
		
		if (elemID == undefined && options.errorMessageWhenNotFound != undefined)
			throw options.errorMessageWhenNotFound;
		
		CACHED_ELEMs_BY_CODE.push({
			catalog: catalog,
			code: code,
			id: elemID
		});
	}
	
	return elemID;
}

function getArrayXElemField(elemID, xElems, field, defaultVal)
{
	elemID = OptInt(elemID);
	var xElem = ArrayOptFind(xElems, 'This.id == elemID');
	
	if (xElem == undefined)
		return defaultVal;
	
	return xElem.Child(field).Value;
}

function updateSdFields(teElem_Target, fields)
{
	var docElem, xmlElem;
	
	for (field in fields)
	{
		//tools.common_filling('collaborator', teElem.Child(field.name).sd, field.elemID, field.GetOptProperty('teElem') );
		
		xmlElem = undefined;
		
		if (field.HasProperty('teElem'))
		{
			xmlElem = field.teElem;
		}
		else
		{
			if (tools_web.is_true(field.GetOptProperty('useForeignElem')))
			{
				xmlElem = field.elemID.OptForeignElem;
			}
			else
			{
				docElem = tools.open_doc(field.elemID);
				xmlElem = docElem.TopElem;
			}
		}
		
		if (xmlElem == undefined)
			continue;
		
		fldSD = teElem_Target.Child(field.name).sd;
		
		fldSD.fullname = xmlElem.fullname;
		fldSD.position_name = xmlElem.position_name;
		fldSD.position_id = xmlElem.position_id;
		fldSD.org_name = xmlElem.org_name;
		fldSD.is_dismiss = xmlElem.is_dismiss;
	}
}

function copySdFields(teSource, teTarget, fieldNames)
{
	for (fieldName in fieldNames)
	{
		teTarget.Child(fieldName).sd.AssignElem(teSource.Child(fieldName).sd);
	}
}

function strReduceEllipsis(text, notLongerThanCharsNum)
{	
	var shortText = StrReduce(text, notLongerThanCharsNum);
	
	if (StrCharCount(text) > StrCharCount(shortText))
		shortText += '...';
	
	return shortText;
}

function strReduce(text, notLongerThanCharsNum)
{	
	var words = String(text).split(" ");
	
	var shortTextWords = [];
	
	for (word in words)
	{
		shortTextWords.push(word);
	
		if (StrCharCount(shortTextWords.join(" ")) > notLongerThanCharsNum)
		{
			lastButOneWordIndex = ArrayCount(shortTextWords)-2;
			
			if (lastButOneWordIndex > 0)
				shortTextWords = ArrayRange(shortTextWords, 0, lastButOneWordIndex);
				
			break;
		}
	}
	
	return shortTextWords.join(" ");
}

function int2hex(intVal)
{
	return '0x' + StrHexInt(intVal, 16);
}

CACHED_BOSS_TYPES_BY_OPERATIONS = {};

function getBossTypesByOperationCode(operationCode)
{
	var isOperationCached = CACHED_BOSS_TYPES_BY_OPERATIONS.HasProperty(operationCode);
	
	if (!isOperationCached)
	{	
		CACHED_BOSS_TYPES_BY_OPERATIONS[operationCode] = [];
		
		var operationID = getElemIDByKey('operation', { code: operationCode });
		
		if (operationID != undefined)
		{
			var xBossTypes = getBossTypesByOperationID(operationID);
			
			CACHED_BOSS_TYPES_BY_OPERATIONS[operationCode] = xBossTypes;
		}
	}
	
	return CACHED_BOSS_TYPES_BY_OPERATIONS[operationCode];
}

function getBossTypesByOperationID(operationID)
{
	var xBossTypes = ArraySelectAll(XQuery("
		for $elem in boss_types
		where
			contains($elem/operations, "+XQueryLiteral(operationID+'')+")
		return $elem
	"));
	
	return xBossTypes;
}

function getSubdivIDsWithChildren(_subdivIDs)
{
	var result = [];
	var subdivIDs, subdivID;
	
	if (!IsArray(_subdivIDs))
		subdivIDs = [_subdivIDs];
	else
		subdivIDs = _subdivIDs;

	for (subdivID in subdivIDs)
	{
		result = ArrayUnion(result, ArrayExtract(getSubdivHierarchyXQ(OptInt(subdivID)), "This.id"));
	}
	
	return result;
}


function getSubdivIDsWithParents(subdivIDs, cached)
{
	var result = [];
	
	if (!IsArray(subdivIDs))
		subdivIDs = [subdivIDs];

	for (subdivID in subdivIDs)
	{
		result = ArrayUnion(result, ArrayExtract(getSubdivWithParents(OptInt(subdivID), cached), "This.id"));
	}
	
	return result;
}

var getSubdivWithParents_CACHED_xSUBDIVS;

function getSubdivWithParents(subdivID, auxResultFields)
{
	var xSubdiv;
	
	var cached = true;
	
	if (cached)
	{
		if (getSubdivWithParents_CACHED_xSUBDIVS == undefined)
		{
			var resultFields = ['id', 'parent_object_id'];
		
			if (auxResultFields != undefined)
				resultFields = ArrayUnion(resultFields, auxResultFields);
			
			var xqResultFieldsStr = ArrayMerge(resultFields, '"$elem/"+This', ', ');
			
			getSubdivWithParents_CACHED_xSUBDIVS = ArraySelectAll(safeXQuery("
				for $elem in subdivisions
				order by
					$elem/id
				return "+xqResultFieldsStr+"
			"));
		}
		
		xSubdiv = ArrayOptFindBySortedKey(getSubdivWithParents_CACHED_xSUBDIVS, subdivID, 'id');
	}
	else
	{
		xSubdiv = getElemByID("subdivision", subdivID);	
	}
	
	var upperSubdivs = [];
	
	if (xSubdiv == undefined || xSubdiv.id == 0)
		return [];
	
	if (xSubdiv.parent_object_id > 0 && !isSubdivExcludedFromStructure(xSubdiv.id))
		upperSubdivs = getSubdivWithParents(xSubdiv.parent_object_id, cached);
	
	return ArrayUnion(upperSubdivs, [xSubdiv]);
}

function getSubdivHierarchyXQ(subdivID)
{
	var xSubdivs = XQuery("for $elem in subdivisions where $elem/id = "+subdivID+" return $elem");
	xSubdivs = ArrayUnion(xSubdivs, XQuery("CatalogHierSubset('subdivisions', "+subdivID+")"));
	return xSubdivs;
}


function addCustomExpert(tePlan, expertID, expertPersonType, responsible)
{
	if (expertID == undefined)
		return undefined;
	
	var fldCustomExpert = ArrayOptFind(tePlan.custom_experts, "
		This.person_id == OptInt(expertID)
		&& (expertPersonType == undefined || This.person_type == OptInt(expertPersonType))
		&& (responsible == undefined || This.responsible == responsible)
	");
	
	if (fldCustomExpert == undefined)
	{
		fldCustomExpert = tePlan.custom_experts.AddChild();
				
		fldCustomExpert.person_id = expertID;
		fldCustomExpert.person_type = expertPersonType;
		
		if (responsible != undefined)
			fldCustomExpert.responsible = responsible;
	}
	
	return fldCustomExpert;
}

function removeCustomExpert(tePlan, expertID, expertPersonType, responsible)
{	
	var customExpertMatchs;

	for (fldCustomExpert in tePlan.custom_experts)
	{
		customExpertMatchs =
			fldCustomExpert.person_id == OptInt(expertID)
			&& (expertPersonType == undefined || fldCustomExpert.person_type == OptInt(expertPersonType))
			&& (responsible == undefined || fldCustomExpert.responsible == responsible)
			
		if (customExpertMatchs)
			fldCustomExpert.Delete();
	}
	
	return true;
}

function getFuncManagerID(docColl, xBossTypesOrOpCode, params)
{	
	params = setDefaultOptions(params, {
		searchInColl: false
	});
	
	var funcManagerIDs = getFuncManagerIDs(docColl, xBossTypesOrOpCode, params);	
	
	return ArrayOptFirstElem(funcManagerIDs);
}

function getFuncManagerIDs(docColl, xBossTypesOrOpCode, params)
{
	params = setDefaultOptions(params, {
		searchInColl: false,
		searchInSubdivs: true,
		searchInOrg: true,
	});
	
	var xBossTypes = IsArray(xBossTypesOrOpCode) ? xBossTypesOrOpCode : getBossTypesByOperationCode(xBossTypesOrOpCode);
	var bossTypeIDs = ArrayMerge(xBossTypes, 'This.id', ',');
	
	
	var subdivIDs = getSubdivIDsWithParents( OptInt(docColl.TopElem.position_parent_id) );
	
	//alert("subdivIDs: "+subdivIDs.join(', '));
	
	var xFuncManagers = [];
	var XQString;
	
	
	if (params.searchInColl)
	{
		xFuncManagers = ArrayUnion(xFuncManagers, ArraySelectAll(XQuery("
			for $elem in func_managers
			where
				$elem/catalog = 'collaborator'
				and $elem/object_id = "+docColl.DocID+"
				and MatchSome($elem/boss_type_id, ("+bossTypeIDs+"))
			return $elem
		")));
	}
	
	if (params.searchInSubdivs)
	{
		for (i = ArrayCount(subdivIDs)-1; i >= 0; i--)
		//for (i = 0; i < ArrayCount(subdivIDs); i++)
		{
			XQString = "
				for $elem in func_managers
				where
					$elem/catalog = 'subdivision'
					and $elem/object_id = "+subdivIDs[i]+"
					and MatchSome($elem/boss_type_id, ("+bossTypeIDs+"))
				return $elem
			";
			
			xFuncManagers = ArrayUnion(xFuncManagers, ArraySelectAll(XQuery(XQString)) );
			
			//alert(UnifySpaces(XQString));
			//alert("ArrayCount(xFuncManagers): "+ArrayCount(xFuncManagers))
		}
	}
	
	if (params.searchInOrg)
	{
		xFuncManagers = ArrayUnion(xFuncManagers, ArraySelectAll(XQuery("
			for $elem in func_managers
			where
				$elem/catalog = 'org'
				and $elem/object_id = "+docColl.TopElem.org_id+"
				and MatchSome($elem/boss_type_id, ("+bossTypeIDs+"))
			return $elem
		")));
	}
	
	var funcManagerIDs = ArrayExtract(xFuncManagers, 'This.person_id');
	funcManagerIDs = ArraySelectDistinct(funcManagerIDs, "This");
	
	return funcManagerIDs;
}

function getNativeBossID(docCollID)
{
	var collID;
	
	if (docCollID > 0)
		collID = docCollID;
	else
		collID = docCollID.DocID;
	
	//var xFuncManagers = tools.get_uni_user_bosses(docColl.DocID, {return_object_type: 'func_managers'} );
	var xFuncManagers = getCollMainFuncManagers(collID);
	
	var xFuncManager_firstSuitable;

	for (xFuncManager in xFuncManagers)
	{
		if (xFuncManager.person_id != collID)
		{
			xFuncManager_firstSuitable = xFuncManager;
			break;
		}
	}
	
	if (xFuncManager_firstSuitable != undefined)
		return xFuncManager_firstSuitable.person_id;
	else
		return undefined;
}

function getCollMainFuncManagers(collID, catalogNames)
{
	var docColl = tools.open_doc(collID);
	if (docColl == undefined)
		return [];
	
	var mainBossTypeID = getElemIDByKey('boss_type', { code: 'main' });
	
	var xFuncManagers_Result = [];
	
	var xFuncManagers = tools.get_uni_user_bosses(collID, {return_object_type: 'func_managers'} );
	
	xFuncManagers_Suitable = ArraySelect(xFuncManagers, "This.boss_type_id == mainBossTypeID");
	
	if (catalogNames == undefined)
		catalogNames = ['collaborator', 'subdivision', 'org'];
	
	var xFuncManagers_inCatalog;
	
	for (catalogName in catalogNames)
	{
		xFuncManagers_inCatalog = ArraySelect(xFuncManagers_Suitable, 'This.catalog == catalogName');
		
		for (xFuncManager_inCatalog in xFuncManagers_inCatalog)
		{
			//if (ArrayOptFind(xFuncManagers_Result, "This.person_id == xFuncManager_inCatalog.person_id") != undefined)
			//	continue;
			
			xFuncManagers_Result.push(xFuncManager_inCatalog);
		}
	}
	
	return ArraySelectDistinct(xFuncManagers_Result, "This.person_id");
}

function isEmptyStr(str)
{
	return str == undefined || str == null || str == '' || str == 'null' || str == 'undefined';
}

function addLeadingZeros(number, resultStrMinLength)
{
	var zerosStr = "";
	
	for (var i = StrLen(number); i < resultStrMinLength; i++)
	{
		zerosStr += '0';
	}
	
	return zerosStr + number;
}

function saveFileAsResource(fileName, fileContent, resourceID)
{
	var docResource;
	
	if (resourceID > 0)
	{
		docResource = tools.open_doc(resourceID);
	}
	else
	{
		docResource = tools.new_doc_by_name('resource');
		docResource.BindToDb(DefaultDb);
	}
	
	docResource.TopElem.name = fileName;
	docResource.TopElem.file_name = fileName;
	docResource.TopElem.put_str(fileContent, fileName);
	docResource.Save();
	
	return docResource;
}

function getRandomFolderUrl(rootUrl, prefix)
{
	if (prefix == undefined)
		prefix = '';

	var randomFolderName = prefix+DateToRawSeconds(Date())+'a'+tools.random_string(10);
	
	return UrlAppendPath(rootUrl, randomFolderName);
}

function getRandomFolderPath(rootUrl, prefix)
{	
	return UrlToFilePath(getRandomFolderUrl(rootUrl, prefix));
}

function parseFilename(filename)
{	
	var dotPositionIndex = StrOptSubStrRightPos(filename, '.');
	
	if (dotPositionIndex != undefined)
	{
		return {
			name: StrLeftRange(filename, dotPositionIndex),
			ext: StrRightRangePos(filename, dotPositionIndex+1)
		}
	}
	else
	{
		return {
			name: filename,
			ext: '',
		}
	}
}

function makeUniqFilename(filename, existingFilenames)
{
	var existingFilename, uniqFilename;
	var cnt = 0;
	
	var parsedFilename = parseFilename(filename);
	
	while(true)
	{
		uniqFilename = parsedFilename.name + (cnt > 0 ? '_'+cnt : '') +'.'+parsedFilename.ext;

		existingFilename = ArrayOptFind(existingFilenames, 'This == uniqFilename');
		
		if (existingFilename == undefined)
			break;
		
		cnt++;
	}

	return uniqFilename;
}

function regExpReplace(str, pattern, targetStr)
{
	var regExp = tools_web.reg_exp_init();
	regExp.Global = true;
	regExp.Pattern = pattern;
	regExp.MultiLine = true;

	return regExp.Replace(str, targetStr);
}

function getRegExpMatches(str, pattern, regExpParams)
{
	var regExp = tools_web.reg_exp_init();
	regExp.Global = true;
	regExp.Pattern = pattern;
	regExp.MultiLine = true;

	var matches = regExp.Execute(str);
	
	var oMatchs = [];
	var	oMatch;
	
	for (var i = 0; i < matches.Count; i++)
	{
		oMatch = {
			fullStr: matches.Item(i).Value,
			subStrs: []
		}
		
		for (var j = 0; j < matches.Item(i).SubMatches.Count; j++)
		{
			oMatch.subStrs.push(matches.Item(i).SubMatches.Item(j));
		}
		
		oMatchs.push(oMatch);
	}
	
	return oMatchs;
}

function getRegExpFirstMatch(str, pattern, regExpParams)
{
	var matchValues = getRegExpMatches(str, pattern, regExpParams);
	
	return matchValues[0];
}

function regExpMatches(str, pattern, regExpParams)
{
	var matchValues = getRegExpMatches(str, pattern, regExpParams);
	
	return matchValues.length > 0;
}


//---------------------------------------------------------------------------------------------------------------



function getTracksRoleID()
{
	return getCachedElemIDByCode('role', ROLE_TRACKS_CODE, {
		errorMessageWhenNotFound: 'Не найдена категория модульных программ "'+ROLE_TRACKS_CODE+'"'
	});
}

function getODTypeID_TrackTemplate()
{
	return getCachedElemIDByCode('object_data_type', OD_TYPE_TRACK_TEMPLATE_CODE, {
		errorMessageWhenNotFound: 'Не найден тип данных документов "'+OD_TYPE_TRACK_TEMPLATE_CODE+'"'
	});
}

function getODTypeID_Track()
{
	return getCachedElemIDByCode('object_data_type', OD_TYPE_TRACK_CODE, {
		errorMessageWhenNotFound: 'Не найден тип данных документов "'+OD_TYPE_TRACK_CODE+'"'
	});
}

function getPositionDate(teColl)
{
	var positionDate;
	
	var fldChangeLogs = ArraySort(teColl.change_logs, 'This.date', '+');
	
	for (fldChangeLog in fldChangeLogs)
	{
		if (teColl.position_name == fldChangeLog.position_name)
		{
			if (positionDate == undefined)
				positionDate = fldChangeLog.date;
		}
		else
		{
			positionDate = undefined;
		}
	}
	
	return positionDate;
}

function countWorkedMonths(positionDate)
{
	if (positionDate == undefined)
		return 0;
	
	var diff = OptReal(DateDiff(Date(), positionDate), 0);
	var iWorkedMonths = 1 + OptInt((diff / (24.0*60*60)) / 30.0, 0) ;
	
	return iWorkedMonths;
}


xEVENTS = undefined;

function getEduMethodEventVisitStatus(collID, eduMethodIDs, checkAllPassed, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	if (checkAllPassed == undefined)
		checkAllPassed = false;
	
	if (xEVENTS == undefined)
	{
		//alert("xEVENTS...");
		
		xEVENTS = ArraySelectAll(tools.xquery("
			for $elem in events
			order by
				$elem/education_method_id
			 return $elem/id, $elem/education_method_id
		"));
		
		//return $elem/id, $elem/education_method_id
		
		//alert("xEVENTS! "+ArrayCount(xEVENTS));
	}
	
	var xEvents = [];

	for (eduMethodID in eduMethodIDs)
		xEvents = ArrayUnionFast(xEvents, ArraySelectBySortedKey(xEVENTS, eduMethodID, 'education_method_id'));
	
	var eventVisitStatus;
	
	var allPassed = true;
	
	for (xEvent in xEvents)
	{
		eventVisitStatus = getEventVisitStatus(collID, xEvent.id);

		if (eventVisitStatus.done)
		{
			//alert("EncodeJson(eventVisitStatus): "+(EncodeJson(eventVisitStatus)))
			if (!checkAllPassed)
				return eventVisitStatus;
		}
		else
		{
			if (checkAllPassed)
				return eventVisitStatus;
		}
	}
	
	if (checkAllPassed)
		return {
			done: true,
			finishDate: undefined
		};

	return {
		done: false,
		finishDate: undefined
	};
}

xEVENT_RESULTS = undefined;
xEVENTS_BY_ID = undefined;

function getEventVisitStatus(collID, eventID, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	var xEventResults_ofEvent_ofPerson;
	
	if (options.useCache)
	{
		if (xEVENT_RESULTS == undefined)
		{
			//alert("xEVENT_RESULTS...");
			
			xEVENT_RESULTS = ArraySelectAll(tools.xquery("
				for $elem in event_results
				where
					$elem/is_assist = true()
				order by
					$elem/event_id
				 return $elem/id, $elem/person_id, $elem/event_id
			"));
			
			//alert("xEVENT_RESULTS! "+ArrayCount(xEVENT_RESULTS));
		}
		
		
		var xEventResults_ofEvent = ArraySelectBySortedKey(xEVENT_RESULTS, eventID, 'event_id');
		xEventResults_ofEvent_ofPerson = ArraySelect(xEventResults_ofEvent, 'This.person_id == collID');
	}
	else
	{
		xEventResults_ofEvent_ofPerson = ArraySelectAll(tools.xquery("
			for $elem in event_results
			where
				$elem/is_assist = true()
				and $elem/event_id = "+OptInt(eventID)+"
				and $elem/person_id = "+OptInt(collID)+"
			order by
				$elem/event_id
			 return $elem/id, $elem/person_id, $elem/event_id
		"));
	}
	
	var xEventResult = ArrayOptFirstElem(xEventResults_ofEvent_ofPerson);
	
	//alert("xEventResult: "+(xEventResult != undefined));

	var result = {
		done: false,
		finishDate: undefined
	}
	
	var docEvent;
	
	if (xEventResult != undefined)
	{	
		if (xEVENTS_BY_ID == undefined)
		{
			//alert("xEVENTS_BY_ID...");
			
			xEVENTS_BY_ID = ArraySelectAll(tools.xquery("
				for $elem in events
				order by
					$elem/id
				 return $elem/id, $elem/finish_date
			"));
			
			//alert("xEVENTS_BY_ID! "+ArrayCount(xEVENTS_BY_ID));
		}

		//xEvent = xEventResult.event_id.OptForeignElem;
		xEvent = ArrayOptFindBySortedKey(xEVENTS_BY_ID, xEventResult.event_id, 'id');
		
		//if (xEvent != undefined)
		//	alert("!!!!!*********!!!!!!!!!");
		
		result.done = true;
		result.finishDate = xEvent != undefined ? xEvent.finish_date : "";
	}
	
	return result;
}

xLEARNINGS = undefined;

function getCourseStatus(collID, courseIDs, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	var xLearnings_ofPerson;
	
	if (options.useCache)
	{
		if (xLEARNINGS == undefined)
		{
			//alert("xLEARNINGS...");
			
			xLEARNINGS = ArraySelectAll(tools.xquery("
				for $elem in learnings
				order by
					$elem/person_id
				 return $elem/id, $elem/person_id, $elem/course_id, $elem/state_id, $elem/last_usage_date, $elem/score, $elem/max_score
			"));
			
			//alert("xLEARNINGS!");
		}
	
		xLearnings_ofPerson = ArraySelectBySortedKey(xLEARNINGS, collID, 'person_id');
	}
	else
	{
		xLearnings_ofPerson = ArraySelectAll(tools.xquery("
			for $elem in learnings
			where
				MatchSome($elem/course_id, ("+courseIDs.join(',')+"))
				and $elem/person_id = "+OptInt(collID)+"
			order by
				$elem/person_id
			 return $elem/id, $elem/person_id, $elem/course_id, $elem/state_id, $elem/last_usage_date, $elem/score, $elem/max_score
		"));
	}
	
	var xLearnings = [];
	
	for (courseID in courseIDs)
	{
		xLearnings = ArrayUnion(xLearnings, ArraySelect(xLearnings_ofPerson, 'This.course_id == OptInt(courseID)'));
	}
	
	var xLearnings_Successful = ArraySelect(xLearnings, 'This.state_id == 4');
	
	var xLearning_BestAttempt = getCourseBestAttempt(xLearnings);
	
	/*alert("xLearning_BestAttempt != undefined: "+(xLearning_BestAttempt != undefined));
	
	if (xLearning_BestAttempt != undefined)
	{
		alert("xLearning_BestAttempt.id: "+xLearning_BestAttempt.id);
		alert("xLearning_BestAttempt.score: "+xLearning_BestAttempt.score);
		alert("xLearning_BestAttempt.max_score: "+xLearning_BestAttempt.max_score);
	}*/
	
	var result = {
		finished: (ArrayCount(xLearnings) > 0),
		done: (ArrayCount(xLearnings_Successful) > 0),
		score: (xLearning_BestAttempt != undefined ? xLearning_BestAttempt.score : undefined),
		maxScore: (xLearning_BestAttempt != undefined ? xLearning_BestAttempt.max_score : undefined),
		finishDate: undefined
	}
	
	/*if (xLearnings)
	{
		result.done = true;
		result.finishDate = xLearning.last_usage_date;
	}*/
	
	return result;
}

xTEST_LEARNINGS = undefined;

function getTestStatus(collID, assessmentIDs, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	var xTestLearnings_ofPerson;
	
	if (options.useCache)
	{
		if (xTEST_LEARNINGS == undefined)
		{
			//alert("xTEST_LEARNINGS...");
			
			xTEST_LEARNINGS = ArraySelectAll(tools.xquery("
				for $elem in test_learnings
				order by
					$elem/person_id
				 return $elem/id, $elem/person_id, $elem/assessment_id, $elem/state_id, $elem/last_usage_date, $elem/score, $elem/max_score
			"));
			
			//alert("xTEST_LEARNINGS!");
		}
	
		xTestLearnings_ofPerson = ArraySelectBySortedKey(xTEST_LEARNINGS, collID, 'person_id');
	}
	else
	{
		xTestLearnings_ofPerson = ArraySelectAll(tools.xquery("
			for $elem in test_learnings
			where
				MatchSome($elem/assessment_id, ("+assessmentIDs.join(',')+"))
				and $elem/person_id = "+OptInt(collID)+"
			order by
				$elem/person_id
			 return $elem/id, $elem/person_id, $elem/assessment_id, $elem/state_id, $elem/last_usage_date, $elem/score, $elem/max_score
		"));
	}
	
	var xTestLearnings = [];
	
	for (assessmentID in assessmentIDs)
	{
		xTestLearnings = ArrayUnion(xTestLearnings, ArraySelect(xTestLearnings_ofPerson, 'This.assessment_id == OptInt(assessmentID)'));
	}
	
	var xTestLearnings_Successful = ArraySelect(xTestLearnings, 'This.state_id == 4');
	
	var xTestLearning_BestAttempt = getTestBestAttempt(xTestLearnings);
	
	var result = {
		finished: (ArrayCount(xTestLearnings) > 0),
		done: (ArrayCount(xTestLearnings_Successful) > 0),
		score: (xTestLearning_BestAttempt != undefined ? xTestLearning_BestAttempt.score : undefined),
		maxScore: (xTestLearning_BestAttempt != undefined ? xTestLearning_BestAttempt.max_score : undefined),
		finishDate: undefined
	}
	
	/*if (xTestLearning != undefined)
	{
		result.done = true;
		result.finishDate = xTestLearning.last_usage_date;
	}*/
	
	return result;
}

function isCoursePassed(collID, courseID, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	return getCourseStatus(collID, [courseID], { useCache: options.useCache }).done;
}

function isTestPassed(collID, assessmentIDs)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	return getTestStatus(collID, [assessmentIDs], { useCache: options.useCache }).done;
}

function isEventVisited(collID, eventID, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	return getEventVisitStatus(collID, eventID, { useCache: options.useCache }).done;
}

function getCourseBestAttempt(xLearnings)
{
	var xLearnings_Sorted = ArraySort(xLearnings,
		'(This.state_id == 4 ? 1 : 0)', '-',
		'score', '-'
	);
	
	return ArrayOptFirstElem(xLearnings_Sorted);
}

function getTestBestAttempt(xTestLearnings)
{
	var xTestLearnings_Sorted = ArraySort(xTestLearnings,
		'(This.state_id == 4 ? 1 : 0)', '-',
		'This.score', '-'
	);
	
	return ArrayOptFirstElem(xTestLearnings_Sorted);
}

function getTracksTasks(options)
{
	options = setDefaultOptions(options, {
		collID: undefined,
		trackStatus: undefined,
		status: undefined
	});
	
	var xOdTracks = getTracks({
		collID: options.collID,
		status: options.trackStatus
	});
	
	var days;
	
	var resultTasks = [];
	
	var docOdTrack, teOdTrack;
	
	for (xOdTrack in xOdTracks)
	{
		docOdTrack = tools.open_doc(xOdTrack.id);
		
		if (docOdTrack == undefined)
			continue;
		
		teOdTrack = docOdTrack.TopElem;
		
		days = getCustomElemJson(teOdTrack, 'days_json');
		
		for (day in days)
		{
			for (oTask in day.tasks)
			{				
				if (options.status == undefined || options.status == oTask.status)
					resultTasks.push(oTask);
			}
		}
	}
	
	return resultTasks;
}


function getActiveTasks(collID)
{
	var xOdTracks = getActiveTracks(collID);
	
	var days;
	
	var activeTasks = [];
	
	var docOdTrack, teOdTrack;
	
	for (xOdTrack in xOdTracks)
	{
		docOdTrack = tools.open_doc(xOdTrack.id);
		
		if (docOdTrack == undefined)
			continue;
		
		teOdTrack = docOdTrack.TopElem;
		
		days = getCustomElemJson(teOdTrack, 'days_json');
		
		for (day in days)
		{
			for (oTask in day.tasks)
			{
				if (oTask.status == TASK_STATUS.ASSIGNED)
					activeTasks.push(oTask);
			}
		}
	}
	
	return activeTasks;
}

function getTracks(options)
{
	options = setDefaultOptions(options, {
		collID: undefined,
		status: undefined
	});
	
	var xqFilters = [];
	
	if (options.collID != undefined)
		xqFilters.push("$elem/sec_object_id = "+OptInt(options.collID));
	
	if (options.status != undefined)
	{
		var statuses = !IsArray(options.status) ? [options.status] : options.status;
		
		xqFilters.push("MatchSome($elem/status_id, ('"+statuses.join("','")+"'))");
	}
	
	var xqFiltersStr = xqFilters.length > 0 ? " and " + xqFilters.join(" and ") : "";
	
	var xqString = "
		for $elem in object_datas
		where
			$elem/object_data_type_id = "+getODTypeID_Track()+"
			"+xqFiltersStr+"
		 return $elem
	";
	
	alert("getTracks xqString: "+xqString);
	
	var xOdTracks = ArraySelectAll(tools.xquery(xqString));
	alert("ArrayCount(xOdTracks): "+ArrayCount(xOdTracks));
	
	//var xOdTracks = [{x: 1}];
	
	return xOdTracks;
}

function getActiveTracks(collID)
{
	var xOdTracks = getTracks({
		collID: collID,
		status: TRACK_STATUS.ACTIVE
	});
	
	return xOdTracks;
}

/*function getActiveTracks(collID)
{
	var xqFilters = [];
	
	if (collID != undefined)
		xqFilters.push("$elem/sec_object_id = "+OptInt(collID));
	
	var xqFiltersStr = xqFilters.length > 0 ? " and " + xqFilters.join(" and ") : "";
	
	var xOdTracks = ArraySelectAll(tools.xquery("
		for $elem in object_datas
		where
			$elem/object_data_type_id = "+getODTypeID_Track()+"
			and $elem/status_id = 'active'
			"+xqFiltersStr+"
		 return $elem
	"));
	
	return xOdTracks;
}*/

function getCollTracksProgress(collID)
{
	var xOdTracks = getActiveTracks(collID);
	
	var trackShortData;
	
	var finishedTasksCnt = 0;
	var totalTasksCnt = 0;
	
	for (xOdTrack in xOdTracks)
	{
		trackShortData = decodeJsonOpt(xOdTrack.data_str);
		
		if (trackShortData == undefined)
			continue;
		
		finishedTasksCnt += trackShortData.stat.tasks.finished;
		totalTasksCnt += trackShortData.stat.tasks.total;
	}
	
	return {
		mandatory: { current: finishedTasksCnt, total: totalTasksCnt },
		auxiliary: { current: 0, total: 0 },
		averageScore: { current: finishedTasksCnt, total: totalTasksCnt },
	}
}

function countTrackDayProgress(trackDay)
{
	var finishedTasksCnt = 0;
	
	for (oTask in trackDay.tasks)
	{
		if (oTask.status == TASK_STATUS.DONE || oTask.status == TASK_STATUS.FAILED)
			finishedTasksCnt++;
		
	}
	
	return {
		current: finishedTasksCnt,
		total: ArrayCount(trackDay.tasks)
	}
}

function updateShortTrackData(teOdTrack)
{	
	var days = getCustomElemJson(teOdTrack, 'days_json');
	
	var shortData = {
		stat: {
			tasks: {
				finished: 0,
				assigned: 0,
				active: 0,
				total: 0
			}
		}
	};
	
	for (day in days)
	{
		for (oTask in day.tasks)
		{
			shortData.stat.tasks.total++;
			
			if (oTask.status == TASK_STATUS.LOCKED)
				continue;
			
			if (oTask.status == TASK_STATUS.ASSIGNED)
				shortData.stat.tasks.assigned++;
			
			if (oTask.status == TASK_STATUS.IN_PROGRESS)
				shortData.stat.tasks.active++;
			
			if (oTask.status == TASK_STATUS.DONE || oTask.status == TASK_STATUS.FAILED)
				shortData.stat.tasks.finished++;
		}
	}
	
	teOdTrack.data_str = EncodeJson(shortData);
}

function isTrackDayDone(trackDay)
{
	var hasUndoneTasks = ArrayOptFind(trackDay.tasks, "This.status != TASK_STATUS.DONE && This.status != TASK_STATUS.FAILED") != undefined;
	
	return !hasUndoneTasks;
}

function updateTrack(docOdTrackOrID, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	var docOdTrack = openDocElemID(docOdTrackOrID);
	var teOdTrack = docOdTrack.TopElem;
	
	var docOdTrackTemplate = tools.open_doc(teOdTrack.object_id);
	var teOdTrackTemplate = docOdTrackTemplate != undefined ? docOdTrackTemplate.TopElem : undefined; 
	
	if (teOdTrackTemplate == undefined)
	{
		teOdTrack.status_id = TRACK_STATUS.CANCELLED;
		docOdTrack.Save();
		
		return true;
	}
	
	var days = getCustomElemJson(teOdTrack, 'days_json');
	
	days = ArraySort(days, 'id', '+');
	
	var daysFromStart = OptInt(countDatesDiffInDays(DateNewTime(teOdTrack.create_date), Date())) + 1;
	
	//alert("daysFromStart: "+daysFromStart);
	
	for (day in days)
	{
		if (day.id > daysFromStart)
			break;
		
		//alert("day.status: "+day.status);
		
		if (day.status == DAY_STATUS.LOCKED)
		{
			day.status = DAY_STATUS.ACTIVE;
			
			assignTrackDayActivities(teOdTrack, day);
			
			break;
		}
		else if (day.status == DAY_STATUS.DONE)
		{
			continue;
		}
		else if (day.status == DAY_STATUS.ACTIVE)
		{
			updateDayTasksStatus(teOdTrack, day, { useCache: options.useCache });
			assignTrackDayActivities(teOdTrack, day);
			
			if (isTrackDayDone(day))
			{
				day.status = DAY_STATUS.DONE;
				continue;
			}
			else
			{
				break;
			}
		}
	}
	
	var hasActiveTasks = false;
	var hasDoneTasks = false;
	
	var currentDay;
	
	for (day in days)
	{
		if (!hasActiveTasks)
			hasActiveTasks = ArrayOptFind(day.tasks, "This.status == TASK_STATUS.ASSIGNED") != undefined;
		
		if (!hasDoneTasks)
			hasDoneTasks = ArrayOptFind(day.tasks, "isTaskFinished(This)") != undefined;
		
		currentDay = day;
		
		if (hasActiveTasks)
			break;
	}
	
	if (hasActiveTasks)
		teOdTrack.status_id == TRACK_STATUS.ACTIVE;
	else if (hasDoneTasks)
		teOdTrack.status_id == TRACK_STATUS.DONE;
	
	setCustomElemVal(teOdTrack, 'days_json', EncodeJson(days));
	
	updateShortTrackData(teOdTrack);
	
	docOdTrack.Save();
	
	/*alert(
		'Трек: '+teOdTrack.name+'\n'
		+'День: '+(currentDay != undefined ? currentDay.id : '-')+' из '+(ArrayCount(days))+'\n'
		+'hasDoneTasks: '+hasDoneTasks+'\n'
		+'hasActiveTasks: '+hasActiveTasks+'\n'
		+'teOdTrack.status_id: '+teOdTrack.status_id+'\n'
	);*/
	
	return true;
}

function getTrackFirstAssignedTask(docOdTrackOrID)
{
	var docOdTrack = openDocElemID(docOdTrackOrID);
	var teOdTrack = docOdTrack.TopElem;
	
	var days = getCustomElemJson(teOdTrack, 'days_json');
	
	days = ArraySort(days, 'id', '+');
	
	var oTask_Assigned;
	
	for (day in days)
	{
		oTask_Assigned = getDayFirstAssignedTask(day);
		
		if (oTask_Assigned != undefined)
			break;
	}
	
	return oTask_Assigned;
}

function getDayFirstAssignedTask(day)
{
	return ArrayOptFind(day.tasks, 'This.status == TASK_STATUS.ASSIGNED');
}

function getElemID(docElemOrID)
{
	if (docElemOrID == undefined || docElemOrID == null)
		return undefined;
	else if (docElemOrID > 0)
		return docElemOrID;
	else
		return docElemOrID.DocID;
}

function isTaskFinished(oTask)
{
	return (
		oTask.status == TASK_STATUS.DONE
		|| oTask.status == TASK_STATUS.FAILED
		|| oTask.status == TASK_STATUS.CANCELLED
	);
}

function isCollInEvent(collID, eventID)
{
	var docEvent = tools.open_doc(eventID);

	var fldColl = docEvent.TopElem.collaborators.GetOptChildByKey(OptInt(collID));
	
	return fldColl != undefined;
}

function assignTrackDayActivities(teOdTrack, day)
{		
	if (day == undefined)
		return false;
	
	var taskElemIdExists;
	var docElemOrID, elemID;
	var taskType, initStatus;
	var collEvent;
	
	var collID = teOdTrack.sec_object_id;
	
	var activeTaskExists = false;
	
	for (oTask in day.tasks)
	{		
		if (isTaskFinished(oTask))
			continue;

		if (oTask.status != TASK_STATUS.LOCKED)
			activeTaskExists = true;
		
		if (activeTaskExists && !oTask.GetOptProperty('freeExecution', false))
			continue;
		
		taskElemIdExists = oTask.HasProperty('elem') && oTask.elem.HasProperty('id');
		
		if (taskElemIdExists)
		{
			if (oTask.type == 'course' || oTask.type == 'test')
			{
				docElemOrID = undefined;
			
				if (oTask.type == 'course')
					docElemOrID = tools.activate_course_to_person(collID, oTask.elem.id);
				else if (oTask.type == 'test')
					docElemOrID = tools.activate_test_to_person(collID, oTask.elem.id);
				
				elemID = getElemID(docElemOrID);
				
				if (elemID > 0)
				{
					oTask.elem.activeID = elemID;
				}
			}
			if (oTask.type == 'webinar')
			{
				if (oTask.HasProperty('eventID') && oTask.eventID > 0)
				{
					if (isCollInEvent(collID, oTask.eventID))
						continue;
				}
				
				//collEvent = addCollToImmediateEventByEduMethod(collID, oTask.elem.id);
				
				//oTask.eventID = collEvent.eventID;
			}
		}
		
		taskType = ArrayOptFind(TASK_TYPES, "This.code == oTask.type");
		
		if (taskType != undefined && taskType.HasProperty('initStatus'))
			initStatus = taskType.initStatus;
		else
			initStatus = TASK_STATUS.ASSIGNED;
		
		oTask.status = initStatus;
		oTask.assignedAtDate = Date();
		oTask.assignedBy = "Система";
		
		if (initStatus == TASK_STATUS.ASSIGNED)
			activeTaskExists = true;
	}
	
	//alert("day: "+EncodeJson(day));
	
	return true;
}

function updateDayTasksStatus(teOdTrack, day, options)
{
	options = setDefaultOptions(options, {
		useCache: true
	});
	
	if (day == undefined)
		return false;
	
	var taskElemIdExists;
	var docElemOrID, elemID;
	
	for (oTask in day.tasks)
	{		
		if (oTask.status == TASK_STATUS.LOCKED)
			continue;
		
		taskElemIdExists = oTask.HasProperty('elem') && oTask.elem.HasProperty('id');
		
		if (taskElemIdExists)
		{
			docElemOrID = undefined;
		
			if (oTask.type == 'course')
			{
				courseStatus = getCourseStatus(teOdTrack.sec_object_id, [oTask.elem.id], { useCache: options.useCache });
				
				if (courseStatus.finished)
				{
					//oTask.elem.fineshedID = learningResult.xLearning.id;
					oTask.status = courseStatus.done ? TASK_STATUS.DONE : TASK_STATUS.FAILED;
					oTask.score = courseStatus.score;
					oTask.maxScore = courseStatus.maxScore;
				}
			}
			else if (oTask.type == 'test')
			{
				//testLearningResult = getTestLearningResult(oTask.elem.activeID);
				
				testStatus = getTestStatus(teOdTrack.sec_object_id, [oTask.elem.id], { useCache: options.useCache });

				
				if (testStatus.finished)
				{
					//oTask.elem.fineshedID = testLearningResult.xTestLearning.id;
					oTask.status = testStatus.done ? TASK_STATUS.DONE : TASK_STATUS.FAILED;
					oTask.score = testStatus.score;
					oTask.maxScore = testStatus.maxScore;
				}
			}
			else if (oTask.type == 'webinar')
			{
				//testLearningResult = getTestLearningResult(oTask.elem.activeID);
				
				if (oTask.HasProperty('eventID') && oTask.eventID > 0 && isEventVisited(teOdTrack.sec_object_id, oTask.eventID, { useCache: options.useCache }))
				{
					//oTask.elem.fineshedID = testLearningResult.xTestLearning.id;
					oTask.status = TASK_STATUS.DONE;
				}
			}
				
		}
	}
	
	//alert("day: "+EncodeJson(day));
	
	return true;
}

function addCollToImmediateEventByEduMethod(collID, eduMethodID)
{
	var result = {
		addedToEvent: false,
		noEventsFound: false,
		eventID: undefined
	};
	
	var xEvents = findImmediateEventsByEduMethod(eduMethodID);

	var docEvent, teEvent, fldColl;

	for (xEvent in xEvents)
	{
		docEvent = tools.open_doc(xEvent.id);
		teEvent = docEvent.TopElem;

		fldColl = teEvent.collaborators.GetOptChildByKey(collID);

		if(fldColl != undefined)
		{
			result.addedToEvent = true;
			result.eventID = xEvent.id;
			
			return result;
		}
	}

	var xEvent_First = ArrayOptFirstElem(xEvents);
	
	if (xEvent_First == undefined)
	{
		result.noEventsFound = true;
		
		return result;
	}
	
	var docEvent_Target = tools.add_person_to_event(collID, xEvent_First.id);

	result.addedToEvent = true;
	result.eventID = docEvent_Target.DocID;
	
	return result;
}

function findImmediateEventsByEduMethod(eduMethodID)
{
	var XQString = "
		for $elem in events
		where
			$elem/education_method_id = "+OptInt(eduMethodID)+"
			and date('"+Date()+"') < $elem/start_date
		order by $elem/start_date
		return $elem
	";
	
	//alert("findImmediateEventsByEduMethod XQString: "+XQString);
	
	var xEvents = ArraySelectAll(XQuery(XQString));
	
	return xEvents;
}

function getActiveWebinarEvent(collID, eduMethodID)
{
	var xEventResult = ArrayOptFirstElem(XQuery("
		for $elem in event_results
		where
			$elem/person_id = "+OptInt(collID)+"
			and some $event in events satisfies (
				$event/id = $elem/event_id
				and $event/education_method_id = "+OptInt(eduMethodID)+"
			)
		return $elem
	"));
	
	return xEventResult != undefined ? xEventResult.event_id.OptForeignElem : xEventResult;
}

function getFinishedWebinarEvent(collID, eduMethodID)
{
	var xEventResult = ArrayOptFirstElem(XQuery("
		for $elem in event_results
		where
			$elem/person_id = "+OptInt(collID)+"
			and $elem/is_assist = true()
			and some $event in events satisfies (
				$event/id = $elem/event_id
				and $event/education_method_id = "+OptInt(eduMethodID)+"
			)
		return $elem
	"));
	
	return xEventResult != undefined ? xEventResult.event_id.OptForeignElem : undefined;
}

function getLearningResult(activeLearningID)
{
	var xLearning;
	
	var xActiveLearning = ArrayOptFirstElem(XQuery("for $elem in active_learnings where $elem/id = "+OptInt(activeLearningID)+" return $elem/id"));
	
	if (xActiveLearning == undefined)
		xLearning = ArrayOptFirstElem(XQuery("for $elem in learnings where $elem/active_learning_id = "+OptInt(activeLearningID)+" return $elem/id"));
	
	return {
		xActiveLearning: xActiveLearning,
		xLearning: xLearning,
		xLearning_Current: (xLearning != undefined ? xLearning : xActiveLearning),
		isFinished: (xLearning != undefined)
	};
}

function getTestLearningResult(activeTestLearningID)
{
	var xTestLearning;
	
	var xActiveTestLearning = ArrayOptFirstElem(XQuery("for $elem in active_test_learnings where $elem/id = "+OptInt(activeTestLearningID)+" return $elem/id"));
	
	if (xActiveTestLearning == undefined)
		xTestLearning = ArrayOptFirstElem(XQuery("for $elem in test_learnings where $elem/active_test_learning_id = "+OptInt(activeTestLearningID)+" return $elem/id"));
	
	return {
		xActiveTestLearning: xActiveTestLearning,
		xTestLearning: xTestLearning,
		xTestLearning_Current: (xTestLearning != undefined ? xTestLearning : xActiveTestLearning),
		isFinished: (xTestLearning != undefined)
	};
}

function getRealLearningID(activeLearningID)
{
	var learningResult = getLearningResult(activeLearningID);
	
	return learningResult.xLearning_Current != undefined ? learningResult.xLearning_Current.id : undefined;
}

function getRealTestLearningID(activeTestLearningID)
{	
	var testLearningResult = getTestLearningResult(activeTestLearningID);
	
	return testLearningResult.xTestLearning_Current != undefined ? testLearningResult.xTestLearning_Current.id : undefined;
}

function normalizeTrackStatus(realStatus)
{
	return StrLowerCase(translateBack(realStatus, TRACK_STATUS));
}

function filterElemIDsInTracks(elemIDs, collID)
{
	var xOdTracks = getTracks({ collID: collID });
	
	var docOdTrack;
	var daysJson;
	
	var trackElemIDs = [];
	
	for (xOdTrack in xOdTracks)
	{
		docOdTrack = tools.open_doc(xOdTrack.id);
		
		if (docOdTrack == undefined)
			continue;
		
		daysJson = getCustomElemVal(docOdTrack.TopElem, 'days_json');
		
		for (elemID in elemIDs)
		{
			if (StrContains(daysJson, elemID))
				trackElemIDs.push(elemID);
		}
	}
	
	trackElemIDs = ArraySelectDistinct(trackElemIDs, 'This');
	
	return trackElemIDs;
}

function updateCourseTaskSubitemsData(oTask)
{
	if (oTask.type != 'course')
	{
		throw 'not a course';
		return false;
	}
	
	var docCourse = tools.open_doc(oTask.elem.id);
	
	if (docCourse == undefined)
	{
		throw 'course not found';
		return false;
	}
	
	var teCourse = docCourse.TopElem;
	
	var partsCnt = 0;
	
	var oSubTasks = [];
	var oSubTask;
	var elemID;
	
	for (fldPart in teCourse.parts)
	{
		partsCnt++;
		
		if (partsCnt == 1)
			continue;
		
		elemID = '';
		
		if (fldPart.type == 'test')
			elemID = fldPart.assessment_id;
		
		oSubTask = {
			id: partsCnt,
			code: fldPart.code,
			type: fldPart.type,
			status: TASK_STATUS.ASSIGNED,
			name: fldPart.name,
			elem: {
				id: elemID,
				name: fldPart.name,
			}
		}
		
		oSubTasks.push(oSubTask);
	}
	
	oTask.subtasks = oSubTasks;
}

function updateRelatedTracksByTrackTemplate(trackTemplateID)
{
	alert("updateRelatedTracksByTrackTemplate... trackTemplateID: "+trackTemplateID);
	
	var xqString = "
		for $elem in object_datas
		where
			$elem/object_data_type_id = "+getODTypeID_Track()+"
			and $elem/object_id = "+OptInt(trackTemplateID)+"
		 return $elem
	";
	
	var docTrackTemplate = tools.open_doc(trackTemplateID);
	var teTrackTemplate = docTrackTemplate.TopElem;
	
	var xOdTracks = ArraySelectAll(tools.xquery(xqString));
	
	alert("ArrayCount(xOdTracks): "+ArrayCount(xOdTracks));
	
	for (xOdTrack in xOdTracks)
	{
		updateTrackByTrackTemplate(xOdTrack.id, teTrackTemplate);
	}
	
	alert("updateRelatedTracksByTrackTemplate done");
}

function updateTrackByTrackTemplate(trackID, teTrackTemplate)
{
	alert("updateTrackByTrackTemplate... trackID: "+trackID);
	
	var oTrackTemplate = getCustomElemJson(teTrackTemplate, 'data_json');
	
	var docTrack = tools.open_doc(trackID);
	var teTrack = docTrack.TopElem;
	
	var oTrackDays = getCustomElemJson(teTrack, 'days_json');
	var oTrackDay;
	
	var oDay, oTask;
	
	for (oTemplateDay in oTrackTemplate.days)
	{
		oTrackDay = ArrayOptFind(oTrackDays, 'This.id == oTemplateDay.id');
		
		if (oTrackDay == undefined)
		{
			oDay = cloneObject(oTemplateDay);
			oDay.status = DAY_STATUS.LOCKED;
			oTrackDays.push(oDay);
			
			for (oTask in oDay.tasks)
				oTask.status = TASK_STATUS.LOCKED;
			
			continue;
		}
		
		if (oTrackDay.status == TRACK_STATUS.DONE)
			continue;
		
		for (oTemplateTask in oTemplateDay.tasks)
		{			
			oTrackTask = ArrayOptFind(oTrackDay.tasks, 'This.id == oTemplateTask.id');
			
			if (oTrackTask == undefined)
			{
				oTask = cloneObject(oTemplateTask);
				oTask.status = TASK_STATUS.LOCKED;
				
				oTrackDay.tasks.push(oTask);
				continue;
			}
			
			if (oTrackTask.status == TASK_STATUS.LOCKED)
			{
				oTrackDay.tasks = ArraySelect(oTrackDay.tasks, 'This.id != oTrackTask.id');
				
				oTask = cloneObject(oTemplateTask);
				oTask.status = TASK_STATUS.LOCKED;
				
				oTrackDay.tasks.push(oTask);
			}
		}
	}
	
	oTrackDay = undefined;
	
	for (oTrackDay in oTrackDays)
	{
		oTemplateDay = ArrayOptFind(oTrackTemplate.days, 'This.id == oTrackDay.id');
		relatedTemplateDayExists = oTemplateDay != undefined;
		
		if (!relatedTemplateDayExists)
		{
			oTrackDay.toDelete = true;
			continue;
		}	
		
		for (oTrackTask in oTrackDay.tasks)
		{
			relatedTemplateTaskExists = ArrayOptFind(oTemplateDay.tasks, 'This.id == oTrackTask.id') != undefined;
			
			if (!relatedTemplateTaskExists)
			{
				oTrackTask.toDelete = true;
			}
		}
		
		oTrackDay.tasks = ArraySelect(oTrackDay.tasks, "This.GetOptProperty('toDelete') != true");
	}
	
	oTrackDays = ArraySelect(oTrackDays, "This.GetOptProperty('toDelete') != true");
	
	oTrackDays = ArraySort(oTrackDays, 'This.id', '+');
	
	setCustomElemVal(teTrack, 'days_json', EncodeJson(oTrackDays));
	
	docTrack.Save();
	
	alert("updateTrackByTrackTemplate done");
}

function getDescFromElem(docElemOrID)
{
	var docElem = openDocElemID(docElemOrID);
	
	return docElem.TopElem.desc;
}

%>