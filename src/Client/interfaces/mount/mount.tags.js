var React = require('react');
var ReactDOM = require('react-dom');
var TagsInterface = require('interfaces/Tags');
if (window) {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.MountInterface = TagsInterface;
}
