/**
 * 
 * @param {*} table 
 * @param {*} title 
 * @param {*} headerNamesArr 
 */
const DisplayTableDataToModal = (table, idName, title, headerNamesArr, hdCompareFrom, hdCompareTo, color) =>{
    let myArr = headerNamesArr

    const modal      = document.getElementById('modal')
    const openModal  = document.getElementById('open-modal')

    // Create Update button that'll be appended later to the modal popup window
    const updateButton = document.createElement('button');
    updateButton.setAttribute('id', 'updateButton');
    updateButton.innerText = 'save';

    // Create close button that'll be appended later to the modal popup window
    const closeModal = document.createElement('button');
    closeModal.innerText = 'close';

    // Converts the data for each row of the table to an array of objects
    let objArray = convertTableDataToObjectArray(table);

    // Adds title to the Modal window
    let modalTitle = document.createElement('h1');
    modalTitle.innerHTML = title;
    modal.prepend(modalTitle);


    //TODO 
    /**
     * Closes the modal popup when the use clicks outside
     * of the dialog box.
     */
    modal.addEventListener('click', (e) =>{
        // console.log(e.target)

        if( e.target.parentElement.id !== 'modal'){
            // if(e.target.id === 'modal')
            //     return;
            // modal.close()
        }
        // if(e.target.parentElement.id !== 'modal')
        //     modal.close()
    })

    
    let fieldHeaders = []
    let fieldElementIds = []
    // Appends table information to the Modal window
    let tableIDs = getTableIDs(table);
    let infoDiv = document.createElement('div');
    tableIDs.forEach(id =>{
        let row = getRowById(id, table);
        row.addEventListener('click', ( ) =>{
            let rowObjects = convertTableDataToObjectArray(table);
            let object = getObjectById(id, idName, rowObjects)

            infoDiv.innerHTML = "";
            fieldElementIds = []
            for(const property in object){
                fieldHeaders.push(property)
                fieldElementIds.push(`${property.toLowerCase()}-rowNum-${id}`);

                console.log(`property = ${property}`)

                if(property === hdCompareFrom)
                    infoDiv.innerHTML += formattedHtmlModifiable(id, property, object);
                else
                    infoDiv.innerHTML += formattedHtml(id, property, object);
            }
            
            updateButton.type = "button";
            updateButton.className  = 'btn btn-success';

            closeModal.type = "button";
            closeModal.className  = 'btn btn-secondary';

            modal.append(infoDiv)
            modal.append(updateButton)
            
            modal.append(closeModal)
            modal.showModal();
        })
    })

    updateButton.addEventListener('click', ( ) =>{
        let arr = []
        let index = 0;
        fieldElementIds.forEach(id =>{
            let field = document.getElementById(id);
            let fieldVal = field.value;

            if(/\r|\n/.exec(fieldVal)){
                fieldVal = fieldVal.replace('\n', '');
            }

            let object = new Object();
            object[fieldHeaders[index++]] = fieldVal.trim();
            arr.push(object);
        })
        const dataToSend = convertToMergedJsonObject(arr);
      
        // Send Data to server to be processed
        postData('http://localhost:8080/PunchInSystem/do/postEmployeeSickHours', dataToSend).then((response) => {
            let targetId = null;
            let targetRow = null;
            for(const property in response){
                // Get the row to be updated
                if(property === idName){
                    targetId = response[property];
                    targetRow = getRowById(response[property], table);
                }
            }

            let headers = getTableHeaders(table);
            let index = 0;
            const mapHeaderIndex = new Map( );
            headers.forEach(header =>{
                mapHeaderIndex.set(index++, header);
            })

            // Rewrites new data returned by server to the target row
            for(let i = 0; i < headerNamesArr.length; ++i){
                targetRow.children[i].textContent = response[mapHeaderIndex.get(i)];
            }

            let data1 = getTableDataInnerTextByIdAndColumnName(targetId, hdCompareFrom, table);
            let data2 = getTableDataInnerTextByIdAndColumnName(targetId, hdCompareTo, table);

            if(data1 !== undefined && data2 !== undefined){
                if(data1 === data2){
                    let cell1 = getTableDataByIdAndColumnName(targetId, hdCompareFrom, table);
                    cell1.style.fontWeight = "normal"
                    cell1.style.color = "black";
            
                    let cell2 = getTableDataByIdAndColumnName(targetId, hdCompareTo, table);
                    cell2.style.fontWeight = "normal"
                    cell2.style.color = "black";
                }
                else{
                    let cell1 = getTableDataByIdAndColumnName(targetId, hdCompareFrom, table);
                    cell1.style.fontWeight = "900"
                    cell1.style.color = color;
            
                    let cell2 = getTableDataByIdAndColumnName(targetId, hdCompareTo, table);
                    cell2.style.fontWeight = "900"
                    cell2.style.color = color;                    
                }
            }
            // console.log(`${data1}, ${data2}`);
            modal.close();
            
        });
    })

    // Closes the modal when the close button is clicked
    closeModal.addEventListener('click', () =>{
        modal.close();
    })
}

const getTableDataByIdAndColumnName = (id, columnName, table) =>{
    let row = getRowById(id, table);
    let headers = getTableHeaders(table);

    let index = -1;
    for(let i = 0; i < headers.length; ++i){
        if(headers[i] === columnName)
            index = i
    }

    // console.log("Row . . . ");
    // console.log(row.children[index].innerText)
    if(row.children[index] === undefined){
        console.log('getTableDataByIdAndColumnName(): Tried to access a non-existent column.')
        return undefined;
    }

    return row.children[index];
}

const getTableDataInnerTextByIdAndColumnName = (id, columnName, table) =>{
    let row = getRowById(id, table);
    let headers = getTableHeaders(table);

    let index = -1;
    for(let i = 0; i < headers.length; ++i){
        if(headers[i] === columnName)
            index = i
    }

    if(row.children[index] === undefined){
        console.log('getTableDataByIdAndColumnName(): Tried to access a non-existent column.')
        return undefined;
    }

    return row.children[index].innerText
}

const getTableHeaders = (table) =>{
    let tableHeaders = []
    const [thead, ,tbody] = table.children
    let thead_td_collection = thead.children[0].children

    for(let tdElement of thead_td_collection){
        tableHeaders.push(tdElement.innerText);
    }    
    return tableHeaders;
}

async function postData(url = "", data = {}) {
    if(data === null || data === undefined){
        console.error(`Data is undefined or null: ${data}`);
        return;
    }

    // Default options are marked with *
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    
    if(response.ok === false){
        console.error("Failed to send data to server.")
        return response;
    }

    return response.json(); // parses JSON response into native JavaScript objects
}

const convertToMergedJsonObject = (objArray) => {
    return JSON.parse(myStringify(objArray));
}

const myStringify = (objArray) =>{
    let stringifiedJsonObject = "{"
    for(let i = 0; i < objArray.length; ++i){
        let myJSON = JSON.stringify(objArray[i]);
        myJSON = myJSON.replace('{', '');
        myJSON = myJSON.replace('}', '');

        stringifiedJsonObject += (myJSON);

        if(i < objArray.length-1)
            stringifiedJsonObject += ',';
    }
    stringifiedJsonObject += "}";

    return stringifiedJsonObject
}

const formattedHtml = (id,property, object) =>{
    return(
        `<div>
            <strong>${property}:</strong>
            <br>
            <p type="text" id="${property.toLowerCase()}-rowNum-${id}">
                ${object[property]}
            </p>
        </div>`
    )
}

const formattedHtmlModifiable = (id,property, object) =>{
    return(
        `<div>
            <strong>${property}:</strong>
            <br>
            <textarea 
                type="text" 
                id="${property.toLowerCase()}-rowNum-${id}"  
                rows="2" 
                cols="55">${object[property]}
            </textarea>
        </div>`
    )
}

const getRowById = (id, table) =>{
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

const getTableIDs = (table) =>{
    let arrayId = []
    const [thead, ,tbody] = table.children
    for(let td_element of tbody.children){
        arrayId.push(td_element.id)
    }
    
    return arrayId;
}

const convertTableDataToObjectArray = (table) => {
    const [thead, ,tbody] = table.children
    let thead_td_collection = thead.children[0].children  

    let objectArray = []
    let headerNames = []
    for(let tdElement of thead_td_collection){
        headerNames.push(tdElement.innerText)
    }

    let tbody_tr_collection = tbody.children
    for(let tr_element of tbody_tr_collection){
        let obj = new Object();
        for(let i = 0; i < tr_element.children.length; ++i){
            let td = tr_element.children[i]
            obj[headerNames[i]] = td.innerText;
        }
        objectArray.push(obj);
    }
    return objectArray
}

const getObjectById = (id, idName, objArray) =>{
    for(let i = 0; i < objArray.length; ++i){
        let object = objArray[i];
        for(const property in object){
            if(property === idName && object[property] === id){
                return objArray[i];
            }
        }
    }
    return null;
}
