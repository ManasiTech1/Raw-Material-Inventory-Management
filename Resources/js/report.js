var baseURL = "http://api.login2explore.com:5577";
var connToken = "90934472|-31949222567940220|90962740";
var jpdbirl = "/api/irl";
var jpdbiml = "/api/iml";
var imDBName="InvMngmnt-DB";
var imRelationName="Report";

setBaseUrl(baseURL);

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

    if (response.status !== 200) {
        alert("Item not present");
        $("#iid").focus();
    }
    return;
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
    console.log("Opening Stock = ",openingStock);

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

function qntIssued(itemId) {
    // Retrieve quantity issued from the Item Issued Page
    var jsonStr = { id: itemId };
    var getItemRequest = createGET_BY_KEYRequest(connToken, imDBName, "Outward", JSON.stringify(jsonStr));

    jQuery.ajaxSetup({ async: false });
    var itemResponse = executeCommandAtGivenBaseUrl(getItemRequest, baseURL, jpdbirl);
    jQuery.ajaxSetup({ async: true });

    if (itemResponse.status !== 200) {
        return 0;
    }

    var qntisd = parseFloat(JSON.parse(itemResponse.data).record.quantity);
    console.log("Quantity Issued = ",qntisd);
    return qntisd;

}

function currStk() {

    var itmid = $("#iid").val();

    if (itmid === "") {
        alert("Item ID missing");
        $("#iid").focus();
        return "";
    }

    var initialAlvQnt = getTotalAvailableQuantity(itmid);

    var isdqnt = qntIssued(itmid);

    var currentstk = initialAlvQnt - isdqnt;
    console.log("Current stock = ", currentstk);
    return currentstk;

}

function buildTable() {
    // Get the Item ID from the input field
    var itemId = $("#iid").val();
    if (itemId === "") {
        alert("Item ID missing");
        $("#iid").focus();
        return;
    }

    // Fetch Item Name from the database
    var jsonStr = { id: itemId };
    var getItemRequest = createGET_BY_KEYRequest(connToken, imDBName, "Items", JSON.stringify(jsonStr));

    jQuery.ajaxSetup({ async: false });
    var itemResponse = executeCommandAtGivenBaseUrl(getItemRequest, baseURL, jpdbirl);
    jQuery.ajaxSetup({ async: true });

    if (itemResponse.status !== 200) {
        return;
    }

    var itemData = JSON.parse(itemResponse.data).record;
    var itemName = itemData.name;

    // Calculate Current Stock
    var currentStock = currStk();

    if (currentStock === -1) {
        alert("Error in calculating current stock.");
        return;
    }

    // Populate the table
    var tableBody = $("#reportTable");
    var newRow = `
        <tr>
            <td>${itemId}</td>
            <td>${itemName}</td>
            <td>${currentStock}</td>
        </tr>
    `;

    tableBody.append(newRow);
    $("#iid").val('');
}