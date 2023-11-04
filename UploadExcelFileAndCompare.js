/**
 * @param {*} fileId Element Id of the file
 * @param {*} buttonId Button ID, when clicked, triggers the program to append the data to the table and identify mismatched data.
 * @param {*} tableId Referenced table from the DOM using the table's id.
 * @param {*} hd1 Table's header name to compare with.
 * @param {*} hd2 Excel file header name to compare with.
 * @param {*} bgColor Background color of the cell when a mismatch is found.
 */
const UploadExcelFileAndCompare = (fileId, buttonId, tableId, hd1, hd2, bgColor) =>{
    let   table        = document.getElementById(tableId);
    let   uploadButton = document.getElementById(buttonId);
    
    const map          = new Map( );

    let uploadCount = 0;

    // Initialize hashmap with acquired data from the excel file
    uploadButton.addEventListener('click', function( ) {
        // Prevents append attempt if the file
        // has been uploaded and appended once already.
        if(uploadCount > 0){
            return;
        }

        const excelFile    = document.getElementById(fileId).files[0];
        if(excelFile === undefined){
            console.log("No file was selected.")
            return;
        }
        ++uploadCount;

        readXlsxFile(excelFile).then(function(rows) {
            let hd1Index = 0;
            let hd2Index = 0;
            rows.forEach(elem =>{
                // Determine the column indices of the excel's id and target column
                for(let i = 0; i < elem.length; ++i){
                    if(elem[i] === hd1)
                        hd1Index = i;
                    if(elem[i] === hd2)
                        hd2Index = i;
                }

                let key = (elem[hd1Index] !== undefined)? elem[hd1Index]: -1;
                let val = (elem[hd2Index] !== undefined)? elem[hd2Index]: null;

                map.set(key, val);
            })

            // Appends new header name to the table
            appendDataToTableHeaderById(table, map.get('id'));            

            // Appends data to the table body, referenced by the row's id attribute
            getTableIds(table).forEach(id =>{
                let value = "";
                if(typeof id === 'string')
                    value = (map.get(id) !== undefined)? map.get(id): 'ID not found.';
                else
                    value = (map.get(parseInt(id)) !== undefined)? map.get(parseInt(id)): 'ID not found.';
                
                appendDataToTableBodyById(id, table, value);
            })

            // Scans the table and identifies mismatched data based on the header name arguments
            getTableIds(table).forEach(id =>{
                highlightMismatch(id, table, hd1, hd2, bgColor);
            })
        })
    })
}

// Helper functions
const highlightMismatch = (id, table, header1, header2, bgColor) =>{
    const [thead, ,tbody] = table.children
    let thead_td_collection = thead.children[0].children

    let index1 = 0;
    for(let tdElement of thead_td_collection){
        if(tdElement.innerText === header1) break;
        ++index1;
    }

    let index2 = 0;
    for(let tdElement of thead_td_collection){
        if(tdElement.innerText === header2) break;
        ++index2;
    }    

    let row = getTableRowById(id, table);
    let data1 = (row.children[index1].innerText).trim()
    let data2 = (row.children[index2].innerText).trim()

    if((data1) !== (data2)){
        let cell1 = row.children[index1]
        cell1.style.fontWeight = "900"
        cell1.style.color = bgColor;

        let cell2 = row.children[index2]
        cell2.style.fontWeight = "900"
        cell2.style.color = bgColor;

        // if(cell2.innerText === 'ID not found.'){
        //     var blink_speed = 400; // every 1000 == 1 second, adjust to suit
        //     var t = setInterval(function () {
        //         cell2.style.visibility = (cell2.style.visibility == 'hidden' ? '' : 'hidden');
        //         cell2.style.color = bgColor;
        //     }, blink_speed);
        // }
    }
}

const getTableIds = (table) =>{
    let arrayId = []
    const [thead, ,tbody] = table.children
    for(let td_element of tbody.children)
        arrayId.push(td_element.id)
    
    return arrayId;
}

const appendDataToTableHeaderById = (table, innerTextData) =>{
    const [thead, ,tbody] = table.children
    let thead_row = thead.children[0];

    for(let td_element of thead_row.children){
        if(td_element.innerText === innerTextData){
            td_element.innerText = innerTextData;
            return;
        }
    }

    let tableData = document.createElement("td");
    tableData.innerText = innerTextData;
    thead_row.appendChild(tableData)
}

const appendDataToTableBodyById = (id, table, innerTextData) =>{
    let tableRow = getTableRowById(id, table);
    const [thead, ,tbody] = table.children;

    let theadLength = thead.children[0].children.length
    let tbodyLength = getTableRowById(id, table).children.length;

    // Makes sure that the attempt to append cell
    // does not go past the thead length
    if(tbodyLength >= theadLength){
        let td = tableRow.children[tbodyLength-1]
        td.innerText = innerTextData;
        return;
    }

    let cell = document.createElement('td');
    cell.innerText = innerTextData;
    cell.style.borderLeft  = "1px dashed #494949"
    tableRow.appendChild(cell);
}

const getTableRowById = (id, table) =>{
    const [thead, ,tbody] = table.children;

    if(tbody === null || tbody === undefined){
        console.error("Referenced DOM table does not contain a tbody element.")
        return;
    }

    let tbody_tr_collection = tbody.children
    for(let td_element of tbody_tr_collection){
        if(td_element.id === id){   
            return td_element;
        }
    }
}