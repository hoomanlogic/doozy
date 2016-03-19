var React = require('react');
var ReactDOM = require('react-dom');
var ActionsInterface = require('interfaces/Actions');
if (window) {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.MountInterface = ActionsInterface;
}
