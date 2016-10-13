/**
 * Created by Chris on 28/06/2016.
 */

$(function() {
    $( "#accordion" ).accordion({
        heightStyle: "content"
    });
});

function editRecipeCrops(obj, param) {
    var recipeIndex = obj.id.match(/\d/g)[0];
    var cropIndex = obj.id.match(/\d/g)[1]-1;
    var recipeName = document.getElementById("Recipe-" + recipeIndex + "-Name").value;
    if (param !== 'crop') {
        recipes[recipeName]['crops'][cropIndex][param] = parseInt(obj.value);
    } else {
        recipes[recipeName]['crops'][cropIndex][param] = obj.value;
    }
}

function changeName(obj) {
    var recipeIndex = obj.id.match(/\d/g)[0];
    var oldName = recipeNames[recipeIndex-1];
    var newName = obj.value;

    if (oldName !== newName) {
        Object.defineProperty(recipes, newName,
            Object.getOwnPropertyDescriptor(recipes, oldName));
        delete recipes[oldName];
    }
    recipeNames[recipeIndex-1] = newName
}

function editRecipeParam(obj, param) {
    var recipeIndex = obj.id.match(/\d/g)[0];
    var recipeName = document.getElementById("Recipe-" + recipeIndex + "-Name").value;
    recipes[recipeName][param] = parseInt(obj.value);
}

var recipeCount = 0;

function setRecipe(tableID, recipe, initial) {
    for (var i = 0; i < recipe['crops'].length; i++) {

        var val = recipe['crops'][i].crop;
        var sel = document.getElementById(tableID + "-Select-" + (i+1));
        if (!sel) {
            addCrop(tableID, initial);
            sel = document.getElementById(tableID + "-Select-" + (i+1));
        }

        var opts = sel.options;
        for (var opt, j = 0; opt = opts[j]; j++) {
            if (opt.value == val) {
                sel.selectedIndex = j;
                break;
            }
        }

        document.getElementById(tableID + "-StartYear-" + (i+1)).value = recipe['crops'][i]['startyear'];
        document.getElementById(tableID + "-EndYear-" + (i+1)).value = recipe['crops'][i]['endyear'];
        document.getElementById(tableID + "-Area-" + (i+1)).value = recipe['crops'][i]['area'];
        document.getElementById(tableID + "-Efficiency-" + (i+1)).value = recipe['crops'][i]['efficiency'];
    }
    document.getElementById(tableID + "-LaborReq").value = recipe['labor'];
}

function addRecipe(initial) {
    recipeCount += 1;
    var newRecipe = '<h3><input type="text" class="recipe-name" id="Recipe-' + recipeCount + '-Name" value="Recipe ' + recipeCount + '"/></h3>' +
        '<div><div><TABLE id="Recipe-' + recipeCount + '" width="350px" border="1">' +
        '<tr><th>Crop</th><th>Start Year</th><th>End Year</th><th>Area</th><th>Efficiency</th><th>Remove</th></tr>' +
        '<TR><TD><SELECT id="Recipe-' + recipeCount + '-Select-1" class="crop-select"><OPTION value="Cassava">Cassava</OPTION>' +
        '<OPTION value="SugarPalm">SugarPalm</OPTION>' +
        '<OPTION value="OilPalm">OilPalm</OPTION></SELECT></TD>' +
        '<TD><INPUT id="Recipe-' + recipeCount + '-StartYear-1" class="start-year" type="number" value="1"/></TD>' +
        '<TD><INPUT id="Recipe-' + recipeCount + '-EndYear-1" class="end-year" type="number" value="20"/></TD>' +
        '<TD><INPUT id="Recipe-' + recipeCount + '-Area-1" class="area" type="number" value="100"/></TD>' +
        '<TD><INPUT id="Recipe-' + recipeCount + '-Efficiency-1" class="efficiency" type="number" value="100"/></TD>' +
        '<td><INPUT class="remove-button" id="Recipe-' + recipeCount + '-Remove-1" type="button" value="-"' +
        'onclick="removeCrop(\'Recipe-' + recipeCount + '\',this.id)"/></td></TR></TABLE></div>' +
        //'Biodiversity index: <input type="number" class="biodiversity" id ="Recipe-' + recipeCount + '-Biodiversity" value="1"/>' +
        '<div><INPUT type="button" value="+" onclick="addCrop(\'Recipe-' + recipeCount + '\')"/></div>' +
        '<div>Labor force required (people per hectare): <input type="number" class="labor-req" id ="Recipe-' + recipeCount + '-LaborReq" value="1"/></div>' +
        '<INPUT type="button" value="Remove Recipe" class="removeRecipe"/></div>';
    $('.recipes').append(newRecipe);
    $('.recipes').accordion("refresh");

    if (initial !== true) {
        recipes["Recipe " + recipeCount] = {"crops": [], "labor": 50};
        recipes["Recipe " + recipeCount]['crops'].push(
            [{
            crop: 'Cassava',
            startyear: 1,
            endyear: 20,
            area: 100,
            efficiency: 100
        }]);
        recipeNames.push("Recipe " + recipeCount);

        $(document).ready( function() {
            $('.crop-select').on('change', function() {
                editRecipeCrops(this, 'crop');
            });
            $('.start-year').on('change', function() {
                editRecipeCrops(this, 'startyear');
            });
            $('.end-year').on('change', function() {
                editRecipeCrops(this, 'endyear');
            });
            $('.area').on('change', function() {
                editRecipeCrops(this, 'area');
            });
            $('.efficiency').on('change', function() {
                editRecipeCrops(this, 'efficiency');
            });
            $('.recipe-name').on('change keyup paste', function() {
                changeName(this)
            })
            $('.labor-req').on('change', function() {
                editRecipeParam(this, 'labor')
            });
        });
    }
}

$('#addRecipe').click(addRecipe);

$(document).on('click', '.removeRecipe' , function() {
    var parent = $(this).closest('div');
    var head = parent.prev('h3');
    var deletedRecipeID = parseInt(parent[0].id.replace( /^\D+/g, ''));
    recipeNames = [];
    var recipeName = document.getElementById("Recipe-" + (deletedRecipeID/2) + "-Name").value;
    var recipeID = 1;
    var pattern;
    var string;

    delete recipes[recipeName];

    // Redo IDs
    for(var i=1; i<=recipeCount; i++) {
        var id = (2*i)-1;
        if (deletedRecipeID !== id+1) {
            recipeNames.push(document.getElementById("Recipe-" + i + "-Name").value);
            pattern = new RegExp("Recipe-" + i, 'g');
            string = "Recipe-" + recipeID;

            $('#accordion').find('*').each(function () {
                this.innerHTML = this.innerHTML.replace(pattern, string);
            });

            document.getElementById('ui-id-' + (id)).id = "ui-id-" + (recipeID*2-1);
            document.getElementById('ui-id-' + (id+1)).id = "ui-id-" + (recipeID*2);

            recipeID += 1
        }
    }

     // Remove accordion tab
    parent.add(head).fadeOut('slow',function(){$(this).remove();});

    // restore correct values in recipes
    for(i=0; i<recipeNames.length; i++) {
        recipeName = recipeNames[i];
        setRecipe("Recipe-" + (i+1), recipes[recipeName], true);
    }

    $(document).ready( function() {
        $('.crop-select').on('change', function() {
            editRecipeCrops(this, 'crop');
        });
        $('.start-year').on('change', function() {
            editRecipeCrops(this, 'startyear');
        });
        $('.end-year').on('change', function() {
            editRecipeCrops(this, 'endyear');
        });
        $('.area').on('change', function() {
            editRecipeCrops(this, 'area');
        });
        $('.efficiency').on('change', function() {
            editRecipeCrops(this, 'efficiency');
        });
        $('.recipe-name').on('change keyup paste', function() {
            changeName(this)
        });
        $('.labor-req').on('change', function() {
            editRecipeParam(this, 'labor')
        });
    });

    recipeCount -= 1;
});

function addCrop(tableID, initial) {
    // Get table object
    var table = document.getElementById(tableID);

    // Insert new row at end of table
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    // Get column count and table number
    var colCount = table.rows[0].cells.length;
    var tableNumber = tableID.match(/\d/g)[0];

    // Insert new cells
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
            case "area":
                newcell.childNodes[0].value = "100";
                newcell.childNodes[0].id = "Recipe-" + tableNumber + "-Area-" + rowCount;
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

    // Add to recipes variable
    if (initial !== true) {
        var recipeName = document.getElementById("Recipe-" + tableNumber + "-Name").value;
        recipes[recipeName]['crops'].push({
            crop: 'Cassava',
            startyear: 1,
            endyear: 20,
            area: 100,
            efficiency: 100
        });

        $(document).ready( function() {
            $('.crop-select').on('change', function() {
                editRecipeCrops(this, 'crop');
            });
            $('.start-year').on('change', function() {
                editRecipeCrops(this, 'startyear');
            });
            $('.end-year').on('change', function() {
                editRecipeCrops(this, 'endyear');
            });
            $('.area').on('change', function() {
                editRecipeCrops(this, 'area');
            });
            $('.efficiency').on('change', function() {
                editRecipeCrops(this, 'efficiency');
            });
            $('.recipe-name').on('change keyup paste', function() {
                changeName(this)
            });
            $('.labor-req').on('change', function() {
                editRecipeParam(this, 'labor')
            });
        });
    }
}

function removeCrop(tableID, rowID) {
    // Remove row by row ID
    var table = document.getElementById(tableID);
    var rowIndex = rowID.match(/\d/g)[1];
    table.deleteRow(rowIndex);

    var tableNumber = tableID.match(/\d/g)[0];
    var rowCount = table.rows.length;
    var recipeName = document.getElementById("Recipe-" + tableNumber + "-Name").value;
    recipes[recipeName].splice(rowIndex-1, 1);

    // Redo IDs
    for(var i=1; i<rowCount; i++) {
        var pattern = /Recipe-\d-Remove-\d/g;
        var string = "Recipe-" + tableNumber + "-Remove-" + i;
        table.rows[i].cells[4].innerHTML = table.rows[i].cells[4].innerHTML.replace(pattern, string);

        // Redo IDs in the HTML
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

        // restore correct values
        var val = recipes[recipeName]['crops'][i-1]['crop'];
        var sel = document.getElementById("Recipe-" + tableNumber + "-Select-" + i);
        var opts = sel.options;
        for (var opt, j = 0; opt = opts[j]; j++) {
            if (opt.value == val) {
                sel.selectedIndex = j;
                break;
            }
        }
        document.getElementById("Recipe-" + tableNumber + "-StartYear-" + i).value = recipes[recipeName]['crops'][i-1]['startyear'];
        document.getElementById("Recipe-" + tableNumber + "-EndYear-" + i).value = recipes[recipeName]['crops'][i-1]['endyear'];
        document.getElementById("Recipe-" + tableNumber + "-Area-" + i).value = recipes[recipeName]['crops'][i-1]['area'];
        document.getElementById("Recipe-" + tableNumber + "-Efficiency-" + i).value = recipes[recipeName]['crops'][i-1]['efficiency'];
    }

    $(document).ready( function() {
        $('.crop-select').on('change', function() {
            editRecipeCrops(this, 'crop');
        });
        $('.start-year').on('change', function() {
            editRecipeCrops(this, 'startyear');
        });
        $('.end-year').on('change', function() {
            editRecipeCrops(this, 'endyear');
        });
        $('.area').on('change', function() {
            editRecipeCrops(this, 'area');
        });
        $('.efficiency').on('change', function() {
            editRecipeCrops(this, 'efficiency');
        });
        $('.recipe-name').on('change keyup paste', function() {
            changeName(this)
        });
        $('.labor-req').on('change', function() {
            editRecipeParam(this, 'labor')
        });
    });
}

$(document).ready( function() {
    for (var i=1; i<=Object.keys(recipes).length; i++) {
        addRecipe(true);
        setRecipe("Recipe-" + i, recipes["Recipe " + i], true);
    }
});

$(document).ready( function() {
    $('.crop-select').on('change', function() {
        editRecipeCrops(this, 'crop');
    });
    $('.start-year').on('change', function() {
        editRecipeCrops(this, 'startyear');
    });
    $('.end-year').on('change', function() {
        editRecipeCrops(this, 'endyear');
    });
    $('.area').on('change', function() {
        editRecipeCrops(this, 'area');
    });
    $('.efficiency').on('change', function() {
        editRecipeCrops(this, 'efficiency');
    });
    $('.recipe-name').on('change keyup paste', function() {
        changeName(this)
    });
    $('.labor-req').on('change', function() {
        editRecipeParam(this, 'labor')
    });
});