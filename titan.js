/*

 Copyright (C) 2013 by Sergio Daniel Lozano (@zheref)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */

/**
 * TitanJS, library for PhoneGap Tablet Applications
 * @author Zheref, Sergio Daniel Lozano Garcia
 * @since 07-08-13
 * @requires:
 * Cordova (phonegap.com) for Titan.* and Titan.Journey
 * Underscore (underscorejs.org) for Titan.* and Titan.Utils
 * JQuery (jquery.com) or Zepto.js for Titan.* and Titan.Journey, Titan.View
 * @recommended:
 * Knockout for Titan.View
 * HTML5SQL for Titan.Database
 * Accounting.js for Titan.Utils
 * Handlebars for Titan.strategy
 * JS-Signals for Titan.Signals
 * Amplify for Titan.Proxy
 * @pattern module
 * @version 0.6.3
 */
//noinspection JSUnusedGlobalSymbols
var Titan = (function() {

    //noinspection JSUnusedGlobalSymbols, JSUnusedLocalSymbols
    var Titan = new (function() {
        var self = this;

        var TheApp = null;

        /**
         * @module singleton
         */
        this.App = function(customApp, options) {

            return (function(customApp, options) {
                var innerApp;

                // The instance fields
                function TitanApplication(options) {
                    options = options || {};

                    var platform = options.platform || Titan.Platform.current;

                    //noinspection JSUnusedGlobalSymbols
                    this.getPlatform = function() {
                        return platform;
                    };

                    //noinspection JSUnusedGlobalSymbols
                    this.setPlatform = function(newPlatform) {
                        Titan.Platform.set(newPlatform);
                        platform = Titan.Platform.get();
                    };

                    var state = options.state || "";

                    if (options.hasOwnProperty('views')) {
                        self.View.addViews(options.views);
                    }

                    if (options.hasOwnProperty('resources')) {
                        //noinspection JSUnresolvedVariable
                        var res = options.resources;
                        if (res.hasOwnProperty('strings')) {
                            //noinspection JSUnresolvedVariable
                            self.Resources.addStrings(res.strings);
                        }
                        if (res.hasOwnProperty('templates')) {
                            //noinspection JSUnresolvedVariable
                            self.Resources.addTemplates(res.templates);
                        }
                        if (res.hasOwnProperty('queries')) {
                            //noinspection JSUnresolvedVariable
                            self.Resources.addQueries(res.queries);
                        }
                        if (res.hasOwnProperty('urls')) {
                            //noinspection JSUnresolvedVariable
                            self.Resources.addUrls(res.urls);
                        }
                        if (res.hasOwnProperty('routes')) {
                            //noinspection JSUnresolvedVariable
                            self.Resources.addRoutes(res.routes);
                        }
                    }

                    // METODOS --------------------------------------------------------------------

                    //noinspection JSUnusedGlobalSymbols
                    this.getState = function() {
                        return state;
                    };

                    //noinspection JSUnusedGlobalSymbols
                    this.setState = function(newState) {
                        if (typeof (newState) !== 'undefined') {
                            var isValid = true;
                            isValid += newState === self.AppState.DEVELOPMENT_TIME ||
                                newState === self.AppState.PRODUCTION_TIME;

                            if (isValid) {
                                state = newState;
                            } else {
                                throw "TitanJS: The app-state specified is not a valid " +
                                    "recognized state. Please use the corresponding " +
                                    "Titan.AppState enumeration to specify it.";
                            }
                        } else {
                            throw "TitanJS: No app-state has been specified.";
                        }
                    };

                }

                // The class fields
                var _static = {
                    getInstance: function(customApp, options) {
                        if (innerApp === undefined) {
                            var baseApp = new TitanApplication(options);
                            customApp = customApp || {};
                            innerApp = $.extend(baseApp, customApp);
                        }
                        return innerApp;
                    }
                };

                TheApp = _static.getInstance(customApp, options);
                return TheApp;
            })(customApp, options);

        };

        /**
         * @public
         * @enum
         */
        this.AppState = {
            DEVELOPMENT_TIME: "Development Time",
            PRODUCTION_TIME: "Production Time"
        };

        /**
         * @public
         * @module
         */
        this.Behaviour = new (function() {
            var selfBehaviour = this;

            this.progress = function() {
                //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                return new promise.Promise();
            };

            this.exe = function(action, param1, param2) {
                if (!_.isUndefined(action) && _.isFunction(action)) {
                    if (!_.isUndefined(param1)) {
                        if (!_.isUndefined(param2)) {
                            action(param1, param2);
                        } else {
                            action(param1);
                        }
                    } else {
                        action();
                    }
                } else {
                    Titan.Debug.log("TitanJS: (Titan.behaviour.attempt) No action has been " +
                        "passed as parameter");
                }
            };

            this.attempt = this.exe;

            // TODO
            //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
            this.Attempt = function(action, params) {

                this.run = function() {

                };

                return this;

            };

            this.doNothing = function() { };

            this.wait = function(seconds, to) {
//                var progress = self.Behaviour.progress();
                //noinspection JSUnresolvedFunction
                setTimeout(function() {
//                    progress.done();
                    selfBehaviour.exe(to);
                }, seconds * 1000);
//                return progress;
            };

            //noinspection JSUnusedGlobalSymbols
            this.TitanPromise = function() {

            };

            var loopElements = [];
            var loopIterator = 0;

            /**
             * @private
             * @method
             * The virtual signature to be executed whe iterating asynchronously each
             * item in the array passed as parameter in the iterative recursion.
             * @param {?} i
             * @param {Function} s To execute when finish
             * @param {Function} e To execute when error while iterating or to break the operation
             * @type {function(?, function(), function())}
             */
            var loopAsyncMethod = function(i, s, e) {};

            /**
             * @private
             * @method
             * @param {function()} atSuccess
             * @param {function(Titan.Error.Crash)} atError
             */
            var recursiveIterate = function(atSuccess, atError) {
                var loopCurrent = loopElements[loopIterator];
                loopAsyncMethod(loopCurrent, function() {
                    if (loopIterator < loopElements.length - 1) {
                        loopIterator++;
                        recursiveIterate(atSuccess, atError);
                    } else {
                        loopElements = [];
                        loopIterator = 0;
                        loopAsyncMethod = selfBehaviour.doNothing;
                        selfBehaviour.exe(atSuccess);
                    }
                }, function(reason) {
                    selfBehaviour.exe(atError, reason);
                    loopElements = [];
                    loopIterator = 0;
                    loopAsyncMethod = selfBehaviour.doNothing;
                });
            };

            /**
             * @public
             * @async
             * @method
             * @param {Array} elements
             * @param {function(?, function(), function())} atEach
             * @param {function()} atSuccess
             * @param {function()} atError
             */
            this.recursiveAsyncLoop = function(elements, atEach, atSuccess, atError) {
                loopElements = elements;
                loopIterator = 0;
                loopAsyncMethod = atEach;
                if (elements.length > 0) {
                    recursiveIterate(atSuccess, atError);
                } else {
                    self.Behaviour.exe(atSuccess);
                }
            };

            return selfBehaviour;
        })();

        this.Camera = new (function() {
            var selfCamera = this;

            /**
             * @public
             * @async
             * @method
             * @param {function(String)} returner
             * @param {function(String)} atError
             */
            this.choosePhotoFromLibrary = function (returner, atError) {
                if (typeof (navigator) !== 'undefined') {
                    //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                    navigator.camera.getPicture(function (imgData) {
                        returner(imgData);
                    }, function (error) {
                        Titan.Debug.error('TitanJS: A problem has been raised while trying to ' +
                            'take photo from gallery. Reason:');
                        Titan.Debug.error('TitanJS: ' + error);
                        atError(error);
                    }, {
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
                        allowEdit: true
                    });
                } else {
                    throw "Impossible to geolocate: Cordova library has not been loaded or " +
                        "rendered to its use";
                }
            };

            /**
             * @public
             * @async
             * @method
             * @param {number} quality
             * @param {function(String)} returner
             * @param {function(String)} atError
             * @param {Object=} customOptions
             */
            this.takePhoto = function (quality, returner, atError, customOptions) {
                customOptions = customOptions || {};

                var N = self.Notifier;

                if (typeof (navigator) !== 'undefined') {
                    var defaultConf = {
                        quality: quality,
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        sourceType: navigator.camera.PictureSourceType.CAMERA,
                        allowEdit: true
                    };

                    var conf = _.extend(defaultConf, customOptions);

                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    navigator.camera.getPicture(function (imgData) {
                        returner(imgData);
                    }, function (errorMessage) {
                        self.Notifier.report(errorMessage, 'Titan.Camera.takePhoto', null, atError);
                    }, conf);
                } else {
                    throw "Impossible to geolocate: Cordova library has not been loaded or " +
                        "rendered to its use";
                }
            };

            return selfCamera;
        })();

        this.Chrono = new (function() {
            var selfChrono = this;

            /**
             * @backward
             * @deprecated
             */
            this.wait = self.Behaviour.wait;

            /**
             * @public
             * @method
             * @param {(String|number)=} format
             * @param {Date=} date
             * @returns {string}
             * TODO: Optimize
             */
            this.formattedDate = function (format, date) {

                if (_.isUndefined(date)) {
                    date = new Date();
                }

                if (_.isUndefined(format)) {
                    format = 5;
                }

                var curr_date = date.getDate();
                var curr_month = date.getMonth();
                curr_month = curr_month + 1;
                var curr_year = date.getFullYear();
                var curr_min = date.getMinutes();
                var curr_hr = date.getHours();
                var curr_sc = date.getSeconds();

                if (curr_month.toString().length == 1) {
                    curr_month = '0' + curr_month;
                }

                if (curr_date.toString().length == 1) {
                    curr_date = '0' + curr_date;
                }

                if (curr_hr.toString().length == 1) {
                    curr_hr = '0' + curr_hr;
                }

                if (curr_min.toString().length == 1) {
                    curr_min = '0' + curr_min;
                }

                //dd-mm-yyyy
                if (format === 1) {
                    return curr_date + "-" + curr_month + "-" + curr_year;
                }

                //yyyy-mm-dd
                else if (format === 2) {
                    return curr_year + "-" + curr_month + "-" + curr_date;
                }

                //dd/mm/yyyy
                else if (format === 3) {
                    return curr_date + "/" + curr_month + "/" + curr_year;
                }

                // MM/dd/yyyy HH:mm:ss
                else if (format === 4) {
                    return curr_month + "/" + curr_date + "/" + curr_year + " " +
                        curr_hr + ":" + curr_min + ":" + curr_sc;
                }

                // yyyy-mm-dd HH:mm:ss
                else if (format === 5) {
                    return curr_year + "-" + curr_month + "-" + curr_date + " " +
                        curr_hr + ":" + curr_min + ":" + curr_sc;
                }

                else {
                    return curr_year + "-" + curr_month + "-" + curr_date + " " +
                        curr_hr + ":" + curr_min + ":" + curr_sc;
                }

            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @returns {string}
             */
            this.standardDate = function() {
                var fechaActual = new Date();
                var dia = fechaActual.getDate();
                var mes = fechaActual.getMonth() + 1;
                var anio = fechaActual.getFullYear();

                return dia + '-' + mes + '-' + anio;
            };

            /**
             * @public
             * @method
             * @returns {string}
             */
            this.linearCompleteDate = function () {
                var date = new Date();

                var curr_date = date.getDate();
                var curr_month = date.getMonth();
                curr_month = curr_month + 1;
                var curr_year = date.getFullYear();
                var curr_min = date.getMinutes();
                var curr_hr = date.getHours();
                var curr_sc = date.getSeconds();

                if (curr_month.toString().length == 1) {
                    curr_month = '0' + curr_month;
                }

                if (curr_date.toString().length == 1) {
                    curr_date = '0' + curr_date;
                }

                if (curr_hr.toString().length == 1) {
                    curr_hr = '0' + curr_hr;
                }

                if (curr_min.toString().length == 1) {
                    curr_min = '0' + curr_min;
                }

                // yyyy-mm-dd HH:mm:ss
                return curr_year + "" + curr_month + "" + curr_date + "" +
                    curr_hr + "" + curr_min + "" + curr_sc;
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             *
             * @returns {string}
             */
            this.getShortLinearDate = function() {
                var date = new Date();

                var curr_date = date.getDate();
                var curr_month = date.getMonth();
                curr_month = curr_month + 1;
                var curr_year = date.getYear();

                if (curr_month.toString().length == 1) {
                    curr_month = '0' + curr_month;
                }

                if (curr_date.toString().length == 1) {
                    curr_date = '0' + curr_date;
                }

                return curr_year.toString().substr(1, 2) + "" + curr_month + "" + curr_date;
            };

            /**
             * @public
             * @method
             */
            this.getTimestamp = function() {
                var now = (new Date()).getTime();
                self.Data.log("TitanJS: Timestamp reported = " + now);
                return now;
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             */
            this.startMeter = function(key) {
                var now = selfChrono.getTimestamp();
                self.Data.write("meter_" + key + "_start", now);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             */
            this.stopMeter = function(key) {
                var now = selfChrono.getTimestamp();
                if (self.Data.isSet("meter_" + key + "_start")) {
                    var then = self.Data.read("meter_" + key + "_start");
                    var measured = now - then;
                    self.Notifier.log("TitanJS: Chronometer from " + then + " to " + now + " with difference = " + measured + " has been finished");
                    self.Data.write("meter_" + key + "_stop", now);
                } else {
                    throw "The " + key + "-keyed chronometer hasn't been started";
                }
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             */
            this.getMetric = function(key) {
                if (self.Data.isSet("meter_" + key + "_start") && self.Data.isSet("meter_" + key + "_stop")) {
                    var start = self.Data.read("meter_" + key + "_start");
                    var end = self.Data.read("meter_" + key + "_stop");
                    var metric = end - start;
                    self.Notifier.log("TitanJS: Memory of chronometer from " + start + " to " + end + " with difference = " + metric);
                } else {
                    throw "The " + key + "-keyed chronometer hasn't been started and/or stopped";
                }
            };

            return selfChrono;
        })();


        /**
         * @backward
         * @deprecated
         */
        this.chrono = this.Chrono;

        /**
         * @public
         * @module
         */
        this.Data = new (function() {
            var selfData = this;

            /**
             * @public
             * @method
             * @param {!String} key
             * @returns {boolean}
             */
            this.isSet = function(key) {
                if (!_.isUndefined(localStorage)) {
                    self.Debug.log('TitanJS: The value of "' + key + '" was checked');
                    return localStorage.getItem(key) !== null;
                } else {
                    throw "TitanJS: localStorage is not available";
                }
            };

            /**
             * @public
             * @shortcut
             */
            this.is = this.isSet;

            /**
             * @public
             * @method
             * @param {!String} key
             * @returns {String}
             */
            this.read = function (key) {
                if (!_.isUndefined(localStorage)) {
                    var val = localStorage.getItem(key);
                    self.Debug.log('TitanJS: The value of "' + key + '" was read: ' + val);
                    val = (val === 'true') ? true : val;
                    val = (val === 'false') ? false : val;
                    return val;
                } else {
                    throw "TitanJS: localStorage is not available";
                }
            };

            /**
             * @public
             * @method
             * @param {!String} key
             * @param {!*} value
             * @returns {*}
             */
            this.write = function (key, value) {
                if (!_.isUndefined(localStorage)) {
                    self.Debug.log('TitanJS: The value of "' + key + '" was written: ' + value);
                    return localStorage.setItem(key, value);
                } else {
                    throw "TitanJS: localStorage is not available";
                }
            };

            /**
             * @public
             * @method
             * @param {!String} key
             * @returns {*}
             */
            this.erase = function (key) {
                if (!_.isUndefined(localStorage)) {
                    self.Debug.log('TitanJS: The value of "' + key + '" was erased');
                    return localStorage.removeItem(key);
                } else {
                    throw "TitanJS: localStorage is not available";
                }
            };

            return selfData;
        })();

        /**
         * @public
         * @module
         */
        this.Database = new (function() {
            var selfDatabase = this;

            var wsdb = null;
            var dbName = "";
            var dbDesc = "";
            var dbVers = "1.0";
            var dbSize = 0;

            /**
             * @public
             * @async
             * @method
             * @param {{name: String, description: String, size: String}} configuration
             * @param {function()=} atFinish
             */
            this.init = function(configuration, atFinish) {
                dbName = configuration.name || "Database";
                dbDesc = configuration.description || "";
                dbSize = configuration.size || "1.0";

                wsdb = window.openDatabase(dbName, dbVers, dbDesc, dbSize);
                self.Behaviour.exe(atFinish);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.initializeWebSqlDatabase = this.init;

            /**
             * Retorna la instancia activa y abierta de la base de datos en caso de que exista.
             * De lo contrario retorna NULL
             * @public
             * @method
             * @returns {?Database}
             */
            this.get = function() {
                if (!_.isNull(wsdb)) {
                    return wsdb;
                } else {
                    self.Debug.error("TitanJS: The database hasn't been initialized. NULL returned");
                    return null;
                }
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @shortcut
             */
            this.getDatabase = this.get;

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.getWebSqlDatabase = this.get;

            /**
             * Interprets the given error code to a human understable string message to debug
             * any issue.
             * @param {number} errorCode
             * @param {String=} query
             * @returns {String}
             */
            var interpretErrorCode = function(errorCode, query) {

                query = query || "QUERY NOT REACHED. FAILED WHILE STARTING TRANSACTION";

                var U = self.Utils;

                switch (errorCode) {
                    case SQLError.UNKNOWN_ERR:
                        return U.I("Error DB001: Unidentified non-database error while trying to execute statement: \"{{query}}\" during current transaction", {query: query});
                    case SQLError.DATABASE_ERR:
                        return U.I("Error DB002: Unidentified database error while executing statement: \"{{query}}\"", {query: query});
                    case SQLError.VERSION_ERR:
                        return U.I("Error DB003: The actual database version was not what it should be due to no longer matched the expected version of the Database object");
                    case SQLError.TOO_LARGE_ERR:
                        return U.I("Error DB004: Data retrieved from the database by \"{{query}}\" query was too large. The ResultSet size must be reduced", {query: query});
                    case SQLError.QUOTA_ERR:
                        return "Error DB005: There was not enough remaining storage space, or the storage quota was reached and the user declined to give more space to the database";
                    case SQLError.SYNTAX_ERR:
                        return U.I("Error DB006: Syntax error or not-allowed statement in \"{{query}}\" query", {query: query});
                    case SQLError.CONSTRAINT_ERR:
                        return U.I("Error DB007: Constraint error in statement \"{{query}}\"", {query: query});
                    case SQLError.TIMEOUT_ERR:
                        return U.I("Error DB008: Timeout error while executing statement \"{{query}}\"", {query: query});
                    default:
                        return U.I("Error DB001: Unidentified non-database error while trying to execute statement: \"{{query}}\" during current transaction", {query: query});
                }
            };

            /**
             * Ejecuta la accion definida por execute bajo el contexto de una transaccion en WebSQL
             * @public
             * @async
             * @method
             * @param {function(SQLTransaction)} execute To execute under the transaction context
             * @param {function(Titan.Error.Crash=)=} atError To execute in case the transaction operations fails
             * @param {function()=} atSuccess To execute in case the transaction operations success
             * @error If database hasn't been initialized and succesfully open
             */
            this.getNewTransaction = function(execute, atSuccess, atError) {
                var N = self.Notifier;

                atSuccess = atSuccess || function(transaction) {};
                atError = atError || function(error) {};

                var db = selfDatabase.get();

                if (!_.isNull(db)) {
                    db.transaction( execute,
                                    function(error) {
                                        var message = interpretErrorCode(error.code);
                                        N.report(message, 'Titan.Database.getNewTransaction', null, atError);
                                    },
                                    atSuccess
                                  );

                } else {
                    var message = "Error DB009: Database hasnt been initialized";
                    N.report(message, 'Titan.Database.getNewTransaction', null, atError);
                }
            };

            /**
             * Ejecuta una consulta de lectura en la base de datos WebSql iniciada
             * @public
             * @async
             * @method
             * @param {String} query SQL Statement to execute
             * @param {Array || Object} data Data map to interpolate to the query
             * @param {function(SQLTransaction, SQLResultSet)} atSuccess To execute on SQL operation success
             * @param {function(Titan.Error.Crash=)} atError To execute on SQL operation fails
             * @param {SQLTransaction=} transact Transaction Object to keep working on it
             * @error When SQL Statement execution fails
             */
            this.query = function (query, data, atSuccess, atError, transact) {
                var B  = self.Behaviour,
                    D  = self.Debug,
                    RS = self.Resources,
                    SQL = RS.sql;

                var errorCallbackHandler = function(transaction, error) {
                    var message = interpretErrorCode(error.code, query);
                    D.report(message, 'Titan.Database.query:execute', null, atError);
                };

                if (!_.isArray(data)) {
                    query = SQL(query, data);
                    data = [];
                }

                if (_.isUndefined(transact)) {

                    this.getNewTransaction(function(tr) {
                        D.log("TitanJS QUERY: " + query);

                        tr.executeSql(query, data, atSuccess, errorCallbackHandler);

                    }, B.doNothing, atError);

                } else {
                    D.log('TitanJS QUERY: ' + query);

                    transact.executeSql(query, data, atSuccess, errorCallbackHandler);
                }
            };

            /**
             * Procesa un lote completo de codigo SQL a traves de la libreria HTML5SQL
             * @public
             * @async
             * @method
             * @param {String} query La cadena con el lote de codigo SQL
             * @param {function()} atFinish Accion a ejecutar cuando se termine de procesar satisfactoriamente
             * @param {function()} atError Accion a ejecutar en caso de que se presente un error al intentarlo
             */
            this.queryBatch = function(query, atFinish, atError) {
                if (query === "") {
                    atFinish();
                    self.Notifier.log("No SQL queried has been processed due to it's empty");
                } else {
                    if (typeof (html5sql) !== "undefined") {
                        html5sql.openDatabase(dbName, dbDesc, dbSize);
                        html5sql.process(query, atFinish, atError);
                    }
                    else {
                        throw "TitanJS: HTML5SQL hasn't been included as one of your libraries";
                    }
                }
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.processSQL = this.queryBatch;

            /**
             * Crea la tabla sobre la base de datos que creo la transaccion pasada como parametro
             * @param {Object} schema El esquema de datos de la tabla con sus columnas descritas
             * @param {SQLTransaction} transaction El objeto de transaccion generado por la base de datos
             * @param {function()=} atSuccess Callback que se ejecuta cuando este procedimiento atomico termina exitosamente
             * @param {function(Titan.Error.Crash)=} atError Callback que se ejecuta cuando este procedimiento termina con errores o no termina
             * TODO: Por ahora se asume que todas las columnas son un STRING denotando todo el concepto de al columna.
             * TODO: ...Se pretende, por tanto hacer que funcione tanto como si es un STRING o un OBJETO dentando independientemente cada caracteristica de la columna
             */
            this.createTable = function (schema, transaction, atSuccess, atError) {
                self.Debug.log("TitanJS: The table '" + schema.name + "' will be created.");
                var query = "CREATE TABLE IF NOT EXISTS `" + schema.name + "` ( ";
                query += schema.columns.join(", ");
                query += ");";
                self.Debug.log("TitanJS QUERY: " + query);

                //noinspection JSValidateTypes
                transaction.executeSql(query, [], function() {
                    self.Debug.log("TitanJS: The table {{ nombre }} was successfully created/confirmed", { nombre: schema.name });
                    self.Behaviour.exe(atSuccess);
                }, function(error) {
                    Titan.Debug.report("TitanJS: The table '{{nombre}}' couldn't be created successfully because {{mensaje}}", "Titan.Database.createTable", error, atError, { nombre: schema.name, mensaje: error.message});
                });
            };

            /**
             * @public
             * @method
             * @param {Array.<Object>} schemas
             * @param {Function=} atSuccess
             * @param {function(Error || Titan.Error.Crash)=} atError
             * @param {SQLTransaction=} transaction
             */
            this.creationalCascade = function(schemas, atSuccess, atError, transaction) {
                var i = 0,
                    N = self.Notifier;

                var recursiveCall = function(t) {
                    var toCreateNow = schemas[i++];
                    selfDatabase.createTable(toCreateNow, t, function() {
                        if (i < schemas.length) {
                            recursiveCall(t);
                        } else {
                            self.Behaviour.exe(atSuccess, t);
                        }
                    }, function(error) {
                        N.report("Error trying to cascadingly create tables", "Titan.Database.creationalCascade.recursiveCall", error, atError);
                    });
                };

                if (_.isUndefined(transaction)) {
                    Titan.Database.getNewTransaction(function(transact) {
                        recursiveCall(transact);
                    });
                } else {
                    recursiveCall(transaction);
                }
            };

            /**
             * Procesa la consulta SELECT (query) pasada como parametro y retorna
             * los resultados ejecutando {atEach} por cada uno. Al finalizar el ultimo
             * resultado ejecuta {atExito}.
             * Si no se encuentran resultados se ejecuta {atSinResultados}
             * Si falla el procesamiento de la consulta se ejecuta {atError}
             * @public
             * @async
             * @method
             * @param {String} query La cadena de consulta SQL. Debe ser una consulta tipo SELECT
             * @param {Array || Object} data El arreglo de valores dinamicos a pasar a la consulta por cada ?
             * @param {function(?)} atEach To execute for and with each element retrieved
             * @param {function(SQLTransaction=)=} atSuccess To execute just after the execution and/or retrieval of the last item
             * @param {function()=} atError To execute in case the retrieval fails
             * @param {function()=} atNoResults To execute if no rows have been retrieved
             * @error TDB101: When fails selecting the query specified
             */
            this.list = function(query, data, atEach, atSuccess, atError, atNoResults) {
                var B = self.Behaviour,
                    N = self.Notifier;

                selfDatabase.query(query, data, function (transaction, results) {
                    // Check if retrieved rows
                    if (results.rows.length > 0) {
                        // Walk through the rows
                        for (var i = 0; i < results.rows.length; i++) {
                            atEach(results.rows.item(i));
                            // Check if it's latest
                            if (i === results.rows.length - 1) {
                                self.Behaviour.exe(atSuccess, transaction);
                            }
                        }
                    } else {
                        self.Behaviour.exe(atNoResults);
                    }
                }, function (error) {
                    N.error("StackTrace TDB101: Titan.Database.list - Failed to select query '{{query}}'", { query: query });
                    B.exe(atError, error);
                });
            };

            /**
             * @public
             * @async
             * @method
             * @param {!String} tablename
             * @param {String} conditions
             * @param {function()} atEach
             * @param {function()=} atSuccess
             * @param {function()=} atError
             * @param {function()=} atNoResults
             */
            this.listTable = function(tablename, conditions, atEach, atSuccess, atError, atNoResults) {
                var query;

                if (conditions !== "") {
                    query = "SELECT * FROM `" + tablename + "` WHERE " + conditions;
                } else {
                    query = "SELECT * FROM `" + tablename + "`";
                }

                selfDatabase.list(query, [], atEach, atSuccess, atError, atNoResults);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @async
             * @method
             * @param {String} tableName
             * @param {String} fieldName
             * @param {String} conditions
             * @param {function(Object)} returner
             * @param {function()} atError
             */
            this.listField = function(tableName, fieldName, conditions, returner, atError) {
                var query, array = [];

                if (conditions !== '') {
                    query = "SELECT " + fieldName + " FROM " + tableName + " WHERE " + conditions;
                } else {
                    query = "SELECT " + fieldName + " FROM " + tableName;
                }

                selfDatabase.list(query, [], function(element) {
                    array.push(element[fieldName]);
                }, function() {
                    returner(array);
                }, function(error) {
                    self.Debug.error('TitanJS: Error trying to bring the ' +
                        'field from the table. Reason: ');
                    self.Debug.error(error.code + ": " + error.message);
                    self.Behaviour.exe(atError);
                }, function() {
                    returner([]);
                });
            };

            /**
             * @public
             * @async
             * @method
             * @param {String} tableName
             * @param {String} fieldName
             * @param {String} conditions
             * @param {function(Array)} returner
             * @param {function()} atError
             * @param {Object} options
             */
            this.listDistinctField = function(tableName, fieldName, conditions, returner, atError, options) {
                var query, array = [];

                if (conditions !== '') {
                    query = "SELECT DISTINCT " + fieldName + " FROM " + tableName + " WHERE " + conditions;
                } else {
                    query = "SELECT DISTINCT " + fieldName + " FROM " + tableName;
                }

                if (!_.isUndefined(options)) {
                    //noinspection JSUnresolvedVariable
                    if (self.Utils.isDefined(options.orderBy)) {
                        //noinspection JSUnresolvedVariable
                        query += " ORDER BY " + options.orderBy;
                    }
                }

                selfDatabase.list(query, [], function(element) {
                    array.push(element[fieldName]);
                }, function() {
                    returner(array);
                }, function(error) {
                    self.Debug.error('TitanJS: Error trying to bring the ' +
                        ' distinct field from the table. Reason: ');
                    self.Debug.error(error.code + ": " + error.message);
                    self.Behaviour.exe(atError, error);
                }, function() {
                    returner([]);
                });
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * Retrieve and returns the first record found by the SELECT query specified
             * @public
             * @async
             * @method
             * @param {String} query The SELECT query to be executed to retrieve the record
             * @param {function()=} returner Callback to be executed to return the field in the record
             * @param {function()=} atNotfound Action to be executed in case record not found
             * @param {function()=} atError Action to be executed when an error is raised by the operation
             */
            this.getFirstByQuery = function(query, returner, atNotfound, atError) {
                var N = self.Notifier,
                    B = self.Behaviour;

                query += " LIMIT 0, 1";
                selfDatabase.query(query, [], function (transaction, results) {
                    if (results.rows.length > 0) {
                        returner(results.rows.item(0));
                    } else {
                        Titan.Behaviour.exe(atNotfound);
                    }
                }, function(error) {
                    N.error("TitanJS: Error trying to bring the record from the table");
                    B.exe(atError, error);
                });
            };

            /**
             * Retrieve and return the first record found by looking in the table specified
             * and given the specified conditions to filter
             * @public
             * @async
             * @method
             * @param {String} tableName The name of the table to query
             * @param {String} conditions Series of conditions separated by AND to filter the query
             * @param {function} returner Callback to be executed to return the field in the record
             * @param {function} atNotfound Action to be executed in case record not found
             * @param {function} atError Action to be executed when an error is raised by the operation
             */
            this.getFirstBy = function(tableName, conditions, returner, atNotfound, atError) {
                var query;

                if (conditions !== Titan.Utils.String.EMPTY) {
                    query = "SELECT * FROM " + tableName + " WHERE " + conditions;
                } else {
                    query = "SELECT * FROM " + tableName;
                }

                query += " LIMIT 0, 1";

                selfDatabase.query(query, [], function (transaction, results) {
                    if (results.rows.length > 0) {
                        returner(results.rows.item(0));
                    } else {
                        self.Behaviour.exe(atNotfound);
                    }
                }, function (error) {
                    self.Debug.error("TitanJS: Error trying to bring the record from " +
                        "the table. Reason:");
                    self.Debug.error(error);
                    self.Behaviour.exe(atError);
                });
            };

            /**
             *
             * @param {String} tableName
             * @param {String} id
             * @param {function(Object)} returner
             * @param {function()=} atNotfound
             * @param {function()=} atError
             */
            this.retrieve = function (tableName, id, returner, atNotfound, atError) {
                var N = self.Notifier,
                    B = self.Behaviour;

                var query = "SELECT * FROM " + tableName + " WHERE ID = '" + id + "' LIMIT 0, 1";
                selfDatabase.query(query, [], function (transaction, results) {
                    if (results.rows.length > 0) {
                        returner(results.rows.item(0));
                    } else {
                        self.Behaviour.exe(atNotfound);
                    }
                }, function(error) {
                    N.error("TitanJS: Error trying to bring the record from the table");
                    B.exe(atError, error);
                });
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * Retrieve and return the value of the specified of the first record found by looking
             * in the table specified and given the specified conditions to filter
             * @param {String} tableName The name of the table to query
             * @param {String} fieldName The name of the column to retrieve its field value and return it
             * @param {String} conditions Series of conditions separated by AND to filter the query
             * @param {function} returner Callback to be executed to return the field in the record
             * @param {function} atNotfound Action to be executed in case record not found
             * @param {function} atError Action to be executed when an error is raised by the operation
             */
            this.getFirstFieldBy = function(tableName, fieldName, conditions, returner, atNotfound, atError) {
                var N = self.Notifier,
                    B = self.Behaviour;

                var query;

                if (conditions !== "") {
                    query = "SELECT " + fieldName + " FROM " + tableName + " WHERE " + conditions;
                } else {
                    query = "SELECT " + fieldName + " FROM " + tableName;
                }

                selfDatabase.query(query, [], function (transaction, results) {
                    if (results.rows.length > 0) {
                        var item = results.rows.item(0);
                        var val = item[fieldName];
                        returner(val);
                    } else {
                        B.exe(atNotfound);
                    }
                }, function (error) {
                    N.error("TitanJS: Error trying to bring the field of the record from the table");
                    B.exe(atError, error);
                });

            };

            /**
             * Retrieve and return the count value of the specified of all the recorda found by looking
             * in the table specified and given the specified conditions to filter
             * @public
             * @async
             * @method
             * @param {String} tableName The name of the table to query
             * @param {String} fieldName The name of the column to retrieve its count field value and return it
             * @param {String} conditions Series of conditions separated by AND to filter the query
             * @param {function(*)} returner Callback to be executed to return the count field in the record
             * @param {function(SQLError)=} atError Action to be executed when an error is raised by the operation
             * @error
             */
            this.getCountFieldBy = function (tableName, fieldName, conditions, returner, atError) {
                var B = self.Behaviour,
                    N = self.Notifier;

                var query;

                if (conditions !== "") {
                    query = "SELECT COUNT(" + fieldName + ") FROM " + tableName + " WHERE " + conditions;
                } else {
                    query = "SELECT COUNT(" + fieldName + ") FROM " + tableName;
                }

                selfDatabase.query(query, [], function (transaction, results) {
                    var item = results.rows.item(0);
                    var val = item["COUNT(" + fieldName + ")"];
                    returner(val);
                }, function(error) {
                    N.error("TitanJS: Error trying to retrieve {{tablename}} amount", { tablename: tableName });
                    B.exe(atError, error);
                });
            };

            this.count = this.getCountFieldBy;

            /**
             * Elimina todos los registros que cumplan con la condicion que la columna con el
             * nombre especificado sea igual al valor especificado.
             * @public
             * @async
             * @method
             * @param {!String} tableName El nombre de la tabla
             * @param {?String} fieldkey El nombre de la columna a asociar
             * @param {String} id El valor a buscar
             * @param {function()=} atSuccess Accion que se ejecuta cuando se eliminan con exito
             * @param {function(SQLError)=} atError Accion que se ejecuta cuando sucede un error
             * @error
             */
            this.deleteBy = function(tableName, fieldkey, id, atSuccess, atError) {
                var N = self.Notifier,
                    B = self.Behaviour;

                var query = "DELETE FROM " + tableName + " WHERE " + fieldkey + " = '" + id + "'";
                //noinspection JSUnusedLocalSymbols
                selfDatabase.query(query, [], function(transaction, results) {
                    B.exe(atSuccess);
                }, function (error) {
                    N.error("TitanJS: Error trying to bring the record from the table");
                    B.exe(atError);
                });
            };

            /**
             * Delete all the records in the table where their `id` field are the specified
             * @public
             * @async
             * @method
             * @param {!String} tableName El nombre de la tabla
             * @param {String} id El valor a buscar como ID
             * @param {function()=} atSuccess Accion que se ejecuta cuando se eliminan con exito
             * @param {function(SQLError)} atError Accion que se ejecuta cuando sucede un error
             */
            this.delete = function (tableName, id, atSuccess, atError) {
                selfDatabase.deleteBy(tableName, 'ID', id, atSuccess, atError);
            };

            /**
             * Delete all the records in the table where the conditions are accomplished
             * @public
             * @async
             * @method
             * @param tablename
             * @param where
             * @param atSuccess
             * @param atError
             */
            this.deleteWhere = function(tablename, where, atSuccess, atError) {
                var query = "DELETE FROM " + tablename + " WHERE " + where;
                //noinspection JSUnusedLocalSymbols
                this.query(query, [], function (transaction, results) {
                    self.Behaviour.exe(atSuccess);
                }, function (error) {
                    self.Debug.error('TitanJS: Error trying to delete the record from the table');
                    self.Debug.error('Reason: ' + error.code);
                    self.Behaviour.exe(atError, error);
                });
            };

            /**
             * @public
             * @async
             * @method
             * @param {String} tablename
             * @param {Object} jsonRecord
             * @param {function(SQLTransaction)} atSuccess
             * @param {function(Error)} atError
             * @param {SQLTransaction=} transact
             */
            this.insertInto = function(tablename, jsonRecord, atSuccess, atError, transact) {
                var query = "INSERT INTO " + tablename + " ",
                    fieldNames = [],
                    values = [];

                for (var key in jsonRecord) {
                    if (jsonRecord.hasOwnProperty(key)) {
                        var val = jsonRecord[key];
                        if (typeof (val) !== 'undefined') {
                            fieldNames.push('`' + key + '`');
                            values.push('"' + val + '"');
                        }
                    }
                }

                var fieldNamesString = "(" + fieldNames.join(", ") + ")";
                var valuesString = "(" + values.join(", ") + ")";
                query += fieldNamesString + " VALUES " + valuesString;

                selfDatabase.query(query, [], function (transaction) {
                    self.Behaviour.exe(atSuccess, transaction);
                }, function(error) {
                    self.Notifier.report("Error trying to insert record", 'Titan.Database.insertInto', error, atError);
                }, transact);
            };

            /**
             * @public
             * @async
             * @method
             * @param {String} tablename
             * @param {Array.<Object>} jsonRecords
             * @param {Function} atSuccess
             * @param {function(Titan.Error.Crash)} atError
             * @param {SQLTransaction=} transact
             */
            this.insertsInto = function(tablename, jsonRecords, atSuccess, atError, transact) {
                self.Behaviour.recursiveAsyncLoop(jsonRecords, function(jsonRecord, goon, exit) {
                    selfDatabase.insertInto(tablename, jsonRecord, function(transaction) {
                        goon(transaction);
                    }, function(error) {
                        exit();
                    }, transact);
                }, function() {
                    atSuccess();
                }, function() {
                    atError();
                });
            };

            /**
             * @public
             * @async
             * @method
             * @param {String} tablename Table where to be updated the records
             * @param {Object} jsonRecord Key-value pairs object specifying Column-newValues to update
             * @param {String} conditions Conditions to be accomplished by records to be updated
             * @param {function()} atSuccess To execute when operation success
             * @param {function(Titan.Error.Crash)} atError To execute when operation fails
             * @param {SQLTransaction=} transact Transaction object to keep working on it
             * @error TDB201: Failed while trying to update
             */
            this.updateWhere = function(tablename, jsonRecord, conditions, atSuccess, atError, transact) {
                var N = self.Notifier,
                    B = self.Behaviour;

                var query = "UPDATE " + tablename + " SET ";
                var pairs = [];

                for (var key in jsonRecord) {
                    if (jsonRecord.hasOwnProperty(key)) {
                        var val = jsonRecord[key];
                        pairs.push('`' + key + '`=' + '"' + val + '"');
                    }
                }

                var pairsString = pairs.join(", ");
                query += pairsString + " WHERE " + conditions;

                //noinspection JSUnusedLocalSymbols
                selfDatabase.query(query, [], function (transaction, resultset) {
                    B.exe(atSuccess, transaction);
                }, function(error) {
                    N.error("StackTrace TDB201 - Failed while trying to update");
                    B.exe(atError, error);
                }, transact);
            };

            /**
             * Vacia la tabla con el nombre dado como parametro dejandola con cero registros
             * cantidadDisponible para llenar desde cero.
             * @public
             * @async
             * @method
             * @param {String=} tablename El nombre de la tabla a vaciar
             * @param {function=} atExito Accion a ejecutar si el borrado total tiene exito
             * @param {function=} atError Accion a ejecutar si el borrado total fracasa
             */
            this.empty = function (tablename, atExito, atError) {
                var query = "DELETE FROM " + tablename;
                this.query(query, [], atExito, atError);
            };

            /**
             * @backward
             * @deprecated
             */
            this.isSet = self.Data.isSet;

            /**
             * @backward
             * @deprecated
             */
            this.read = self.Data.read;

            /**
             * @backward
             * @deprecated
             */
            this.write = self.Data.write;

            /**
             * @backward
             * @deprecated
             */
            this.erase = self.Data.erase;

            /**
             * @private
             * @param tablename
             * @constructor
             */
            var AutoIncrementer = function(tablename) {
                var tn = tablename,
                    gotten = false;

                //noinspection JSUnusedGlobalSymbols
                this.getId = function() {
                    var regName = tn + "_next_id",
                        data = self.Data;

                    if (data.isSet(regName)) {
                        gotten = true;
                        return data.read(regName);
                    } else {
                        data.write(regName, "1");
                        gotten = true;
                        return 1;
                    }
                };

                //noinspection JSUnusedGlobalSymbols
                this.advance = function() {
                    var regName = tablename + "_next_id",
                        data = self.Data;

                    if (gotten) {
                        var current = self.Utils.safeNumberize(data.read(regName));
                        ++current;
                        data.write(regName, current);
                    } else {
                        throw "TitanJS: The autoincrementer hasn't retrieved an id yet";
                    }
                };
            };

            //noinspection JSUnusedGlobalSymbols
            this.getAutoincrementFor = function(tablename) {
                return new AutoIncrementer(tablename);
            };

            /**
             *
             * @param tablename
             * @param {Array.<Object || String>=} schema
             * @constructor
             */
            this.Table = function(tablename, schema) {
                if (_.isUndefined(tablename)) {
                    (new self.Error.Crash("No tablename has been specified for query constructor", "Titan.Database.Table")).crash();
                }

                var me = this;

                /**
                 * The name of the table to construct query
                 * @type {!String}
                 */
                this.name = tablename;

                /**
                 * The columns schema of the table to create
                 * @type {Array}
                 */
                this.schema = schema || [];

                /**
                 *
                 */
                this.create = function(transaction, atSuccess, atError) {
                    selfDatabase.createTable({
                        name: me.name,
                        columns: me.schema
                    }, transaction, atSuccess, function(error) {
                        self.Notifier.report("Error trying to create table {{nombre}}",
                            "Titan.Database.Table.create", error, atError, { nombre: me.name });
                    });
                };

                /**
                 * The conditions
                 * @type {string}
                 */
                this.conditions = "";

                /**
                 *
                 * @param conditions
                 * @returns {Titan.Database.Table}
                 */
                this.where = function(conditions) {
                    me.conditions = conditions;
                    return me;
                };

                /**
                 * Returns asynchronously one by one each one of the results retrieved given
                 * the parameters specified.
                 * @param ateach
                 * @param atfinish
                 * @param atnotfound
                 * @param aterror
                 */
                this.retrieve = function(ateach, atfinish, atnotfound, aterror) {
                    selfDatabase.listTable(me.name, me.conditions, ateach, atfinish, aterror, atnotfound);
                };

                /**
                 * Returns asynchronously one by one each one of the results retrieved given
                 * the parameters specified.
                 * @param returner
                 * @param atnotfound
                 * @param aterror
                 */
                this.list = function(returner, atnotfound, aterror) {
                    var results = [];
                    selfDatabase.listTable(me.name, me.conditions, function(record) {
                        results.push(record);
                    }, function() {
                        returner(results);
                    }, aterror, atnotfound);
                };

                /**
                 * Returns asynchronously the first record found given the parameters specified
                 * @param {function(Object)} returner
                 * @param {Function} notfound
                 * @param {function(Titan.Error.Crash)} aterror
                 * @param {function(Object)} constructor
                 */
                this.first = function(returner, notfound, aterror, constructor) {
                    selfDatabase.getFirstBy(me.name, me.conditions, function(record) {
                        if (!_.isUndefined(constructor)) {
                            record = new constructor(record);
                        }
                        returner(record);
                    }, notfound, function(error) {
                        self.Notifier.report("An error has ocurred while trying to retrieve first record with the parameters specified", "Titan.Database.Table.first", error, aterror);
                    });
                };

                /**
                 *
                 * @param {function(boolean)} answerer
                 * @param {function(Titan.Error.Crash | Error)} aterror
                 */
                this.hasResults = function(answerer, aterror) {
                    selfDatabase.getCountFieldBy(me.name, "*", me.conditions, function(answer) {
                        answerer(answer > 0);
                    }, function(error) {
                        var crash = new self.Error.Crash("An error has ocurred while trying to verify quantity of records given the paameters", "Titan.Database.Table.hasResults", error);
                        crash.report();
                        aterror(error);
                    });
                };

                /**
                 *
                 * @param {function(number)} answerer
                 * @param {function(Titan.Error.Crash | Error)} aterror
                 */
                this.count = function(answerer, aterror) {
                    selfDatabase.getCountFieldBy(me.name, "*", me.conditions, function(answer) {
                        answerer(answer);
                    }, function(error) {
                        var crash = new self.Error.Crash("An error has ocurred while trying to verify quantity of records given the paameters", "Titan.Database.Table.count", error);
                        crash.report();
                        aterror(error);
                    });
                };

                /**
                 * Insert the record to the table
                 * @param {Object} object
                 * @param {Function} atfinish
                 * @param {function(Error)} aterror
                 * @param {SQLTransaction=} transact
                 */
                this.insert = function(object, atfinish, aterror, transact) {
                    selfDatabase.insertInto(me.name, object, atfinish, aterror, transact);
                };

                /**
                 * Update the record in the table given the conditions specified
                 * @param {Object} object
                 * @param {String} conditions
                 * @param {Function} atfinish
                 * @param {function(Titan.Error.Crash)} aterror
                 * @param {SQLTransaction=} transact
                 */
                this.update = function(object, conditions, atfinish, aterror, transact) {
                    selfDatabase.updateWhere(me.name, object, conditions, atfinish, aterror, transact);
                };

                //noinspection JSUnusedGlobalSymbols
                this.delete = function(conditions, atfinish, aterror) {
                    selfDatabase.deleteWhere(me.name, conditions, atfinish, aterror);
                };

            };

            return selfDatabase;

        })();

        //noinspection JSUnusedGlobalSymbols
        /**
         * @backward
         * @deprecated
         */
        this.localData = this.Database;

        /**
         * @public
         * @module
         */
        this.Debug = new (function() {
            var selfDebug = this;

            this.Kind = {
                /**
                 * Constante que define una notificacion informativa
                 * @public
                 * @constant
                 */
                INFO: "Information Notification",

                /**
                 * Constante que define una notificacion de error
                 * @public
                 * @constant
                 */
                ERROR: "Error Notification",

                /**
                 * Constante que define una notificacion de advertencia
                 * @public
                 * @constant
                 */
                WARNING: "Warning Notification",

                /**
                 * Constante que define una notificacion de alerta
                 * @public
                 * @constant
                 */
                ALERT: "Alert Notification",

                /**
                 * Constante que defina una notificacion de progreso
                 * @public
                 * @constant
                 */
                PROGRESS: "Progress Notification",

                /**
                 * Constante que define una notificacion de actualizacion de estado de progreso
                 * @public
                 * @constant
                 */
                NOTIFY_PROGRESS: "Notify Progress Notification",

                /**
                 * Constante que define una notificacion de cierre de progreso
                 * @public
                 * @constant
                 */
                END_PROGRESS: "End Progress Notification"
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.KIND_INFO = selfDebug.Kind.INFO;

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.KIND_ERROR = selfDebug.Kind.ERROR;

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.KIND_WARNING = selfDebug.Kind.WARNING;

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.KIND_ALERT = selfDebug.Kind.ALERT;

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.KIND_PROGRESS = selfDebug.Kind.PROGRESS;

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.KIND_CLOSE_PROGRESS = selfDebug.Kind.END_PROGRESS;

            /**
             * Variable que determina el Logger propio que se maneja para la aplicacion
             * @private
             * @method
             * @param {String} t El texto a mostrar
             * @param {String}  k El tipo de notificacion a mostrar
             */
            var defaultOwnNotifier = function(t, k) {};

            /**
             * Variable que determina el Logger propio que se maneja para la aplicacion
             * @private
             * @method
             * @param {String} t El texto a mostrar
             * @param {String} k El tipo de notificacion a mostrar
             * @type {function(String, String)}
             */
            var ownNotifier = function(t, k) {};

            /**
             * @private
             * @method
             * @returns {boolean}
             */
            var notifierIsDefined = function() {
                return typeof (ownNotifier) === "function" &&
                    ownNotifier !== defaultOwnNotifier;
            };

            /**
             * Permite establecer el metodo propio para registrar eventos
             * @public
             * @method
             * @param {function(String, String)} notifier El metodo para registrar eventos
             */
            this.setNotifier = function (notifier) {
                if (!_.isUndefined(notifier)) {
                    if (typeof (notifier) === "function") {
                        ownNotifier = notifier;
                    } else {
                        throw "TitanJS: The parameter to become the notifier IS NOT a function.";
                    }
                } else {
                    throw "TitanJS: No parameter has been passed to become the notifier.";
                }
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.setOwnLogger = this.setNotifier;

            /**
             * Permite mostrar un mensaje emergente
             * @public
             * @method
             * @param {string} text The text to show in the alert dialog
             * @param {Object=} map The map to interpolate to string {text}
             */
            this.alert = function (text, map) {
                if (!_.isUndefined(map)) {
                    text = _.template(text, map, {
                        interpolate: /\{\{(.+?)\}\}/g
                    });
                }
                selfDebug.log("TitanJS Alert: " + text);
                if (notifierIsDefined()) {
                    ownNotifier(text, selfDebug.Kind.ALERT);
                } else if (typeof (navigator) !== 'undefined') {
                    //noinspection JSUnresolvedVariable
                    navigator.notification.alert(text);
                } else {
                    alert(text);
                }
            };

            /**
             * @backward
             * @deprecated
             */
            this.popup = this.alert;

            /**
             * Permite mostrar un mensaje emergente de progreso
             * @public
             * @method
             * @param {string} text The text to show in the progress dialog
             * @param {Object=} map
             */
            this.progress = function(text, map) {
                if (!_.isUndefined(map)) {
                    text = _.template(text, map, {
                        interpolate: /\{\{(.+?)\}\}/g
                    });
                }
                selfDebug.log("TitanJS Start Progress: " + text);
                if (notifierIsDefined()) {
                    ownNotifier(text, selfDebug.Kind.PROGRESS);
                }
            };

            /**
             * Notify and changes the progress text but not order to show the progress dialog
             * @public
             * @method
             * @param {string} text the text to show in the progress dialog
             * @param {Object=} map
             */
            this.notifyProgress = function(text, map) {
                if (!_.isUndefined(map)) {
                    text = _.template(text, map, {
                        interpolate: /\{\{(.+?)\}\}/g
                    });
                }
                selfDebug.log("TitanJS Notify Progress: " + text);
                if (notifierIsDefined()) {
                    ownNotifier(text, selfDebug.Kind.NOTIFY_PROGRESS);
                }
            };

            /**
             * Hides and ends the progress of the process that started the waiting dialog.
             * @public
             * @method
             */
            this.endProgress = function () {
                selfDebug.log("TitanJS End Progress");
                if (notifierIsDefined()) {
                    ownNotifier(self.Utils.String.EMPTY, selfDebug.Kind.END_PROGRESS);
                }
            };

            /**
             * Permite registrar un evento informativo en el registro de eventos
             * @public
             * @method
             * @param {string} text El texto a registrar
             * @param {Object=} map
             */
            this.log = function (text, map) {
                if (!_.isUndefined(map)) {
                    text = _.template(text, map, {
                        interpolate: /\{\{(.+?)\}\}/g
                    });
                }
                console.log(text);
                if (notifierIsDefined()) {
                    ownNotifier(text, selfDebug.Kind.INFO);
                }
            };

            /**
             * Permite registrar un evento de error en el registro de eventos
             * @public
             * @method
             * @param {string} text El texto a registrar
             * @param {Object=} map
             */
            this.error = function (text, map) {
                if (!_.isUndefined(map)) {
                    text = _.template(text, map, {
                        interpolate: /\{\{(.+?)\}\}/g
                    });
                }
                console.error(text);
                if (notifierIsDefined()) {
                    ownNotifier(text, selfDebug.Kind.ERROR);
                }
            };

            /**
             * Permite reportar un error en el registro de eventos
             * @public
             * @method
             * @param {String} message El texto a registrar
             * @param {String} signature
             * @param {Error | Titan.Error.Crash} jserror
             * @param {Function=} after
             * @param {Object=} map
             */
            this.report = function(message, signature, jserror, after, map) {
                if (!_.isUndefined(map)) {
                    message = _.template(message, map, {
                        interpolate: /\{\{(.+?)\}\}/g
                    });
                }
                (new self.Error.Crash(message, signature, jserror)).report(after);
            };

            /**
             * @public
             * @async
             * @method
             * @param {string} title
             * @param {string} texto
             * @param {string} confirmButtonText
             * @param {string} cancelButtonText
             * @param {function(String)} resultCallback
             * @param {Function} atAborted
             */
            this.prompt = function (title, texto, confirmButtonText, cancelButtonText,
                                    resultCallback, atAborted) {

                if (typeof (navigator) !== 'undefined') {
                    //noinspection JSUnresolvedVariable
                    navigator.notification.prompt(texto, function (response) {
                        //noinspection JSUnresolvedVariable
                        var buttonIndex = response.buttonIndex;
                        if (buttonIndex === 1) {
                            //noinspection JSUnresolvedVariable
                            resultCallback(response.input1);
                        } else if (buttonIndex === 2) {
                            atAborted();
                        } else {
                            Titan.Debug.log("A non specified code was resolved");
                        }
                    }, title, [confirmButtonText, cancelButtonText], String());
                } else {
                    //noinspection JSUnresolvedFunction
                    var input1 = prompt(texto, "NULL");
                    if (input1 === "NULL") {
                        atAborted();
                    } else {
                        resultCallback(input1);
                    }
                }
            };

            /**
             * @public
             * @async
             * @method
             * @param {String} title
             * @param {String} text
             * @param {String} confirmButtonText
             * @param {String} abortButtonText
             * @param {function()} atConfirmed
             * @param {function()=} atAborted
             */
            this.binaryConfirm = function(title, text, confirmButtonText, abortButtonText,
                                          atConfirmed, atAborted) {

                if (typeof (navigator) !== 'undefined') {
                    //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                    navigator.notification.confirm(text, function(buttonIndex) {
                        if (buttonIndex === 1) {
                            atConfirmed();
                        } else if (buttonIndex === 2) {
                            Titan.Behaviour.exe(atAborted);
                        } else {
                            Titan.Debug.error('An unexpected and behavior-undefined index was detected');
                        }
                    }, title, [confirmButtonText, abortButtonText]);
                } else {
                    throw "TitanJS: Currently the binary confirm is just supported on top of Cordova, and Cordova couldn't be found";
                }
            };

            /**
             *
             * @param {String} title
             * @param {String} text
             * @param {Array.<String>} buttonLabels
             * @param {Object.<String, function()>} actions
             */
            this.optionsConfirm = function(title, text, buttonLabels, actions) {

                if (typeof (navigator) !== 'undefined') {
                    //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                    navigator.notification.confirm(text, function(buttonIndex) {
                        var indexAsString = buttonIndex.toString();
                        var action = actions[indexAsString];
                        if (!action) {
                            Titan.Debug.error('An unexpected and behavior-undefined index ' +
                                'was detected');
                        } else {
                            action();
                        }
                    }, title, buttonLabels);
                } else {
                    throw "TitanJS: Currently the options confirm is just supported on top of " +
                        "Cordova, and Cordova couldn't be found";
                }

            };

        })();

        /**
         * @backward
         * @deprecated
         */
        this.debug = this.Debug;

        this.Error = new (function() {
            var selfError = this;

            /**
             * @public
             * @method
             * @param {String} errorCode
             * @return {String}
             */
            this.identifyError = function(errorCode) {
                //noinspection JSUnresolvedVariable
                switch (errorCode) {
                    case FileTransferError.FILE_NOT_FOUND_ERR:
                        return "File not found";
                    case FileTransferError.INVALID_URL_ERR:
                        return "Invalid URL";
                    case FileTransferError.CONNECTION_ERR:
                        return "Connection Error";
                    case FileTransferError.ABORT_ERR:
                        return "Abort Error";
                    default:
                        return "No identified Error";
                }
            };

            /**
             * @public
             * @method
             * @param {String} message
             * @param {String=} signature
             * @param {Error=} jserror
             * @constructor
             */
            this.Crash = function(message, signature, jserror) {
                signature = signature || "UnknownSource";

                return {
                    message: message,
                    time: new Date(),
                    signature: signature,
                    error: jserror,
                    describe: function() {
                        return "TitanJS Error: " + this.signature + " has thrown an " +
                            "error at " + this.time.toLocaleTimeString() + " timestamp saying: " + this.message;
                    },
                    crash: function() {
                        throw new Error(this.describe());
                    },
                    report: function(after) {
                        self.Debug.error(this.describe());
                        if (!_.isUndefined(after) && !_.isNull(after)) {
                            var e = self.Utils.isDefined(this.error) ? this.error : this;
                            after(e);
                        }
                    }
                };
            };

            this.report = function(message, signature, jserror) {
                (new self.Error.Crash(message, signature, jserror)).report();
            };

            return selfError;
        })();

        /**
         * @public
         * @module
         */
        this.FileSystem = new (function() {
            var selfFileSystem = this;

            var filesystem = null;

            var directoryentry = null;

            //noinspection JSUnusedLocalSymbols
            var fileentry = null;

            /**
             * @public
             * @async
             * @method
             * @param {function()=} atFinish
             * @param {function()=} atError
             */
            this.open = function(atFinish, atError) {
                //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                    self.Notifier.log("TitanJS: FileSystem opened successfully");
                    filesystem = fs;
                    self.Behaviour.exe(atFinish);
                }, function(error) {
                    self.Notifier.report("TitanJS: Failed to get FileSystem",
                        'Titan.FileSystem.open', error, atError);
                });
            };

            /**
             * Determines whether the FileSystem is open or not evaluating if
             * the FileSystem symbol is NULL or not
             * @public
             * @method
             * @returns {boolean}
             */
            this.isOpen = function() {
                return filesystem !== null;
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @returns {FileSystem}
             */
            this.getFileSystem = function() {
                if (selfFileSystem.isOpen()) {
                    return filesystem;
                } else {
                    throw "The FileSystem hasn't been open yet. Execute Titan.FS.open to open it";
                }
            };

            /**
             * @public
             * @async
             * @method
             * @param {Array.<String>} possibleFilepaths
             * @param {function(String)} urlReturner
             * @param {Function} atNotFound
             * @param {function(Error || Titan.Error.Crash)} atError
             */
            this.tryToReachDataUrl = function(possibleFilepaths, urlReturner, atNotFound, atError) {
                var url = "",
                    signature = 'Titan.FileSystem.tryToReachDataUrl';

                if (selfFileSystem.isOpen()) {
                    self.Behaviour.recursiveAsyncLoop(possibleFilepaths, function(filepath, next, stop) {
                        self.Notifier.log("TitanJS: Trying to reach file '{{filepath}}'...", { filepath: filepath });
                        //noinspection JSUnresolvedFunction
                        filesystem.root.getFile(filepath, {}, function(fileentry) {
                            fileentry.file(function(file) {
                                self.Notifier.log("TitanJS: The File '{{filepath}}' was retrieved successfully", {filepath: filepath});
                                var reader = new FileReader();
                                reader.onload = function(evt) {
                                    self.Notifier.log("TitanJS: The DataURL File '{{filepath}}' was read successfully", {filepath: filepath});
                                    url = evt.target.result;
                                    urlReturner(url);
                                    stop();
                                };
                                reader.onerror = function(evt) {
                                    self.Notifier.report("TitanJS: Error trying to read Data Url from File '{{filepath}}'", signature, evt.target.error, null, { filepath: filepath });
                                    next();
                                };
                                reader.readAsDataURL(file);
                            }, function(error) {
                                self.Notifier.report("TitanJS: Error trying to get File from FileEntry '{{filepath}}'", signature, error, null, { filepath: filepath });
                                next();
                            })
                        }, function(error) {
                            self.Notifier.report("TitanJS: Error trying to reach FileEntry '{{filepath}}'", signature, error, null, { filepath: filepath });
                            next();
                        });
                    }, function() {
                        self.Notifier.report("TitanJS: None of the fileentries couldn't be reached", signature, null, null);
                    }, function() {
                        if (url === "") {
                            self.Notifier.report("TitanJS: None of the fileentries couldn't be reached", 'Titan.FileSystem.tryToReach', null, atError);
                        }
                    });
                } else {
                    throw "The FileSystem hasn't been open yet. Execute Titan.FS.open to open it";
                }
            };

            /**
             * @public
             * @method
             */
            this.close = function() {
                filesystem = null;
            };

            this.prepareDirectory = function (path, atFinish, atError) {
                //noinspection JSUnresolvedFunction
                filesystem.root.getDirectory(path, {
                    create: true,
                    exclusive: false
                }, function(d) {
                    directoryentry = d;
                    self.Behaviour.exe(atFinish);
                }, function(error) {
                    Titan.Debug.log('TitanJS: Impossible to get the directory: ' + error.code);
                    self.Behaviour.exe(atError);
                });
            };

            this.download = function (url, where, targetFilename, atFinish, atError) {
                selfFileSystem.prepareDirectory(where, function() {
                    //noinspection JSUnresolvedFunction
                    var ft = new FileTransfer();

                    ft.onprogress = function (prEvent) {
                        //noinspection JSUnresolvedVariable
                        if (prEvent.lengthComputable) {
                            //noinspection JSUnresolvedVariable
                            var perc = prEvent.loaded / prEvent.total;
                            var percentage = ((perc * 100) / 2);
                            self.Debug.log('Percentage: ' + percentage + '%');
                            self.Debug.progress('Download Progress: ' + percentage + '%');
                        } else {
                            self.Debug.log('Downloading...');
                        }
                    };

                    //var uri = encodeURI(url);
                    var filePath = where + "/" + targetFilename;

                    ft.download(url, filePath, function(entry) {
                        //noinspection JSUnresolvedVariable
                        self.Debug.log('File downloaded: ' + entry.fullPath);
                        self.Behaviour.exe(atFinish);
                    }, function (error) {
                        self.Debug.log('Error intentando descargar: ' + error.source);
                        self.Behaviour.exe(atError);
                    });
                }, function() {
                    self.Debug.error("The directory couldn't be loaded");
                });
            };

            return selfFileSystem;
        })();

        //noinspection JSUnusedGlobalSymbols
        /**
         * @backward
         * @deprecated
         */
        this.fs = this.FileSystem;

        /**
         * @public
         * @shortcut
         */
        this.FS = this.FileSystem;

        /**
         * In charge of managing the application deployment and first execution
         * @package com.instartius.titan.journey
         */
        this.Journey = new (function() {
            var selfJourney = this;

            /**
             * Manages the execution of the application and execute the start action once everything
             * is ready to deploy
             * @public
             * @async
             * @method
             * @param {function()} start Method that must be runned just after the launch of the app.
             */
            this.launch = function(start) {

                if (Titan.Platform.isNative()) {
                    //noinspection JSUnresolvedVariable
                    $(document).ready(function() {
                        start();
                    });

                } else {
                    //noinspection JSUnresolvedVariable
                    document.addEventListener('deviceready', function() {
                        //noinspection JSUnresolvedVariable
                        $(document).ready(function() {
                            start();
                        });
                    });
                }

            };

            /**
             * Stop and closes the process corresponding de app in the device
             * @public
             * @method
             */
            this.finish = function() {
                if (Titan.Platform.isNative()) {
                    if (Titan.Platform.is(Titan.Platform.IOS)) {
                        self.Notifier.log("TitanJS: Due to a Apple Store Policy, iOS apps " +
                            "shouldn't be able to close an application from itself.");
                    }
                    if (!_.isUndefined(navigator)) {
                        //noinspection JSUnresolvedVariable
                        navigator.device.exitApp();
                    }
                }
            };

            //noinspection JSUnusedAssignment
            return selfJourney;
        })();

        /**
         * @backward
         * @deprecated
         */
        this.journey = this.Journey;

        //noinspection JSUnusedGlobalSymbols
        this.Measurings = new (function() {
            var selfMeasurings = this;

            //noinspection JSUnusedGlobalSymbols
            /**
             * Compares and returns wheter a string begins with the specified start or not
             * @public
             * @method
             * @param {String} stringValue
             * @param {String} startValue
             */
            this.stringStartsWith = function(stringValue, startValue) {
                return stringValue.indexOf(startValue) === 0;
            };

            return selfMeasurings;
        })();

        //noinspection JSUnusedGlobalSymbols
        this.Models = new (function() {
            //noinspection JSUnusedLocalSymbols
            var selfModels = this;

            var models = [];

            this.register = function(model) {
                models.push(model);
            };

        })();

        /**
         * @shortcut
         */
        this.Notifier = this.Debug;

        /**
         * Administrador que permite manipular y establecer en que plataforma se esta ejecutando
         * actualmente la aplicacion para asi mismo tener control sobre los distintos dispositivos
         * y APIs a aprovechar
         */
        this.Platform = new (function() {
            var selfPlatform = this;

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.NONE = 'Non-specified';

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.WEBKIT = 'Webkit';

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.NATIVE = 'Native';

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.IOS = 'iOS';

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.ANDROID = 'Android';

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.WINDOWS = 'Windows RT';

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.WINDOWS_PHONE = 'Windows Phone';

            /**
             * @public
             * @constant
             * @type {string}
             */
            this.FIREFOX = 'FireFox OS';

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @constant
             * @type {string}
             * @backward
             * @deprecated
             */
            this.PLATFORM_WEBKIT = this.WEBKIT;

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @constant
             * @type {string}
             * @backward
             * @deprecated
             */
            this.PLATFORM_NATIVE = this.NATIVE;

            /**
             * @private
             * @field
             * @type {string}
             */
            var current = this.NONE;

            /**
             * @public
             * @method
             * @type {Function(string)}
             * @param {string} platform The platform to define for the app
             */
            this.set = function(platform) {
                if (typeof (platform) !== 'undefined') {
                    var isValid = true;
                    isValid += platform === selfPlatform.ANDROID ||
                        platform === selfPlatform.FIREFOX ||
                        platform === selfPlatform.IOS ||
                        platform === selfPlatform.WINDOWS ||
                        platform === selfPlatform.NATIVE ||
                        platform === selfPlatform.NONE ||
                        platform === selfPlatform.WEBKIT ||
                        platform === selfPlatform.WINDOWS_PHONE;

                    if (isValid) {
                        current = platform;
                    } else {
                        throw "TitanJS: The platform specified is not a valid recognized " +
                            "platform. Please use the corresponding Titan.Platform enumeration " +
                            "to specify it.";
                    }

                }
            };

            /**
             * @public
             * @method
             * @returns {string}
             */
            this.get = function() {
                return current;
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @type {Function(string)}
             * @param {string} platform The platform to define for the app
             * @backward
             * @deprecated
             */
            this.setPlatform = this.set;

            /**
             * Determina si la plataforma actual es nativa o no
             * @returns {boolean}
             * @public
             */
            this.isNative = function () {
                return current === selfPlatform.NATIVE;
            };

            /**
             * @public
             * @method
             * @param {string} platform
             * @returns {boolean}
             */
            this.is = function(platform) {
                if (typeof (platform) !== 'undefined') {
                    var isValid = true;
                    isValid += platform === selfPlatform.ANDROID || selfPlatform.FIREFOX ||
                        selfPlatform.IOS || selfPlatform.WINDOWS ||
                        selfPlatform.NATIVE || selfPlatform.NONE ||
                        selfPlatform.WEBKIT ||
                        selfPlatform.WINDOWS_PHONE;

                    if (isValid) {
                        return current === platform;
                    } else {
                        throw "TitanJS: The platform trying to verify to be the app's platform" +
                            " is not a valid platform. Please use the corresponding Titan.Platform" +
                            " enumeration to specify it.";
                    }
                } else {
                    throw "TitanJS: No platform has been specified to verify with.";
                }
            };

            return selfPlatform;

        })();

        /**
         * @public
         * @module
         */
        this.Proxy = new (function() {
            var selfProxy = this;

            var proxyUrl = "";

            var uploadUrls = {};

            var restUrls = {};

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {String} url
             */
            this.setProxyUrl = function(url) {
                if (!_.isUndefined(url)) {
                    if (url !== self.Utils.String.EMPTY) {
                        proxyUrl = url;
                    } else {
                        self.Debug.error("The Proxy URL hasn't been assigned due to it's an empty string");
                    }
                } else {
                    throw "TitanJS: No parameter has been passed to become the global Proxy URL";
                }
            };

            /**
             * @public
             * @method
             * @param {String} alias
             * @param {String} url
             */
            this.addUploadUrl = function(alias, url) {
                if (!_.isUndefined(alias) && !_.isUndefined(url)) {
                    if (alias !== self.Utils.String.EMPTY && url !== self.Utils.String.EMPTY) {
                        if (typeof (uploadUrls[alias]) === "undefined") {
                            uploadUrls[alias] = url;
                            self.Debug.log("The upload URL was setted");
                        }
                    } else {
                        throw "TitanJS: Either alias or url parameters are invalid empty strings";
                    }
                } else {
                    throw "TitanJS: Either alias or url parameters hasn't been passed";
                }
            };

            /**
             * @public
             * @method
             * @param {String} alias
             */
            this.getUploadUrl = function(alias) {
                return encodeURI(uploadUrls[alias]);
            };

            /**
             * @public
             * @method
             * @param {String} alias
             * @param {String} url
             */
            this.addRestUrl = function(alias, url) {
                if (!_.isUndefined(alias) && !_.isUndefined(url)) {
                    if (alias !== "" && url !== "") {
                        if (!(alias in restUrls)) {
                            restUrls[alias] = url;
                            self.Debug.log("The Rest URL was setted");
                        }
                    } else {
                        throw "TitanJS: Either alias or url parameters are invalid empty strings";
                    }
                } else {
                    throw "TitanJS: Either alias or url parameter hasn't been passed";
                }
            };

            /**
             * @public
             * @method
             * @param {String} alias
             * @returns {*}
             */
            this.getRestUrl = function(alias) {
                return encodeURI(restUrls[alias]);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             *
             * @param alias
             * @returns {string}
             */
            this.getRestRoute = function(alias) {
                var url = restUrls[alias],
                    route = "";
                for (var i = 1; i < arguments.length; i++) {
                    route += "/" + arguments[i];
                }
                return encodeURI(url + route);
            };

            /**
             * Descarga y ejecuta/procesa un Script SQL desde la uri dada como parametro
             * @public
             * @async
             * @method
             * @param uri {String} URI Accesor del SQL Script. El SQL Script debe ser una consulta INSERT
             * @param atFinalizar {function} Accion a ejecutar cuando la consulta se procesa con exito
             * @param atError {function} Accion a ejecutar cuando se presenta un problema intentando descargar el Script
             * @param atProblem {function} Accion a ejecutar cuando se presenta un problema intentando procesar el Script
             */
            this.processRemoteInsertSql = function (uri, atFinalizar, atError, atProblem) {
                self.Debug.log('TitanJS: Trying to download SQL script from ' + uri + '...');
                jQuery.get(uri, function (data) {
                    self.Debug.log('TitanJS: SQL Script downloaded successfully from ' + uri + '...');
                    self.Database.queryBatch(data, function () {
                        Titan.Debug.log('TitanJS: Script was processed successfully');
                        if (data !== "") {
                            self.Behaviour.exe(atFinalizar);
                        } else {
                            self.Behaviour.exe(atProblem, "Empty query downloaded");
                        }
                    }, function (processActionError) {
                        self.Debug.error('TitanJS: Table processed unsuccessfully');
                        self.Debug.error(processActionError);
                        self.Behaviour.exe(atProblem, processActionError);
                    });
                }).fail(function (downloadActionError) {
                        self.Debug.error('TitanJS: SQL Script was downloaded unsuccessfully');
                        self.Behaviour.exe(atError, downloadActionError);
                    });
            };

            /**
             * Download the content response from the url specified
             * @public
             * @async
             * @method
             * @param {string} url The url to request
             * @param {function(string)} atResponse To be executed when response
             * @param {Function} atFail To be executed when fail
             * @param {Function} atOffline To be executed when offline
             */
            this.pull = function(url, atResponse, atFail, atOffline) {
                self.Notifier.log("TitanJS: Requesting '" + url + "'...");
                if (self.Utils.isOnline()) {
                    if (!_.isUndefined(jQuery)) {
                        jQuery.get(url).done(function(data) {
                            self.Behaviour.exe(atResponse, data);
                        }).fail(function(error) {
                                self.Behaviour.exe(atFail, error);
                            });
                    } else {
                        throw "jQuery hasn't been included";
                    }
                } else {
                    self.Behaviour.exe(atOffline);
                }
            };

            /**
             * @public
             * @async
             * @method
             * @param {String} url URL to post to
             * @param {Object} jsonData Data parameters to post
             * @param {function(?)} atResponse To execute when pushing task is responsed successfully
             * @param {function(Titan.Error.Crash)} atFail To execute when pushing task fails
             * @param {Function} atOffline To execute when no Internet connection detected by OS
             * @error P101: When the request fails
             */
            this.push = function(url, jsonData, atResponse, atFail, atOffline) {
                var B = self.Behaviour,
                    U = self.Utils,
                    N = self.Notifier;

                if (U.isOnline()) {
                    jsonData = jsonData || {};

                    var promise = $.post(encodeURI(url), { 'data': jsonData }, function(responseData) {
                        B.exe(atResponse, responseData);
                    });

                    promise.fail(function() {
                        N.report("Error P101: POST request has failed", 'Titan.Proxy.push', null, atFail);
                    });
                } else {
                    B.exe(atOffline);
                }
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.pushData = this.push;

            //noinspection JSUnusedGlobalSymbols
            /**
             * Envia los datos por POST a la URL especificada, llevando el registro con el ID
             * especificado en la tabla especificada.
             * @public
             * @async
             * @method
             * @param {!String} url La direccion a la cual se va a enviar el registro
             * @param {String} tablename El nombre de la tabla de la cual se va a obtener el registro
             * @param {String} id El ID que tiene el registro que estamos buscando
             * @param {function()=} atResponse Accion a ejecutar con el response devuelto por el servidor
             * @param {function()=} atError Accion a ejecutar cuando se presente un error en el request
             * @param {function()=} atOffline Accion a ejecutar cuando se detecta que se ha perdido la
             * conexion a Internet
             */
            this.pushRecord = function(url, tablename, id, atResponse, atError, atOffline) {
                self.Database.retrieve(tablename, id, function(record) {
                    self.Notifier.log("Se pretende enviar " + record);
                    selfProxy.push(url, record, atResponse, atError, atOffline);
                }, function() {
                    self.Notifier.log("TitanJS: No record has been found to push to the server in" +
                        " the table '" + tablename + "' with ID = '" + id + "'");
                    self.Behaviour.exe(atError);
                }, function() {
                    self.Notifier.log("TitanJS: A problem has occured while trying to get record from" +
                        " the table '" + tablename + "' with ID = '" + id + "'");
                    self.Behaviour.exe(atError);
                });
            };

            /**
             * @public
             * @async
             * @method
             * @param {String} aliasUrl The alias of the Upload URL saved previously
             * @param {String} filePath The local filepath to the file
             * @param {String} filename The name to save the file on the server
             * @param {String} mimetype The mimetype of the file to transfer
             * @param {function()} atResponse The action to be executed after transfer success
             * @param {function()} atError The action to be executed at any error in transfer
             */
            this.pushFile = function(aliasUrl, filePath, filename, mimetype, atResponse, atError) {
                //noinspection UnnecessaryLocalVariableJS
                var s = self,
                    p = self.Proxy,
                    d = self.Debug;
                if (s.isCordovaPresent()) {
                    //noinspection JSUnresolvedFunction
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    options.fileName = filename;
                    options.mimeType = mimetype;
                    d.log(options);
                    var url = p.getUploadUrl(aliasUrl);
                    //noinspection JSUnresolvedFunction
                    var ft = new FileTransfer();
                    d.log("Trying to upload file " + options.fileName);
                    ft.upload(filePath, url, function(ftr) {
                        d.log("TitanJS: '" + options.fileName +
                            "' file uploaded successfully. Results: ");
                        //noinspection JSUnresolvedVariable
                        d.log("bytesSent: " + ftr.bytesSent);
                        //noinspection JSUnresolvedVariable
                        d.log("responseCode: " + ftr.responseCode);
                        d.log("response: " + ftr.response);
                        s.Behaviour.exe(atResponse);
                    }, function(fte) {
                        d.error("TitanJS: Error sending file. " + fte.code +
                            ": " + s.Error.identifyError(fte.code));
                        s.Behaviour.exe(atError);
                    }, options);
                } else {
                    throw "TitanJS: Cordova Dependency Library hasn't been included";
                }
            };

            /**
             * @public
             * @shortcut
             */
            this.upload = this.pushFile;

            return selfProxy;
        })();

        this.Tests = new (function() {
            //noinspection JSUnusedLocalSymbols
            var selfTests = this;

            this.equal = function(description, given, expected) {
                Titan.Notifier.log((given === expected) + ": " + description);
            };

            //noinspection JSUnresolvedVariable
            if (chai) {
                //noinspection JSUnresolvedVariable
                this.assert = chai.assert;
                //noinspection JSUnresolvedVariable
                this.expect = chai.expect;
                //noinspection JSUnresolvedVariable
                this.should = chai.should;
            }

        })();

        /**
         * @public
         * @module
         * @alias RS
         */
        this.Resources = new (function() {
            var strings   = {},
                templates = {},
                queries   = {},
                urls      = {},
                routes    = {},
                interpolateTemplateOverride = {
                    interpolate: /\{\{(.+?)\}\}/g
                },
                interpolateQueryOverride = {
                    interpolate: /\$(.+?)\b/g
                };

            /**
             *
             * @param {String} key
             * @returns {*}
             */
            this.string = function(key) {
                return strings[key];
            };

            /**
             *
             * @param {String} key
             * @param {String} bag
             * @returns {*}
             */
            this.compile = function(key, bag) {
                if (templates.hasOwnProperty(key)) {
                    return _.template(templates[key], bag, interpolateTemplateOverride);
                } else {
                    throw new Error("TitanJS: '" + key + "' template resource is not defined");
                }
            };

            /**
             *
             * @param {String} key
             * @param {Object} bag
             * @returns {*}
             */
            this.sql = function(key, bag) {
                if (queries.hasOwnProperty(key)) {
                    return _.template(queries[key], bag, interpolateQueryOverride);
                } else {
                    throw new Error("TitanJS: '" + key + "' query resource is not defined");
                }
            };

            /**
             *
             * @param {String} key
             * @returns {*}
             */
            this.url = function(key) {
                return urls[key];
            };

            /**
             * @public
             * @method
             * @param {String} key
             * @returns {string}
             */
            this.route = function(key) {
                return "/" + (routes[key]).join("/");
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {String} key
             * @returns {string}
             */
            this.completeRoute = function(key) {
                return urls['BASE'] + "/" + (routes[key]).join("/");
            };

            /**
             * @public
             * @method
             * @param {Object} resobj
             */
            this.addStrings = function(resobj) {
                strings = _.extend(strings, resobj);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {Object} resobj
             */
            this.addTemplates = function(resobj) {
                templates = _.extend(templates, resobj);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {Object} resobj
             * @warning NOT TO USE OR COMPILE HTML STRINGS
             */
            this.addQueries = function(resobj) {
                queries = _.extend(queries, resobj);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {String} url
             */
            this.setBaseUrl = function(url) {
                urls = _.extend(urls, { 'BASE': url });
            };

            /**
             * @public
             * @method
             * @param {Object} resobj
             */
            this.addUrls = function(resobj) {
                urls = _.extend(urls, resobj);
            };

            /**
             * @public
             * @method
             * @param {Object} resobj
             */
            this.addRoutes = function(resobj) {
                routes = _.extend(routes, resobj);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @param {String} name
             * @param {Array} route
             */
            this.addRoute = function(name, route) {
                routes = _.extend(routes, { name: route });
            };

        });

        this.Session = new (function() {
            var selfSession = this;

            var sessionKinds = [];

            this.addSessionKind = function(key, name) {
                sessionKinds.push({
                    key: key,
                    name: name
                });
            };

            this.addSessionKind("user", "User");

            /**
             * @public
             * @method
             * @param {String} sessionKindKey
             * @param {String} usercode
             * @param {String} userFullname
             * @param {Object=} properties
             */
            this.login = function(sessionKindKey, usercode, userFullname, properties) {
                var user = {
                    usercode: usercode,
                    userFullname: userFullname,
                    properties: properties,
                    startedAt: (new Date()).getTime(),
                    get: function(field) {
                        return this.properties[field];
                    }
                };
                self.Data.write(sessionKindKey, self.Utils.stringify(user));
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param sessionKindKey
             */
            this.logout = function(sessionKindKey) {
                if (selfSession.isProfileLogged(sessionKindKey)) {
                    self.Data.erase(sessionKindKey);
                }
            };

            /**
             * @public
             * @method
             * @param {String} sessionKind
             * @returns {{usercode: String, userFullname: String, properties: Object, startedAt: number, get: function(String)}}
             */
            this.getLoggedAs = function(sessionKind) {
                return self.Utils.jsonify(self.Data.read(sessionKind));
            };

            /**
             * @public
             * @shortcut
             * @type {Function}
             */
            this.logged = this.getLoggedAs;

            /**
             * Checks whether an user profile is currently actively logged in or not
             * @param sessionKind
             * @returns {boolean|*}
             */
            this.isProfileLogged = function(sessionKind) {
                return self.Data.isSet(sessionKind);
            };

            return selfSession;
        })();

        this.Signals = new (function() {
            var selfSignals = this;

            //noinspection JSValidateJSDoc,JSUnusedGlobalSymbols
            /**
             * Return a new smoke signal gun so that can be attached and eventually be triggered
             * for it to execute its according action strategy
             * @public
             * @method
             * @returns {signals.Signal}
             */
            this.gun = function() {
                //noinspection JSUnresolvedVariable
                if (!_.isUndefined(signals)) {
                    //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                    return new signals.Signal();
                } else {
                    throw "Signals hasn't been included inside de JS libraries";
                }
            };

            //noinspection JSValidateJSDoc
            /**
             * Fires the signal gun triggering to event
             * @public
             * @method
             * @param {signals.Signal} gun
             * @param {Object=} signal The object with the params to be passed to the gun and its
             * corresponding action plan.
             */
            this.fire = function(gun, signal) {
                //noinspection JSUnresolvedFunction
                gun.dispatch(signal);
            };

            //noinspection JSValidateJSDoc,JSUnusedGlobalSymbols
            /**
             * Attach an action strategy to the gun and to all its possible signals
             * @public
             * @method
             * @param {signals.Signal} gun The gun to attach its signal
             * @param {function()} action Action strategy to be executed when the gun signal is fired
             */
            this.plan = function(gun, action) {
                //noinspection JSUnresolvedFunction
                gun.add(action);
            };

            return selfSignals;
        })();

        /**
         * @backward
         * @deprecated
         */
        this.signals = this.Signals;

        //noinspection JSUnusedGlobalSymbols
        this.Synchro = new (function() {
            //noinspection UnnecessaryLocalVariableJS
            var selfSynchro = this;

            return selfSynchro;
        })();

        this.Utils = new (function() {
            var selfUtils = this;

            this.String = {
                EMPTY: ""
            };

            /**
             * Convierte la cantidad en MB pasado como parametro en su equivalente en Bytes.
             * @public
             * @method
             * @param {number} mb La cantidad de MegaBytes
             * @returns {number}
             */
            this.convertMegaBytesToBytes = function (mb) {
                return mb * 1024 * 1024;
            };

            /**
             * Convierte el nombre de un recurso en su equivalente con extension .views
             * @public
             * @method
             * @param resourceName Nombre del recurso
             * @returns {string} Nombre del documento HTML accesible
             */
            this.htmlizeFileName = function (resourceName) {
                return resourceName + '.html';
            };

            /**
             * Format the number to a priced format number
             * @public
             * @method
             * @param {String || number} price
             * @returns {String}
             */
            this.pricify = function(price) {
                if (!_.isUndefined(accounting)) {
                    return accounting.formatMoney(price, "$", 2, ",", ".");
                } else {
                    throw "TitanJS: The accounting.js library hasn't been loaded";
                }
            };

            /**
             * Determina si el dispositivo esta conectado a Internet o no
             * @public
             * @method
             * @return {boolean} Valor especificando si el dispositivo esta Online o no.
             */
            this.isOnline = function () {
                if (typeof (navigator) !== 'undefined') {
                    if (typeof (navigator.connection) !== 'undefined') {
                        //noinspection JSUnresolvedVariable
                        var networkState = navigator.connection.type;
                        self.Debug.log("The connection has been detected as: " + networkState);
                        //noinspection JSUnresolvedVariable
                        return networkState === Connection.WIFI ||
                            networkState === Connection.CELL ||
                            networkState === Connection.CELL_2G ||
                            networkState === Connection.CELL_3G ||
                            networkState === Connection.CELL_4G;
                    } else if (typeof (navigator.onLine) !== 'undefined') {
                        return navigator.onLine;
                    } else {
                        throw "TitanJS: Impossible to detect connection: Cordova library " +
                            "has not been loaded or ready to its use and the navigator doesn't " +
                            " provide a way to check connection availability";
                    }
                } else {
                    throw "TitanJS: Impossible to detect connection: Cordova library " +
                        "has not been loaded or ready to its use";
                }
            };

            /**
             * Geolocate and returns de coordinates object with the needed information
             * @public
             * @method
             * @param {function(Coordinates)} atSuccess
             * @param {function(PositionError)} atError
             */
            this.geolocate = function (atSuccess, atError) {
                if (typeof (navigator) !== 'undefined') {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        atSuccess(position.coords);
                    }, function (error) {
                        Titan.Debug.error('TitanJS: A problem has been raised while trying to ' +
                            'geolocate. Reason:');
                        Titan.Debug.error('TitanJS: code: ' + error.code +
                            ', message: ' + error.message);
                        if (!_.isUndefined(atError)) {
                            atError(error);
                        }
                    });
                } else {
                    throw "TitanJS: Impossible to geolocate: Cordova library " +
                        "has not been loaded or ready to its use";
                }
            };

            /**
             * Checks whether a certain {value} is something or not
             * @public
             * @method
             * @param {*} value
             * @returns {boolean}
             */
            this.isSomething = function (value) {
                return value !== 0.0 && value !== "" && value !== 0 && value !== null &&
                    value !== undefined && typeof (value) !== 'undefined' &&
                    typeof (value) !== 'null' && !_.isUndefined(value) &&
                    !_.isNull(value) && !_.isNaN(value);
            };

            /**
             * Checks whether a certain value is defined (not null neither undefined) or not
             * @public
             * @method
             * @param value
             */
            this.isDefined = function(value) {
                return !_.isUndefined(value) && !_.isNull(value);
            };

            /**
             * Clone and returns a copy of the object instead of
             * a reference of it.
             * @public
             * @method
             * @param {Object} object The object to clone
             * @returns {Object} The copy created
             */
            this.clone = function(object) {
                return jQuery.extend(true, {}, object);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * Clone and returns a copy of the object containing
             * just its own properties (not the inherited-ones)
             * @param object
             * @returns {Object}
             */
            this.lowerClone = function(object) {
                var now = selfUtils.clone(object);
                var nw = {};
                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        var lowerKey = key.toLowerCase();
                        nw[lowerKey] = now[key];
                    }
                }
                return nw;
            };

            /**
             * Converts or parse string to its equivalent number
             * If the string is empty return 0
             * @public
             * @method
             * @param {String} text
             * @returns {number}
             */
            this.safeNumberize = function(text) {
                if (text === "" || text === " " || typeof(text) === "undefined" || typeof (text) === "null" || text === null || text === "null") {
                    return 0;
                } else if (typeof (text) === 'number'){
                    //noinspection JSValidateTypes
                    return text;
                } else {
                    return parseInt(text);
                }
            };

            /**
             * Compile a mustache-style string interpolating the map
             * passed as parameter en returns the compiled string
             * @public
             * @method
             * @param {String} text The mustache-style string template to compile from
             * @param {Object} map The primitive-object map to each key-value to be applied to the template
             * @returns {String}
             */
            this.interpolate = function(text, map) {
                return _.template(text, map, {
                    interpolate: /\{\{(.+?)\}\}/g
                });
            };

            /**
             * @public
             * @shortcut
             * @type {function(String, Object)}
             * @returns {String}
             */
            this.I = this.interpolate;

            //noinspection JSUnusedGlobalSymbols
            /**
             * If val is something diferrent to null, undefined or NaN, returns it back. If not,
             * return the default value specified.
             * @public
             * @method
             * @param {*} val
             * @param {*} def
             * @returns {*}
             */
            this.refOrDefault = function(val, def) {
                if (self.Utils.isSomething(val)) {
                    return val;
                } else {
                    return def;
                }
            };

            /**
             * Convierte un objeto JSON en su String correspondiente
             * @public
             * @method
             * @param {Object} obj
             * @returns {String}
             */
            this.stringify = function(obj) {
                return JSON.stringify(obj);
            };

            /**
             * Converts an object-formatted string to the such object
             * @public
             * @method
             * @param {String} strobj
             * @returns {Object}
             */
            this.jsonify = function(strobj) {
                return JSON.parse(strobj);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @backward
             * @deprecated
             */
            this.tryTo = function(action) {
                self.Behaviour.exe(action);
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {String} alias
             */
            this.polyfill = function(alias) {
                switch (alias) {
                    case "trim":
                        if (!String.prototype.trim) {
                            String.prototype.trim = function() {
                                return this.replace(/^\s+|\s+$/g, "");
                            }
                        }
                        break;
                }
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @methods
             * @param {number} itemsPerPage
             * @param {number} page
             * @return {String}
             */
            this.calculateLimits = function(itemsPerPage, page) {
                //noinspection UnnecessaryLocalVariableJS
                var limit  = " LIMIT ",
                    start  = ((itemsPerPage * (page - 1)) + 1).toString(),
                    amount = itemsPerPage;

                return limit + start + ", " + amount;
            };

            return selfUtils;
        })();

        this.View = new (function() {
            var selfView = this;

            //noinspection JSUnusedLocalSymbols
            /**
             * Identificador que tiene el objeto dentro del DOM que se encarga de hacer las veces del
             * Viewport de la aplicacion, que es el contenedor global HTML cuyo contenido se reemplazara
             * por cada cambio de pagina
             * @private
             * @field
             * @type {String}
             */
            var viewportId = '';

            //noinspection JSUnusedLocalSymbols
            /**
             * Object that stores the id of the different viewports that can have the application
             * paired with a key as an alias to access that viewport
             * @private
             * @field
             * @type {Object}
             */
            var additionalViewportIds = {};

            //noinspection JSUnusedLocalSymbols
            /**
             * @private
             * @constant
             * @type {string}
             */
            var NO_VIEW = "No view";

            //noinspection JSUnusedLocalSymbols
            /**
             * @private
             * @field
             * @type {string}
             */
            var previousView = NO_VIEW;

            //noinspection JSUnusedLocalSymbols
            /**
             * @private
             * @field
             * @type {string}
             */
            var currentView = NO_VIEW;

            //noinspection JSUnusedLocalSymbols
            /**
             * @private
             * @field
             * @type {Array.<string>}
             */
            var possibleFollowingViews = [];

            //noinspection JSUnusedLocalSymbols
            /**
             * @private
             * @field
             * @type {string}
             */
            var forwardView = NO_VIEW;

            //noinspection JSUnusedGlobalSymbols
            /**
             *
             * @returns {string}
             */
            this.getCurrent = function() {
                return currentView;
            };

            /**
             * Establece el identificador que tiene el objeto dentro del DOM que se encarga de hacer
             * las veces del Viewport de la aplicacion, que es el contenedor global HTML cuyo contenido
             * se reemplazara por cada cambio de pagina
             * @public
             * @method
             * @param {!String} viewportid viewportid El id (sin #) del Viewport
             */
            this.setViewportId = function(viewportid) {
                if (viewportid !== '') {
                    viewportId = viewportid;
                }
            };

            /**
             * @public
             * @method
             * @returns {String}
             */
            this.getViewportId = function() {
                return viewportId;
            };

            /**
             * Adds a key-value pair for alias-viewportId
             * @public
             * @method
             * @param {String} alias
             * @param {String} viewportid El id (sin #) del Viewport
             */
            this.addViewportId = function(alias, viewportid) {
                if (_.isUndefined(alias) || _.isUndefined(viewportid)) {
                    throw "TitanJS: Trying to add a viewport without specifying an alias or the viewportId";
                } else {
                    additionalViewportIds[alias] = viewportid;
                }
            };

            /**
             * Enlaza el modelo de vista pasado como parametro a la vista correspondiente al Viewport
             * previamente definido.
             * @public
             * @method
             * @param {Object} viewmodel El modelo de vista a enlazar
             * @param {String=} alias The viewport alias to bind to in case willing to bind another one
             */
            this.bind = function (viewmodel, alias) {
                //noinspection JSUnresolvedVariable
                if (typeof (ko) !== 'undefined') {
                    if (!_.isUndefined(alias)) {
                        var viewportId = additionalViewportIds[alias];
                        if (!viewportId) {
                            throw "TitanJS: The viewportId aliased '" +
                                alias + "' could not be found";
                        } else {
                            //noinspection JSDuplicatedDeclaration
                            var viewport = $('#' + viewportId)[0];
                            //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                            ko.cleanNode(viewport);
                            //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                            ko.applyBindings(viewmodel, viewport);
                        }
                    } else {
                        if (viewportId !== '') {
                            //noinspection JSDuplicatedDeclaration
                            var viewport = $('#' + selfView.getViewportId())[0];
                            //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                            ko.cleanNode(viewport);
                            //noinspection JSUnresolvedVariable, JSUnresolvedFunction
                            ko.applyBindings(viewmodel, viewport);
                        } else {
                            throw "TitanJS: The general viewport Id hasn't been specified";
                        }
                    }
                }
                else throw "TitanJS: Knockout hasn't been included as one of your libraries.";
            };

            var views = [];

            this.views = views;

            //noinspection JSValidateJSDoc
            /**
             * Render the HTML tree inside contained in the HTML document and insert it to the
             * specified viewport replacing all its previous content
             * @public
             * @async
             * @method
             * @param {String} name Name of HTML resource file (without extension)
             * @param {Function=} atFinish What happens after render and init are complete
             * @param {String=} alias The alias of the viewport's viewportId to change to
             * @param {function(JQuery=)=} atRenderFinish Action to run once render is complete
             * @param {boolean=} omitBeforeDestruct Define si se desea omitir la destruccion del modelo de la anterior vista
             * @param {boolean=} omitNowConstruct Define si se desea omitir la construccion del modelo de la nueva vista
             * @param {boolean=} omitInitialization Define si se desea inicializar sin argumentos el modelo de la nueva vista
             */
            this.change = function (name, atFinish, alias, atRenderFinish, omitBeforeDestruct, omitNowConstruct, omitInitialization) {
                var theView, filename, relative = "views/";

                if (typeof ($) !== 'undefined') {

                    // JQuery or Zepto available to use
                    if (!_.isUndefined(alias) && !_.isNull(alias)) {
                        // to aliased additional viewport
                        var viewportId = additionalViewportIds[alias];

                        if (!viewportId) {
                            throw "The viewportId aliased '" + alias + "' could not be found";
                        } else {
                            //noinspection JSDuplicatedDeclaration
                            var viewport = $("#" + viewportId);
                            //noinspection JSUnresolvedVariable
                            if (typeof (ko) !== "undefined") {
                                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                ko.cleanNode(viewport[0]);
                            }
                            theView = selfView.get(name);
                            filename = self.Utils.htmlizeFileName(name);
                            if (!_.isNull(theView)) {
                                filename = (!_.isUndefined(theView.file)) ? theView.file : filename;
                            }
                            viewport.load(relative + filename, function() {
                                self.Behaviour.exe(atRenderFinish, viewport);
                                if (!_.isNull(theView)) {
                                    if (!_.isUndefined(theView.viewmodel) && !_.isNull(TheApp)) {
                                        if (!omitNowConstruct) {
                                            TheApp[theView.name] = new (theView.viewmodel)();
                                        }
                                        if (typeof (TheApp[theView.name].init) === "function" && !omitInitialization) {
                                            TheApp[theView.name].init();
                                        }
                                    }
                                }
                                self.Behaviour.exe(atFinish, viewport);
                            });
                        }
                    } else {
                        // to general viewport
                        if (viewportId !== "") {
                            //var initializer;
                            //noinspection JSDuplicatedDeclaration
                            var viewport = $('#' + selfView.getViewportId());
                            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                            if (typeof (ko) !== "undefined") {
                                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                ko.cleanNode(viewport[0]);
                            }
                            theView = selfView.get(name);
                            filename = self.Utils.htmlizeFileName(name);
                            if (!_.isNull(theView)) {
                                filename = (!_.isUndefined(theView.file)) ? theView.file : filename;
                            }
                            viewport.load(relative + filename, function() {
                                self.Behaviour.exe(atRenderFinish, viewport);
                                previousView = currentView;
                                var prevView = selfView.get(previousView);
                                currentView = name;
                                if (!_.isNull(theView)) {
                                    if (!_.isUndefined(theView.name)) {
                                        if (!_.isNull(prevView) && !_.isUndefined(prevView.viewmodel) && !_.isNull(TheApp) && !omitBeforeDestruct) {
                                            if (typeof (TheApp[prevView.name].release) === "function") {
                                                TheApp[prevView.name].release();
                                            }
                                            TheApp[prevView.name] = null;
                                        }
                                        if (!_.isUndefined(theView.viewmodel) && !_.isNull(TheApp)) {
                                            if (!omitNowConstruct) {
                                                TheApp[theView.name] = new (theView.viewmodel)();
                                            }
                                            if (typeof (TheApp[theView.name].init) === "function" && !omitInitialization) {
                                                TheApp[theView.name].init();
                                            }
                                        }
                                    }
                                }
                                self.Behaviour.exe(atFinish, viewport);
                            });
                        } else {
                            throw "The general viewport Id hasn't been specified";
                        }
                    }

                } else {
                    throw "JQuery or Zepto ($) haven't been included inside JS libraries";
                }
                // function ends
            };

            /**
             *
             * @param name
             * @param vm
             * @param customFile
             */
            this.add = function(name, vm, customFile) {
                views.push({
                    name: name,
                    viewmodel: vm,
                    file: customFile
                });
            };

            /**
             *
             * @param vs
             */
            this.addViews = function(vs) {
                _.each(vs, function(view) {
                    views.push(view);
                });
            };

            /**
             *
             * @param name
             * @returns {Object}
             */
            this.get = function(name) {
                var view = _.findWhere(views, {
                    name: name
                });
                if (view) return view;
                else return null;
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {Array.<String>} schema
             */
            this.compileSchema = function(schema) {
                if (typeof ($) !== "undefined" && typeof(_) !== "undefined") {
                    var concatenated = "";
                    for (var key in schema) {
                        if (schema.hasOwnProperty(key)) {
                            var template = _.template($("script[type='text/x-handlebars-template']#titan-template-" + key).html());
                            concatenated += template(schema[key]);
                        }
                    }
                    return concatenated;
                } else {
                    throw new Error("JQuery and Undescore are not available");
                }
            };

            //noinspection JSUnusedGlobalSymbols
            /**
             * @public
             * @method
             * @param {String} templatename
             * @param {Array.<Object>} maps
             * @returns {string}
             */
            this.compileMaps = function(templatename, maps) {
                if (typeof ($) !== "undefined" && typeof(_) !== "undefined") {
                    var concatenated = "",
                        templatedHtml = $("script[type='text/x-handlebars-template']#titan-template-" + templatename).html();
                    for (var i = 0; i < maps.length; i++) {
                        var template = _.template(templatedHtml);
                        concatenated += template(maps[i]);
                    }
                    return concatenated;
                } else {
                    throw new Error("JQuery and Undescore are not available");
                }
            };

            return selfView;
        })();

        //noinspection JSUnusedGlobalSymbols
        /**
         * @public
         * @shortcut
         */
        this.Views = this.View;

        /**
         * @public
         * @method
         * @returns {boolean}
         */
        this.isCordovaPresent = function() {
            return typeof (navigator) !== "undefined";
        };

        return self;

    })();

    return Titan;

})();