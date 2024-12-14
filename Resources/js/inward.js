var baseURL = "http://api.login2explore.com:5577";
var connToken = "90934472|-31949222567940220|90962740";
var jpdbirl = "/api/irl";
var jpdbiml = "/api/iml";
var imDBName="InvMngmnt-DB";
var imRelationName="Inward";

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
    $("#rnum").prop("disabled", bvalue);
    $("#rdate").prop("disabled", bvalue);
    $("#iid").prop("disabled", bvalue);
    $("#iname").prop("disabled", true);
    $("#qnt").prop("disabled", bvalue);
}

function initInwardForm() {
    localStorage.clear();
    console.log("initInwardForm() - done");
}

function newData()
{
    makeDataFormEmpty();
    disableForm(false);
    $("#rnum").focus();
    disableNav(true);
    disableCtrl(true);
    $("#save").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function makeDataFormEmpty()
{
    $("#rnum").val('');
    $("#rdate").val('');
    $("#iid").val('');
    $("#iname").val('');
    $("#qnt").val('');
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

function getRpNoAsJsonObj()
{
    var rpno=$("#rnum").val();
    var jsonStr={
        rcpnum:rpno
    };

    return JSON.stringify(jsonStr);
    }

function getRN()
{
    var rpno=getRpNoAsJsonObj();
    var getRequest=createGET_BY_KEYRequest(connToken,imDBName,imRelationName,rpno);
    
    jQuery.ajaxSetup({async:false});
    var jsonObj=executeCommandAtGivenBaseUrl(getRequest,baseURL,jpdbirl);
    jQuery.ajaxSetup({async:true});

    if(jsonObj.status === 200)
    {
        $("#rnum").prop("disabled",true);
        alert("Receipt No. already exist");
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
    $("#rnum").prop("disabled", true);
    $("#rdate").focus();
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
    var responseObj = executeCommandAtGivenBaseUrl(updateRequest, baseURL, jpdbiml);
    jQuery.ajaxSetup({async: true});

    console.log(responseObj);
    resetForm();
    $("#rnum").focus();
    $("#edit").focus();
}

function checkItemId() {
    
    var itmid = $("#iid").val(); // Get the Item ID entered by the user
    if (itmid === "") {
        alert("Item ID missing!");
        $("#iid").focus();
        return "";
    }

    // Create a JSON object for the request
    var jsonStr = {id: itmid};
    var getRequest = createGET_BY_KEYRequest(connToken, imDBName, "Items", JSON.stringify(jsonStr));

    // Execute the GET request
    jQuery.ajaxSetup({async: false});
    var response = executeCommandAtGivenBaseUrl(getRequest, baseURL, jpdbirl);
    jQuery.ajaxSetup({async: true});

    if (response.status === 200) {
        // If Item exists, display the Item Name
        var itemData = JSON.parse(response.data).record;
        $("#iname").val(itemData.name); // 'name' field contains the Item Name
    } else {
        // If Item does not exist, show an error and refocus
        alert("Item not present");
        $("#iid").focus();
        $("#iname").val(""); // Clear the Item Name field
    }
}


function validateData()
{
    var rpno, rpdt, itmid, qnt, itmname;
    rpno = $("#rnum").val();
    rpdt = $("#rdate").val();
    itmid = $("#iid").val();
    itmname = $("#iname").val();
    qnt = parseFloat($("#qnt").val());

    if (rpno === "")
    {
        alert("Receipt No. Missing");
        $("#rnum").focus();
        return "";
    }

    if (rpdt === "")
    {
        alert("Receipt Date missing");
        $("#rdate").focus();
        return "";
    }

    if (itmid === "")
    {
        alert("Item ID missing");
        $("#iid").focus();
        return "";
    }

    if (qnt === "" || isNaN(qnt)) {
        alert("Quantity missing or invalid");
        $("#qnt").focus();
        return "";
    }
    
    var jsonStrObj = {
        rcpnum: rpno,
        rcpdate: rpdt,
        id: itmid,
        name: itmname,
        quantity: qnt
    };

    return JSON.stringify(jsonStrObj);
}

function getTotalQuantity() {

    var jsonStr = {id: itmid};
    var getRequest = createGET_BY_KEYRequest(connToken, imDBName, "Items", JSON.stringify(jsonStr));
    jQuery.ajaxSetup({async: false});
    var response = executeCommandAtGivenBaseUrl(getRequest, baseURL, jpdbirl);
    jQuery.ajaxSetup({async: true});

    if (response.status === 200) {
        
        var openingStock = JSON.parse(response.data).record.openingstock;
        console.log(openingStock);
    }

    // Fetch quantity from 'Inward' relation
    var jsonStrInward = {id: itmid};
    var getRequestInward = createGET_BY_KEYRequest(connToken, imDBName, "Inward", JSON.stringify(jsonStrInward));

    jQuery.ajaxSetup({ async: false });
    var responseInward = executeCommandAtGivenBaseUrl(getRequestInward, baseURL, jpdbirl);
    jQuery.ajaxSetup({ async: true });

    if (response.status === 200) {
        var inwardQuantity = JSON.parse(responseInward.data).record.quantity; 
        console.log(inwardQuantity);       
    }

    // Calculate total quantity
    var totalQuantity = openingStock + inwardQuantity;
    return totalQuantity;
}

function updateTotalQuantity() {
    var totalQuantity = getTotalQuantity();
    if (totalQuantity === null) {
        return;
    }

    var updateData = {
        quantity: totalQuantity
    };

    var updateRequest = createUPDATERecordRequest(connToken, JSON.stringify(updateData), imDBName, imRelationName);
    jQuery.ajaxSetup({ async: false });
    var response = executeCommandAtGivenBaseUrl(updateRequest, baseURL, jpdbiml);
    jQuery.ajaxSetup({ async: true });

    // if (response.status !== 200) {
    //     alert("Failed to update total quantity.");
    // } else {
    //     alert("Total quantity updated successfully.");
    // }
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
    $('#rnum').prop("disabled", true);
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
    $('#rnum').prop("disabled", true);
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
    $("#rnum").val(data.rcpnum);
    $("#rdate").val(data.rcpdate);
    $("#iid").val(data.id);
    $("#iname").val(data.name);
    $("#qnt").val(data.quantity);
  
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

initInwardForm();
getFirst();
getLast();
checkForNoRecord();
