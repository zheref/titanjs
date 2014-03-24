TitanJS
=======

Open Source HTML5 Mobile Framework aiming to Tablets Phonegap Apps

##Release Notes##
***

###0.6.4 / 2014 - 03 - 23###
***

- FIX: Titan.Database##interpretErrorCode() is not using anymore the SQLError object to use error code constants. Insted, now using the literal codes themselves.

###0.6.3 / 2014 - 03 - 22###
***

- EXTEND: Titan.Utils.isOnline() checks if navigator where the app is running has the "connection" property (in mobile devices) or try to use the "onLine" property in case the app is running on a desktop navigator.

***

##API Reference##
***

##Titan.Utils##

**isOnline()**

Specifies if the device executing the app is Online or NOT   
@public   
@method  
@return {boolean} Value specifying connection