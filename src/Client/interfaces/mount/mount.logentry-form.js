var React = require('react');
var ReactDOM = require('react-dom');
var LogEntryFormInterface = require('interfaces/LogEntryForm');
if (window) {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.MountInterface = LogEntryFormInterface;
}
