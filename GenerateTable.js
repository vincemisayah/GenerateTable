/**
 * @param {*} tableId Id of the referenced table
 * @returns Viewable data in a table format
 */
const GenerateTable = (tableId, idName, getURL, toCapitalized) => {
    return new Promise((resolve, reject) =>{
        if(document.getElementById(tableId) === undefined){
            reject('Failed');
        }
        else{ // Resolve Portion
            // Initialize table components
            let table       = document.getElementById(tableId)
            let tableHeader = table.createTHead();
            let tableBody   = table.createTBody();
            let tableRow    = null;

            // Get data from server
            let fetchedDataPromise = (table.title !== undefined) ? getData(getURL) : null;
            if (fetchedDataPromise === null)
                return

            fetchedDataPromise.then((res) => { // promise status is fulfilled
                if (res.length === undefined) {
                    let row = tableHeader.insertRow(0);
                    let index = 0;
                    for (const property in res) {
                        let headerName = property;
                        let cell = row.insertCell(index++);
                        if(toCapitalized !== undefined && toCapitalized)
                            cell.innerHTML = headerName.toUpperCase()
                        else
                            cell.innerHTML = headerName
                    }
                    tableRow = document.createElement("tr");

                    if(res[property] !== undefined && property === idName)
                        tableRow.setAttribute("id", res[property])

                    // Traverse through each value in an object
                    for (const property in res) {
                        let objValue = res[property]
                        // Create data cell and append it to tableRow
                        let tableData = document.createElement("td")

                        // Recursively acquires the object value down to the lowest level
                        if (typeof objValue === 'object')
                            tableData.innerHTML = getObjectValue(objValue)
                        else
                            tableData.innerHTML = objValue
                        tableRow.appendChild(tableData)
                    }
                    tableBody.appendChild(tableRow)
                }
                else {
                    // Create thead portion of the table
                    let row = tableHeader.insertRow(0);
                    const firstObject = res[0]

                    let index = 0;
                    for (const property in firstObject) {
                        let headerName = property;
                        let cell = row.insertCell(index++);
                        if(toCapitalized !== undefined && toCapitalized)
                            cell.innerHTML = headerName.toUpperCase()
                        else
                            cell.innerHTML = headerName

                    }

                    // Populate the table body
                    res.forEach(obj => {
                        tableRow = document.createElement("tr");

                        // Traverse through each value in an object
                        for (const property in obj) {
                            let objValue = obj[property]

                            if(objValue !== undefined && property === idName)
                                tableRow.setAttribute("id", objValue)

                            // Create data cell and append it to tableRow
                            let tableData = document.createElement("td")

                            if (typeof objValue === 'object')
                                tableData.innerHTML = getObjectValue(objValue)
                            else
                                tableData.innerHTML = objValue

                            tableRow.appendChild(tableData)
                        }

                        tableBody.appendChild(tableRow)
                    })
                }

                resolve(table);

            }).catch((error) => { // Data not found
                console.log(error)
            })
        }
    })
}

// Use for callback
const getData = async (url) => {
    return await fetchJSON(url);
}

/**
 * @description Acquires JSON data
 * @param {*} requestURL REST GET url 
 */
async function fetchJSON(requestURL) {
    try {
        const response = await fetch(requestURL);
        if (!response.ok) 
            throw new Error("Network response was not OK");
        
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) 
            throw new TypeError("Server did not return a JSON type data.");
        
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * @param {*} object data of type 'object'
 * @returns The value of the object
 */
const getObjectValue = (object) => {
    let val = "<ol>"
    for (const property in object) {
        if (typeof object[property] === 'object')
            val += `<br><strong><u>${property.toUpperCase()}</u> ${getObjectLowestLevelValue(object[property])}</strong>`
        else
            val += ("<li>" + `<strong><u>${property.toUpperCase()}</u></strong></li> <i>${object[property]}</i>`)
    }
    val += "</ol>"
    return val
}

/**
 * @param {*} object data of type 'object' 
 * @returns The value of inner-most nested object
 */
const getObjectLowestLevelValue = (object) => {
    let val = ""
    for (const property in object) {
        val += (`<li style="font-weight:normal">${property.toUpperCase()}: <i style="font-weight:normal">${object[property]}</i></li>`)
        if (typeof object[property] === 'object')
            return getObjectLowestLevelValue(object[property])
    }
    return val
}
