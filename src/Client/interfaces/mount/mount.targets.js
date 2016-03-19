var React = require('react');
var ReactDOM = require('react-dom');
var TargetsInterface = require('interfaces/Targets');
if (window) {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.MountInterface = TargetsInterface;
}
