/**
 * Created by Chris on 28/06/2016.
 */

$(function() {
    $( "#accordion" ).accordion({
        heightStyle: "content"
    });
});

var recipeCount = 0;

function setRecipe(tableID, crops) {
    for (var i = 0; i < crops.length; i++) {

        var val = crops[i].crop;
        var sel = document.getElementById(tableID + "-Select-" + (i+1));
        if (!sel) {
            addCrop(tableID)
        }
        sel = document.getElementById(tableID + "-Select-" + (i+1));
        var opts = sel.options;
        for (var opt, j = 0; opt = opts[j]; j++) {
            if (opt.value == val) {
                sel.selectedIndex = j;
                break;
            }
        }

        document.getElementById(tableID + "-StartYear-" + (i+1)).value = crops[i].startYear;
        document.getElementById(tableID + "-EndYear-" + (i+1)).value = crops[i].endYear;
        document.getElementById(tableID + "-Efficiency-" + (i+1)).value = crops[i].efficiency;
    }
}

function addRecipe() {
    recipeCount += 1;
    var newRecipe = '<h3><input type="text" id="Recipe-' + recipeCount + '-Name" value="Recipe ' + recipeCount + '"></h3>' +
        '<div><TABLE id="Recipe-' + recipeCount + '" width="350px" border="1">' +
        '<tr><th>Crop</th><th>Start Year</th><th>End Year</th><th>Efficiency</th><th>Remove</th></tr>' +
        '<TR><TD><SELECT id="Recipe-' + recipeCount + '-Select-1" class="crop-select"><OPTION value="Cassava">Cassava</OPTION>' +
        '<OPTION value="SugarPalm">SugarPalm</OPTION>' +
        '<OPTION value="OilPalm">OilPalm</OPTION></SELECT></TD>' +
        '<TD><INPUT id="Recipe-' + recipeCount + '-StartYear-1" class="start-year" type="number" value="1"/></TD>' +
        '<TD><INPUT id="Recipe-' + recipeCount + '-EndYear-1" class="end-year" type="number" value="20"/></TD>' +
        '<TD><INPUT id="Recipe-' + recipeCount + '-Efficiency-1" class="efficiency" type="number" value="100"/></TD>' +
        '<td><INPUT class="remove-button" id="Recipe-' + recipeCount + '-Remove-1" type="button" value="-"' +
        'onclick="removeCrop(\'Recipe-' + recipeCount + '\',this.id)"/></td></TR></TABLE>' +
        '<INPUT type="button" value="Add Crop" onclick="addCrop(\'Recipe-' + recipeCount + '\')"/>' +
        '<INPUT type="button" value="Remove Recipe" class="removeRecipe"/></div>';
    $('.recipes').append(newRecipe);
    $('.recipes').accordion("refresh");
}

$('#addRecipe').click(addRecipe);

$(document).on('click', '.removeRecipe' , function() {
    // Remove accordion tab
    var parent = $(this).closest('div');
    var head = parent.prev('h3');
    parent.add(head).fadeOut('slow',function(){$(this).remove();});

    // Redo IDs
    var deletedRecipeID = parseInt(parent[0].id.replace( /^\D+/g, ''));
    var recipeID = 1;
    var pattern;
    var string;
    for(var i=1; i<=recipeCount; i++) {
        var id = (2*i)-1;
        if (deletedRecipeID !== id+1) {
            pattern = /Recipe-\d/g;
            string = "Recipe-" + recipeID;

            $('#accordion').find('*').each(function () {
                this.innerHTML = this.innerHTML.replace(pattern, string);
            });

            console.log(document.getElementById('ui-id-' + (id)).id);
            console.log("ui-id-" + (recipeID*2-1));

            document.getElementById('ui-id-' + (id)).id = "ui-id-" + (recipeID*2-1);
            document.getElementById('ui-id-' + (id+1)).id = "ui-id-" + (recipeID*2);

            recipeID += 1
        }

        //
    }

    recipeCount -= 1;
});

function addCrop(tableID) {
    var table = document.getElementById(tableID);

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    var colCount = table.rows[0].cells.length;
    var tableNumber = tableID.match(/\d/g)[0];

    for(var i=0; i<colCount; i++) {
        var newcell	= row.insertCell(i);

        newcell.innerHTML = table.rows[1].cells[i].innerHTML;
        switch(newcell.childNodes[0].className) {
            case "crop-select":
                newcell.childNodes[0].id = "Recipe-" + tableNumber + "-Select-" + rowCount;
                break;
            case "start-year":
                newcell.childNodes[0].value = "1";
                newcell.childNodes[0].id = "Recipe-" + tableNumber + "-StartYear-" + rowCount;
                break;
            case "end-year":
                newcell.childNodes[0].value = "20";
                newcell.childNodes[0].id = "Recipe-" + tableNumber + "-EndYear-" + rowCount;
                break;
            case "efficiency":
                newcell.childNodes[0].value = "100";
                newcell.childNodes[0].id = "Recipe-" + tableNumber + "-Efficiency-" + rowCount;
                break;
            case "remove-button":
                newcell.childNodes[0].id = "Recipe-" + tableNumber + "-Remove-" + rowCount;
                break;

        }
    }
}

function removeCrop(tableID, rowID) {
    // Remove row by row ID
    var table = document.getElementById(tableID);
    table.deleteRow(rowID.match(/\d/g)[1]);

    // Redo IDs
    var tableNumber = tableID.match(/\d/g)[0];
    var rowCount = table.rows.length;
    for(var i=1; i<rowCount; i++) {
        var pattern = /Recipe-\d-Remove-\d/g;
        var string = "Recipe-" + tableNumber + "-Remove-" + i;
        table.rows[i].cells[4].innerHTML = table.rows[i].cells[4].innerHTML.replace(pattern, string);

        pattern = /Recipe-\d-Select-\d/g;
        string = "Recipe-" + tableNumber + "-Select-" + i;
        table.rows[i].cells[0].innerHTML = table.rows[i].cells[0].innerHTML.replace(pattern, string);

        pattern = /Recipe-\d-StartYear-\d/g;
        string = "Recipe-" + tableNumber + "-StartYear-" + i;
        table.rows[i].cells[1].innerHTML = table.rows[i].cells[1].innerHTML.replace(pattern, string);

        pattern = /Recipe-\d-EndYear-\d/g;
        string = "Recipe-" + tableNumber + "-EndYear-" + i;
        table.rows[i].cells[2].innerHTML = table.rows[i].cells[2].innerHTML.replace(pattern, string);

        pattern = /Recipe-\d-Efficiency-\d/g;
        string = "Recipe-" + tableNumber + "-Efficiency-" + i;
        table.rows[i].cells[3].innerHTML = table.rows[i].cells[3].innerHTML.replace(pattern, string);
    }
}

function tableToJson(table) {
    var data = [];

    // first row needs to be headers
    var headers = [];
    for (var i=0; i<table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'');
    }

    // go through cells
    for (var i=1; i<table.rows.length; i++) {

        var tableRow = table.rows[i];
        var rowData = {};

        for (var j=0; j<tableRow.cells.length; j++) {

            if (tableRow.cells[j].cellIndex === 0) {
                try {
                    rowData[headers[j]] = tableRow.cells[j].childNodes[1].value;
                }
                catch (err) {
                    rowData[headers[j]] = tableRow.cells[j].childNodes[0].value;
                }
            } else if (tableRow.cells[j].cellIndex === 1 || tableRow.cells[j].cellIndex === 2 || tableRow.cells[j].cellIndex === 3) {
                rowData[headers[j]] = tableRow.cells[j].childNodes[0].value;
            }
        }

        data.push(rowData);
    }

    return data;
}

function confirmRecipes(reload) {
    for (var recipeID = 1; recipeID <= recipeCount; recipeID++) {
        var table = document.getElementById("Recipe-" + recipeID);
        var recipeName = document.getElementById("Recipe-" + recipeID + "-Name").value;
        recipes[recipeName] = tableToJson(table);
    }

    if (reload === true) {
        reloadData()
    }
}

$(document).ready( function() {

    for (var i=1; i<=Object.keys(recipes).length; i++) {
        addRecipe();
        setRecipe("Recipe-" + i, recipes["Recipe " + i]);
    }
    confirmRecipes();
});

function reloadData() {
    data = [];
    for (var i=0; i<geolayers.length; i++){
        Object.keys(geolayers[i]._layers).forEach(function (key, index) {
            retrieveData(geolayers[i]._layers[key]['feature'], data, i+1);
        });
    }

    function removeData(ndx, dimensions) {
        dimensions.forEach(function (dim) {
            dim.filter(null)
        });
        ndx.remove();
    }

    removeData(cf, dimensionList);
    cf.add(data);
    dc.redrawAll();
}