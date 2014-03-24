TitanJS
=======

Open Source HTML5 Mobile Framework aiming to Tablets Phonegap Apps

##Release Notes##
***

###0.6.5 / 2014 - 03 - 24###
***

- CHANGE: Titan.Proxy.pushFile() now is using as aliasUrl and its related Url, the specified in the resources.js file, not anymore the setted up by addUploadUrl.
- ADD: Titan.Resources.restRoute() to build and return complete rest url based on the 'REST' route
- EXTEND: Now the default viewportId and additional viewportIds can be setted up

###0.6.4 / 2014 - 03 - 23###
***

- FIX: Titan.Database##interpretErrorCode() is not using anymore the SQLError object to use error code constants. Insted, now using the literal codes themselves.

###0.6.3 / 2014 - 03 - 22###
***

- EXTEND: Titan.Utils.isOnline() checks if navigator where the app is running has the "connection" property (in mobile devices) or try to use the "onLine" property in case the app is running on a desktop navigator.

***

##API Reference##
***

##Titan.Proxy##

**pushFile(aliasUrl, filePath, filename, mimetype, atResponse, atError)**

Send file specified by {filePath} to the URL in resources with name {aliasUrl}, and upload it with name {filename} and mimetype {mimetype}.
After succeeding execute {atResponse} retrieving the server response.
@public
@async
@method
@param {String} aliasUrl The alias of the Upload URL saved previously
@param {String} filePath The local filepath to the file
@param {String} filename The name to save the file on the server
@param {String} mimetype The mimetype of the file to transfer
@param {function()} atResponse The action to be executed after transfer success
@param {function()=} atError The action to be executed at any error in transfer

##Titan.Utils##

**isOnline()**

Specifies if the device executing the app is Online or NOT   
@public   
@method  
@return {boolean} Value specifying connection