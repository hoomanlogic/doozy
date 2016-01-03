(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('mixins/StoresMixin'),
        require('stores/TimerStore')
    );
}(function (React, StoresMixin, timerStore) {
    var Timer = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [React.addons.PureRenderMixin, StoresMixin([timerStore])],

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleToggleTimerClick: function () {
            if (timerStore.updates.value.isOpen) {
                timerStore.hideTimer();
            }
            else {
                timerStore.openTimer();
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var iconStyle = { marginRight: '5px' };

            var timerStyle = {
                padding: '5px'
            };
            /* eslint-disable no-script-url */
            return (
                <li key="timer"><a className={timerStore.updates.value.isRunning ? 'active' : ''} style={timerStyle} href="javascript:;" onClick={this.handleToggleTimerClick}><i style={iconStyle} className="fa fa-2x fa-clock-o"></i></a></li>
            );
            /* eslint-enable no-script-url */
        },
    });
    return Timer;
}));
