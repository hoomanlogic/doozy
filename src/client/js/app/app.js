/**
 * 2015, HoomanLogic, Geoff Manning
 * Namespace: hlapp
 * Dependencies: toastr
 */
 
if (typeof require !== 'undefined') {
	var errl = require('errl');
	var hlcommon = require('common');
	var skycons = require('skycons');
	var jstorage = require('jstorage');
	var aes = require('aes');
	var signalr = require('signalr');
	var selectize = require('selectize');
	var toastr = require('toastr');
}

(function (exports) {
    'use strict';
	
    // configure toastr notifications
    toastr.options.closeButton = true;
    toastr.options.timeOut = 2000;
    toastr.options.positionClass = 'toast-bottom-right';

    exports.HOST_NAME = window.location.href.split('/').slice(0, 3).join('/');
    
    // Data access operations
    exports.setAccessToken = function (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
    };
	
    exports.getAccessToken = function () {
        return sessionStorage.getItem('accessToken');
    };
    
    // configure error logger
    errl.config = errl.config || {};
    hlcommon.assign(errl.config, {
        developer: 'hoomanlogic',
        key: '54263eb4-6ced-49bf-9bd7-14f0106c2a02',
        product: 'HoomanLogic',
        environment: null,
        getState: null,
        getUser: function () {
            return 'anonymous';
        },
        onLogged: function (err) {
            toastr.error("<p><string>Oops!</strong></p><p>We're really sorry about that.</p><p>We'll get this fixed as soon as possible.</p>" + '<a class="btn btn-default btn-link" target="_blank" href="' + errl.getErrorDetailUrl(err.errorId) + '">Show me details</a> ');
        }
    });
	
}(typeof exports === 'undefined' ? this['hlapp'] = {}: exports));

window.onerror = function () {
	errl.log(arguments);
};

if (!hlapp.getAccessToken()) {
	// The following code looks for a fragment in the URL to get the access token which will be
	// used to call the protected Web API resource
	var fragment = hluri.getHashToken();

	if (fragment.access_token) {
		// returning with access token, restore old hash, or at least hide token
		window.location.hash = fragment.state || '';
		hlapp.setAccessToken(fragment.access_token);
	} else {
		// no token - so bounce to Authorize endpoint in AccountController to sign in or register
		window.location = "/Account/Authorize?client_id=web&response_type=token&state=" + encodeURIComponent(window.location.hash);
	}
}

$(document).ready(function () {
	$.ajax({
		url: hlapp.HOST_NAME + '/api/settings',
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + hlapp.getAccessToken()
		},
		success: function (data) {
			React.render(React.createElement(HoomanLogicApp, { settings: data }), document.getElementById('hooman-logic'));
		}.bind(this),
		error: function (xhr, status, err) {
			console.error('settings.json', status, err.toString());
		}.bind(this)
	});
});