//Styles
//require('./bower_components/fontawesome/css/font-awesome.css');
//require('./bower_components/toastr/toastr.less');
//require('./bower_components/selectize/dist/css/selectize.css');
//require('./bower_components/selectize/dist/css/selectize.default.css');
//
//require('./src/client/less/mixins/colors.less');
//require('./src/client/less/mixins/mixins.less');
//require('./src/client/less/base/boilerstrapalize.less');
//require('./src/client/less/element_selectors/elements.less');
//require('./src/client/less/actions.less');
//require('./src/client/less/attributes.less');

//JS External Libraries
//var $ = require('jquery');
//var _ = require('lodash');
//var React = require('react/addons');
//var json2 = require('json2');

//JS Internal Libraries
//var hlcommon = require('./bower_components/hl-common-js/src/common.js');
//var hldatetime = require('./bower_components/hl-common-js/src/datetime.js');
//var hlio = require('./bower_components/hl-common-js/src/io.js');
//var hluri = require('./bower_components/hl-common-js/src/uri.js');
//var EventHandler = require('./bower_components/hl-common-js/src/EventHandler.js');

//externals
var React = require('react');
var toastr = require('toastr');

// libs
var errl = require('./bower_components/errl_js/src/errl.js');

// shim Object.assign
//require('Libs/object-assign');

//JS App
var DoozyApp = require('pages/App');

// make accessible for browser initialization
if (window) {
    window.React = React;
    window.DoozyApp = DoozyApp;
    window.clientApp = {
        HOST_NAME: window.location.href.split('/').slice(0, 3).join('/'),
        setAccessToken: function (accessToken) {
            sessionStorage.setItem('accessToken', accessToken);
        },
        getAccessToken: function () {
            return sessionStorage.getItem('accessToken');
        }
    };
    window.errl = errl;
}

/**
 * Configure toastr notifications
 */
toastr.options.closeButton = true;
toastr.options.timeOut = 2000;
toastr.options.positionClass = 'toast-bottom-right';

/**
 * Configure error logger
 */
errl.config = errl.config || {};
Object.assign(errl.config, {
    version: '@ViewBag.Version',
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

/**
 * Configure client app (hostname and access token)
 */
