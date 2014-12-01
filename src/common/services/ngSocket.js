///////////////////////////////////////////////////////////////////////////////
//                                                                           //
//                            _____            __        __                  //
//                ____  ____ / ___/____  _____/ /_____  / /______            //
//               / __ \/ __ `|__ \/ __ \/ ___/ //_/ _ \/ __/ ___/            //
//              / / / / /_/ /__/ / /_/ / /__/ ,< /  __/ /_(__  )             //
//             /_/ /_/\__, /____/\____/\___/_/|_|\___/\__/____/              //
//                   /____/                                                  //
//                                                                           //
// ------------------------------------------------------------------------- //
// @file         : ngSockets.js                                              //
// @summary      : AngularJs socket.io provider                              //
// @version      : 0.0.1                                                     //
// @project      : https://github.com/maggiben                               //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 18 Oct 2014                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2013 Benjamin Maggi, all rights reserved.            //
//                                                                           //
//                                                                           //
// License:                                                                  //
// This program is free software; you can redistribute it                    //
// and/or modify it under the terms of the GNU General Public                //
// License as published by the Free Software Foundation;                     //
// either version 2 of the License, or (at your option) any                  //
// later version.                                                            //
//                                                                           //
// This program is distributed in the hope that it will be useful,           //
// but WITHOUT ANY WARRANTY; without even the implied warranty of            //
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             //
// GNU General Public License for more details.                              //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

angular.module('ngSocket', [
    'AuthService'
])
.constant('io', io)
.provider('ngSocketFactory', function () {
    'use strict';

    // when forwarding events, prefix the event name
    var defaultPrefix = 'socket:';
    var ioSocket;
    var defaultOptions = {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 500,
        timeout: 20000
    };
    var reconnectionAttempts = 10;

    // expose to provider
    this.$get = ['$rootScope', '$timeout', '$q', 'AuthService', 'io', function ($rootScope, $timeout, $q, AuthService, io) {

        var asyncAngularify = function (socket, callback) {
            return callback ? function () {
                var args = arguments;
                $timeout(function () {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };

        return function socketFactory (options) {
            options = options || {};
            var token = AuthService.getToken();
            var socket = options.ioSocket || io.connect('http://api.apicat.us', { 'query': 'token=' + token, 'secure': true });
            var prefix = options.prefix || defaultPrefix;
            var defaultScope = options.scope || $rootScope;

            var addListener = function (eventName, callback) {
                socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
            };

            var addOnceListener = function (eventName, callback) {
                socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
            };
            var wrappedSocket = {
                on: addListener,
                addListener: addListener,
                once: addOnceListener,

                emit: function (eventName, data, callback) {
                    var lastIndex = arguments.length - 1;
                    var args = arguments;
                    callback = args[lastIndex];
                    if(typeof callback == 'function') {
                        callback = asyncAngularify(socket, callback);
                        args[lastIndex] = callback;
                    }
                    return socket.emit.apply(socket, args);
                },

                removeListener: function (ev, fn) {
                    var args = arguments;
                    if (fn && fn.__ng) {
                        args[1] = fn.__ng;
                    }
                    return socket.removeListener.apply(socket, args);
                },
                removeAllListeners: function() {
                    return socket.removeAllListeners.apply(socket, arguments);
                },

                connect: function() {
                    var token = AuthService.getToken();
                    socket = options.ioSocket || io.connect('http://api.apicat.us', { 'query': 'token=' + token, 'secure': true });
                    return socket;
                },

                disconnect: function (close) {
                    console.log("socket: ", socket);
                    socket = socket.disconnect(close);
                    return socket;
                },

                // when socket.on('someEvent', fn (data) { ... }),
                // call scope.$broadcast('someEvent', data)
                forward: function (events, scope) {
                    if (events instanceof Array === false) {
                        events = [events];
                    }
                    if (!scope) {
                        scope = defaultScope;
                    }
                    events.forEach(function (eventName) {
                        var prefixedEvent = prefix + eventName;
                        var forwardBroadcast = asyncAngularify(socket, function (data) {
                            scope.$broadcast(prefixedEvent, data);
                        });
                        scope.$on('$destroy', function () {
                            socket.removeListener(eventName, forwardBroadcast);
                        });
                        socket.on(eventName, forwardBroadcast);
                    });
                }
            };

            return wrappedSocket;
        };
    }];
});
