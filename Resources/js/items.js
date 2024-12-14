var baseURL = "http://api.login2explore.com:5577";
var connToken = "90934472|-31949222567940220|90962740";
var jpdbirl = "/api/irl";
var jpdbiml = "/api/iml";
var imDBName="InvMngmnt-DB";
var imRelationName="Items";

setBaseUrl(baseURL);

function disableCtrl(ctrl)
{
    $("#new").prop("disabled", ctrl);
    $("#save").prop("disabled", ctrl);
    $("#edit").prop("disabled", ctrl);
    $("#change").prop("disabled", ctrl);
    $("#reset").prop("disabled", ctrl);
}

function disableNav(ctrl)
{
    $("#first").prop("disabled", ctrl);
    $("#prev").prop("disabled", ctrl);
    $("#last").prop("disabled", ctrl);
    $("#next").prop("disabled", ctrl);
}

function disableForm(bvalue)
{
    $("#iid").prop("disabled", bvalue);
    $("#iname").prop("disabled", bvalue);
    $("#os").prop("disabled", bvalue);
    $("#uom").prop("disabled", bvalue);
}

function initItemForm() {
    localStorage.clear();
    console.log("initItemForm() - done");
}

function newData()
{
    makeDataFormEmpty();
    disableForm(false);
    $("#iid").focus();
    disableNav(true);
    disableCtrl(true);
    $("#save").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function makeDataFormEmpty()
{
    $("#iid").val('');
    $("#iname").val('');
    $("#os").val('');
    $("#uom").val('');
}

function isNoRecordPresent()
{
    if (getFirstRec() === "0" && getLastRec() === "0")
    {
        return true;
    }
    return false;

}

function saveData()
{

    var jsonStrObj = validateData();

    if (jsonStrObj === '')
    {
        return '';
    }

    var putRequest = createPUTRequest(connToken, jsonStrObj, imDBName, imRelationName);
    jQuery.ajaxSetup({async: false});
    var jsonObj = executeCommand(putRequest, jpdbiml);
    jQuery.ajaxSetup({async: true});

    if (isNoRecordPresent())
    {
        setFirstRec(jsonObj);
    }

    setLastRec(jsonObj);
    setCurrRec(jsonObj);
    resetForm();

}

function getItmIdAsJsonObj()
{
    var itmid=$("#iid").val();
    var jsonStr={
        id:itmid
    };

    return JSON.stringify(jsonStr);
    }

function getItm()
{
    var itmId=getItmIdAsJsonObj();
    //alert(itmId);
    var getRequest=createGET_BY_KEYRequest(connToken,imDBName,imRelationName,itmId);
    //alert(getRequest);
    jQuery.ajaxSetup({async:false});
    var jsonObj=executeCommandAtGivenBaseUrl(getRequest,baseURL,jpdbirl);
    //alert(JSON.stringify(jsonObj));
    jQuery.ajaxSetup({async:true});

    if(jsonObj.status === 200)
    {
        //alert("inside if");
        $("#iid").prop("disabled",true);
        alert("Id already exist");
        resetForm();
    }
}

function resetForm()
{
    disableCtrl(true);
    disableNav(false);
    var getCurrRequest = createGET_BY_RECORDRequest(connToken, imDBName, imRelationName, getCurrRec());
    //alert(getCurrRequest);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getCurrRequest, jpdbirl);
    jQuery.ajaxSetup({async: true});

    if (isNoRecordPresent())
    {
        //alert("1");
        makeDataFormEmpty();
        disableNav(true);
    }

    $("#new").prop("disabled", false);
    
    if (isOnlyOneRecordPresent())
    {
        showData(result);
        disableNav(true);
        $("#edit").prop("disabled", false);
    }

    else{
    showData(result);
    }

    disableForm(true);
}

function editData()
{
    disableForm(false);
    $("#iid").prop("disabled", true);
    $("#iname").focus();
    disableNav(true);
    disableCtrl(true);
    $("#change").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function changeData()
{
    jsonObj = validateData();
    var updateRequest = createUPDATERecordRequest(connToken, jsonObj, imDBName, imRelationName, getCurrRec());
    jQuery.ajaxSetup({async: false});
    var jsonObj = executeCommandAtGivenBaseUrl(updateRequest, baseURL, jpdbiml);
    jQuery.ajaxSetup({async: true});
    console.log(jsonObj);
    resetForm();
    $("#iid").focus();
    $("#edit").focus();
}

function validateData()
{
    var itmid, itmname, openingstock, uom;
    itmid = $("#iid").val();
    itmname = $("#iname").val();
    openingstock = parseFloat($("#os").val());
    uom = $("#uom").val();

    if (itmid === "")
    {
        alert("Item ID missing");
        $("#iid").focus();
        return "";
    }

    if (itmname === "")
    {
        alert("Item Name missing");
        $("#iname").focus();
        return "";
    }

    if (openingstock === "" || isNaN(openingstock)) {
        alert("Opening stock missing or invalid");
        $("#os").focus();
        return "";
    }
   
    if (uom === "")
    {
        alert("Unit of Measurement missing");
        $("#uom").focus();
        return "";
    }
    
    var jsonStrObj = {
        id: itmid,
        name: itmname,
        openingstock: openingstock,
        uom: uom
    };

    return JSON.stringify(jsonStrObj);
}

function getCurrRec()
{
    return localStorage.getItem('rec_no');
}

function setFirstRec(jsonObj)
{
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined)
    {
        localStorage.setItem("first_rec_no", "0");
    } else {
        localStorage.setItem("first_rec_no", data.rec_no);
    }
}

function getFirstRec()
{

    return localStorage.getItem('first_rec_no');
}

function setLastRec(jsonObj)
{
    var data = JSON.parse(jsonObj.data);
    if (data.rec_no === undefined)
    {
        localStorage.setItem("last_rec_no", "0");
    } else {
        localStorage.setItem("last_rec_no", data.rec_no);
    }
}

function getLastRec()
{
    return localStorage.getItem('last_rec_no');
}

function setCurrRec(jsonObj)
{
    var data = JSON.parse(jsonObj.data);
    localStorage.setItem('rec_no', data.rec_no);
}

function getFirst()
{
    var getFirstRequest = createFIRST_RECORDRequest(connToken, imDBName, imRelationName);
    //alert(getFirstRequest);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getFirstRequest, jpdbirl);
    //alert(JSON.stringify(result));
    showData(result);
    setFirstRec(result);
    jQuery.ajaxSetup({async: true});
    $('#iid').prop("disabled", true);
    $('#first').prop("disabled", true);
    $('#prev').prop("disabled", true);
    $('#next').prop("disabled", false);
    $('#save').prop("disabled", true);
}

function getLast()
{
    var getLastRequest = createLAST_RECORDRequest(connToken, imDBName, imRelationName);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getLastRequest, jpdbirl);
    showData(result);
    setLastRec(result);
    jQuery.ajaxSetup({async: true});
    $('#iid').prop("disabled", true);
    $('#first').prop("disabled", false);
    $('#prev').prop("disabled", false);
    $('#last').prop("disabled", true);
    $('#next').prop("disabled", true);
    $('#save').prop("disabled", true);
}

function getPrev()
{
    var r = getCurrRec();
    if (r === 1)
    {
        $("#prev").prop("disabled", true);
        $("#first").prop("disabled", true);
    }
    var getPrevRequest = createPREV_RECORDRequest(connToken, imDBName, imRelationName, r);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getPrevRequest, jpdbirl);
    jQuery.ajaxSetup({async: true});
    showData(result);
    var r = getCurrRec();

    if (r === 1)
    {
        $("#prev").prop("disabled", true);
        $("#first").prop("disabled", true);
    }
    $("#save").prop("disabled", true);
}

function getNext()
{
    var r = getCurrRec();
    var getNextRequest = createNEXT_RECORDRequest(connToken, imDBName, imRelationName, r);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getNextRequest, jpdbirl);
    jQuery.ajaxSetup({async: true});
    showData(result);
    var r = getCurrRec();
    $("#save").prop("disabled", true);

}

function showData(jsonObj)
{
    if (jsonObj.status === 400)
    {
        return;
    }
    var data = JSON.parse(jsonObj.data).record;
    setCurrRec(jsonObj);
    $("#iid").val(data.id);
    $("#iname").val(data.name);
    $("#os").val(data.openingstock);
    $("#uom").val(data.uom);
  
    disableNav(false);
    disableForm(true);

    $("#save").prop("disabled", true);
    $("#change").prop("disabled", true);
    $("#reset").prop("disabled", true);
    $("#new").prop("disabled", false);
    $("#edit").prop("disabled", false);

    if (getCurrRec() === getLastRec())
    {

        $("#next").prop("disabled", true);
        $("#last").prop("disabled", true);
        return;
    }
    if (getCurrRec() === getFirstRec())
    {
        $("#first").prop("disabled", true);
        $("#prev").prop("disabled", true);
        return;
    }
}

function isOnlyOneRecordPresent() {
    if (isNoRecordPresent())
    {
        return false;
    }
    if (getFirstRec() === getLastRec()) {
        return true;
    }
}

function checkForNoRecord() {
    if (isNoRecordPresent()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
        return;
    }
    if (isOnlyOneRecordPresent()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
        $("#edit").prop("disabled", false);
        return;
    }
}

initItemForm();
getFirst();
getLast();
checkForNoRecord();
