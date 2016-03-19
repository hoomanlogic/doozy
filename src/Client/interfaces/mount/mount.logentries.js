var React = require('react');
var ReactDOM = require('react-dom');
var LogEntriesInterface = require('interfaces/LogEntries');
if (window) {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.MountInterface = LogEntriesInterface;
}
