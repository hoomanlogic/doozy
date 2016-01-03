/* This mixin provides a simple setInterval method.
 *
 * Example:
 *
 *     var Component = React.createClass({
 *         ...
 *         componentDidMount: function () {
 *             this.setInterval(this.doSomething, 1000);
 *             this.setInterval(this.doSomethingElse, 5000);
 *         }
 *         ...
 *     });
 *
 * doSomething is called every second and doSomethingElse is called every five
 * seconds. Their intervals will be canceled automatically when the component
 * unmounts.
 */
 (function (factory) {
     module.exports = exports = factory();
 }(function (React) {
    var SetIntervalMixin = {
        componentWillMount: function () {
            this.intervals = [];
        },
        setInterval: function (fn, ms) {
            this.intervals.push(setInterval(fn, ms));
        },
        componentWillUnmount: function () {
            this.intervals.forEach(clearInterval);
        }
    };
    return SetIntervalMixin;
}));
