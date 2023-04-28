/*
 *
 * Use ServerCall class to get server response
 */

class ServerCall {
    constructor(url) {
        this.url = url;
        this.callback = null;

        this.fetchInit = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            //   // 'Content-Type': 'application/json'
            //   'Content-Type': 'application/x-www-form-urlencoded'
            //   // if you want to send 'multipart/form-data' remove 'Content-Type' header, browser will do it. 
        },
        //redirect: 'follow', // manual, *follow, error
        //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: '' // ArrayBuffer, ArrayBufferView, Blob/File, string, URLSearchParams, FormData
        // body data type must match "Content-Type" header
        };
    }

    set setCallback(callback) {
        this.callback = callback;
    }

    set setMethod(method) {
        if (method == 'GET' || 'HEAD') {
        this.fetchInit['method'] = method;
        delete this.fetchInit['body'];
        } else if (method == 'POST') {
        this.fetchInit['method'] = method;
        } else {
        // this.fetchInit['method'] = 'GET';
        }
    }

    set setData(data) {
        if (data instanceof URLSearchParams) {
        this.fetchInit['headers']['Content-Type'] = "application/x-www-form-urlencoded";
        } else {
        delete this.fetchInit['headers']['Content-Type'];
        }
        this.fetchInit['body'] = data;
    }

    async fetchServer() {
        let response;
        try {
        response = await fetch(this.url, this.fetchInit);

        if (!response.ok) {
            throw new Error(response.status);
        } else {
            response = await response.json(); //text();
        }

        } catch (error) {
        response = error;
        }

        if (typeof this.callback === "function") {
        this.callback(response); // call callback function to handel the response
        } else {
        // console.log("Callback not found!\n");
        return response;
        }
    }

}


class DataList {
    constructor(url, callback) {
        this.serverReq = new ServerCall(url);

        this.callback = callback;

        this.page = 1;
        this.pageTot = 1;
        this.search = "";
        this.lastHeader = 1;
        this.header = 1; // table column number
        this.order = 0; // 0 = ASC, 1 = DESC
        // this.headerTot = 0;

        this.requestData(1, this.page, this.header, this.order, '');
    }

    setControls(prevbtnId, nextbtnId) {
        this.prevBtn = document.getElementById(prevbtnId);
        this.prevBtn.addEventListener('click', this.prevDataset.bind(this));

        this.nextBtn = document.getElementById(nextbtnId);
        this.nextBtn.addEventListener('click', this.nextDataset.bind(this));
    }

    setDetail(detailboxId) {
        this.detailBox = document.getElementById(detailboxId);
    }

    setSortHeader(...restParam) {
        // console.log(arguments.length, restParam.length, restParam);
        // this.headerTot = restParam.length;
        for (let ind = 0; ind < restParam.length; ind++) {
        document.getElementById(restParam[ind]).addEventListener('click', this.sortData.bind(this, ind));
        }
    }

    setSearch(searchinpId, searchbtnId) {
        this.searchInp = document.getElementById(searchinpId);
        this.searchBtn = document.getElementById(searchbtnId);
        this.searchBtn.addEventListener('click', this.searchData.bind(this));
    }

    async requestData(newQuery, pageNum, sortCol, sortType, searchVal) {
        const searchParams = new URLSearchParams();
        searchParams.append('page_num', pageNum);
        searchParams.append('sort_col', sortCol);
        searchParams.append('sort_type', sortType);
        searchParams.append('search_new', newQuery);
        searchParams.append('search_val', searchVal);

        // for (var pair of searchParams.entries()) {
        //   console.log(pair[0] + ', ' + pair[1]);
        // }

        this.serverReq.setData = searchParams;
        let serverRes = await this.serverReq.fetchServer();
        if (!!serverRes['page_tot']) { // or user Boolean(str)
        this.pageTot = serverRes['page_tot'];
        }
        this.changeControls();
        this.callback(serverRes['tbl_data']);

        // for(let i in serverRes['tbl_data']){
        //   const tblRow = document.createElement("div");
        //   tblRow.classList.add("tr");

        // }
    }

    searchData() {
        if (this.searchInp.validity.tooShort) {
        console.log('Character length is too short');
        this.searchInp.setCustomValidity('Character length is too short');
        } else {
        this.searchInp.setCustomValidity('');
        this.search = this.searchInp.value.toLowerCase();
        this.page = 1;
        this.header = 1;
        this.order = 0;
        this.requestData(1, this.page, this.header, this.order, this.search);
        }
    }

    sortData(colHead) {
        this.header = colHead + 1;
        // this.header = parseInt(col_head) + 1;
        // console.log(this.header);
        this.page = 1;
        if (this.header == this.lastHeader) { // check  for last active header
        if (this.order == 0) { // then toggle order state
            this.order = 1;
        } else {
            this.order = 0;
        }
        // console.log(header + " " + order);
        this.requestData(0, this.page, this.header, this.order, this.search);
        } else { // otherwise order state is ascending
        this.order = 0;
        // console.log(header + " " + order);
        this.requestData(0, this.page, this.header, this.order, this.search);
        this.lastHeader = this.header;
        }
    }

    prevDataset() {
        this.page = this.page - 1;
        console.log(this.page, this.header, this.order);
        this.requestData(0, this.page, this.header, this.order, this.search);
    }

    nextDataset() {
        this.page = this.page + 1;
        console.log(this.page, this.header, this.order);
        this.requestData(0, this.page, this.header, this.order, this.search);
    }

    changeControls() {
        if (this.page >= this.pageTot) {
        this.nextBtn.disabled = true;
        } else {
        this.nextBtn.disabled = false;
        }

        if (this.page <= 1) {
        this.prevBtn.disabled = true;
        } else {
        this.prevBtn.disabled = false;
        }

        this.detailBox.textContent = 'Page ' + this.page + ' of ' + this.pageTot;
    }

    refreshData() {
        this.page = 1;
        this.header = 1;
        this.order = 0;
        this.requestData(1, this.page, this.header, this.order, '');
    }
}
