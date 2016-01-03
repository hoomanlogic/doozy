(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/TimerStore'),
        require('babble')
    );
}(function (React, timerStore, babble) {
    var TimerBar = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [React.addons.PureRenderMixin],

        getInitialState: function () {
            return {
                timerLastUpdated: new Date().toISOString()
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            timerStore.subscribe(this.handleTimerStoreUpdate);
            this.handleTimerStoreUpdate(timerStore.updates.value);
        },
        componentWillUnmount: function () {
            timerStore.dispose(this.handleTimerStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleWorkingOnChange: function (event) {
            timerStore.updateWorkingOn(event.target.value);
        },
        handleDoneTimerClick: function () {
            timerStore.pauseTimer();
            var duration = new babble.Duration(timerStore.updates.value.timeSoFar);

            ui.logEntry({
                id: '00000000-0000-0000-0000-000000000000',
                name: timerStore.updates.value.workingOn,
                duration: duration.toMinutes()
            });
        },
        handleResetTimerClick: function () {
            timerStore.resetTimer();
        },
        handlePlayPauseTimerClick: function () {
            if (timerStore.updates.value.isRunning) {
                timerStore.pauseTimer();
            }
            else {
                timerStore.startTimer();
            }
        },
        handleRunningTotalUpdate: function () {
            this.setState({
                timerLastUpdated: new Date().getTime()
            });
        },
        handleTimerStoreUpdate: function (timer) {
            if (timer.isRunning && typeof this.timerInterval === 'undefined') {
                this.timerInterval = setInterval(this.handleRunningTotalUpdate, 1000);
            }
            else if (!timer.isRunning && typeof this.timerInterval !== 'undefined') {
                clearInterval(this.timerInterval);
                this.timerInterval = undefined;
            }
            this.setState({timerLastUpdated: new Date().toISOString()});
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            if (timerStore.updates.value.isOpen) {

                var aStyle = {
                    padding: '5px',
                    color: '#e2ff63'
                };

                var textStyle = {
                    fontSize: '1.5rem',
                    padding: '0.2rem',
                    color: '#e2ff63'
                };

                var displayDuration = null;
                if (timerStore.updates.value.isRunning || timerStore.updates.value.timeSoFar > 0) {
                    var currentTime = new Date().getTime();
                    var timeSoFar = timerStore.updates.value.timeSoFar + (currentTime - (timerStore.updates.value.startedAt || currentTime));
                    var duration = new babble.Duration(timeSoFar);
                    displayDuration = (<span style={textStyle}>{duration.toString(':')}</span>);
                }

                /* eslint-disable no-script-url */
                return (
                    <div style={{ display: 'flex', padding: '2px', backgroundColor: '#444' }}>
                        <div style={{ flexGrow: '1', marginRight: '2px' }}>
                            <input ref="workingOn" className="form-control" type="text" placeholder="What are you working on?" onChange={this.handleWorkingOnChange} value={timerStore.updates.value.workingOn} />
                        </div>
                        <div onClick={this.handleDoneTimerClick}>{displayDuration}</div>

                        <div>
                            <a style={aStyle} href="javascript:;" onClick={this.handlePlayPauseTimerClick}>
                                <i style={{ margin: '0.2rem'}} className={'fa fa-2x ' + (timerStore.updates.value.isRunning ? 'fa-pause' : 'fa-play')}></i>
                            </a>
                        </div>
                        <div>
                            <a style={aStyle} href="javascript:;" onClick={this.handleResetTimerClick}>
                                <i style={{ margin: '0.2rem'}} className={'fa fa-2x fa-times'}></i>
                            </a>
                        </div>
                    </div>
                );
                /* eslint-enable no-script-url */
            }
            else {
                return null;
            }
        }
    });
    return TimerBar;
}));
