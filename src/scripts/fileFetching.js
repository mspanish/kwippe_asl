const clearHTTPRequests = () => {
    //console.log('existing xhrArray length is '+xhrArray.length)
    if (xhrArray.length > 0) {
        //  console.log('destroying previous Xhttp req')
        for (var i=0; i < xhrArray.length; i++) {
            let req = xhrArray[i];
            const index = xhrArray.indexOf(i);
            if (index > -1) {
              xhrArray.splice(index, i);
            }
            abortSilently(req,i)
        }
    }       
}

export { clearHTTPRequests }