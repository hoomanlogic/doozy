var React = require('react');
var ReactDOM = require('react-dom');
var ActionFormInterface = require('interfaces/ActionForm');
if (window) {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.MountInterface = ActionFormInterface;
}
