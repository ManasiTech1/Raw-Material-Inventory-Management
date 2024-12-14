var baseURL = "http://api.login2explore.com:5577";
var connToken = "90934472|-31949222567940220|90962740";
var jpdbirl = "/api/irl";
var jpdbiml = "/api/iml";
var imDBName="InvMngmnt-DB";
var imRelationName="Outward";

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
    $("#inum").prop("disabled", bvalue);
    $("#idate").prop("disabled", bvalue);
    $("#iid").prop("disabled", bvalue);
    $("#iname").prop("disabled", true);
    $("#qnt").prop("disabled", bvalue);
}

function initOutwardForm() {
    localStorage.clear();
    console.log("initOutwardForm() - done");
}

function newData()
{
    makeDataFormEmpty();
    disableForm(false);
    $("#inum").focus();
    disableNav(true);
    disableCtrl(true);
    $("#save").prop("disabled", false);
    $("#reset").prop("disabled", false);
}

function makeDataFormEmpty()
{
    $("#inum").val('');
    $("#idate").val('');
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

function getIssNoAsJsonObj()
{
    var issno=$("#inum").val();
    var jsonStr={
        issnum:issno
    };

    return JSON.stringify(jsonStr);
    }

function getIssNum()
{
    var rpno=getIssNoAsJsonObj();
    var getRequest=createGET_BY_KEYRequest(connToken,imDBName,imRelationName,rpno);
    
    jQuery.ajaxSetup({async:false});
    var jsonObj=executeCommandAtGivenBaseUrl(getRequest,baseURL,jpdbirl);
    jQuery.ajaxSetup({async:true});

    if(jsonObj.status === 200)
    {
        $("#inum").prop("disabled",true);
        alert("Issue No. already exist");
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
    $("#inum").prop("disabled", true);
    $("#idate").focus();
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
    $("#inum").focus();
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

function validateData() {
    var issno = $("#inum").val();
    var issdt = $("#idate").val();
    var itmid = $("#iid").val();
    var itmname = $("#iname").val();
    var qnt = parseFloat($("#qnt").val());

    if (issno === "") {
        alert("Receipt No. Missing");
        $("#inum").focus();
        return "";
    }

    if (issdt === "") {
        alert("Receipt Date missing");
        $("#idate").focus();
        return "";
    }

    if (itmid === "") {
        alert("Item ID missing");
        $("#iid").focus();
        return "";
    }

    if (isNaN(qnt) || qnt <= 0) {
        alert("Quantity missing or invalid");
        $("#qnt").focus();
        return "";
    }

    // Get total available quantity
    var totalQuantity = getTotalAvailableQuantity(itmid);

    if (qnt > totalQuantity) {
        alert("Quantity entered is more than available.");
        $("#qnt").focus();
        return "";
    }

    var jsonStrObj = {
        issnum: issno,
        issdate: issdt,
        id: itmid,
        name: itmname,
        quantity: qnt
    };

    return JSON.stringify(jsonStrObj);
}

function getTotalAvailableQuantity(itemId) {
    // Retrieve opening stock from the Item Management Page
    var jsonStr = { id: itemId };
    var getItemRequest = createGET_BY_KEYRequest(connToken, imDBName, "Items", JSON.stringify(jsonStr));

    jQuery.ajaxSetup({ async: false });
    var itemResponse = executeCommandAtGivenBaseUrl(getItemRequest, baseURL, jpdbirl);
    jQuery.ajaxSetup({ async: true });

    if (itemResponse.status !== 200) {
        return 0;
    }

    var openingStock = parseFloat(JSON.parse(itemResponse.data).record.openingstock);
    console.log("Opening Stock = ", openingStock);

    // Retrieve total received quantity from the Inward page
    var jsonStrg = { id: itemId };
    var getInwardRequest = createGET_BY_KEYRequest(connToken, imDBName, "Inward", JSON.stringify(jsonStrg));

    jQuery.ajaxSetup({ async: false });
    var inwardResponse = executeCommandAtGivenBaseUrl(getInwardRequest, baseURL, jpdbirl);
    jQuery.ajaxSetup({ async: true });

    if (inwardResponse.status !== 200) {
        return 0;
    }

    var receivedQuantity = parseFloat(JSON.parse(inwardResponse.data).record.quantity);
    console.log("Quantity Received = ", receivedQuantity);

    return openingStock + receivedQuantity;
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
    $('#inum').prop("disabled", true);
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
    $('#inum').prop("disabled", true);
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
    $("#inum").val(data.issnum);
    $("#idate").val(data.issdate);
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

initOutwardForm();
getFirst();
getLast();
checkForNoRecord();
