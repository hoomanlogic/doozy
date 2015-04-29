var Timer = React.createClass({
    mixins: [React.addons.PureRenderMixin],
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            timerLastUpdated: new Date().toISOString()
        };
    },
    
    componentWillMount: function () {
        timerStore.subscribe(this.handleTimerStoreUpdate);
        this.handleTimerStoreUpdate(timerStore.updates.value);
    },
    componentWillUnmount: function () {
        timerStore.dispose(this.handleTimerStoreUpdate);
        if (this.interval) {
            clearInterval(this.interval);
        }
    },
    
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleRunningTotalUpdate: function () {
        this.setState({
            timerLastUpdated: new Date().getTime()
        });
    },
    handleTimerStoreUpdate: function (timer) {
        if (timer.isRunning && typeof this.interval === 'undefined') {
            this.interval = setInterval(this.handleRunningTotalUpdate, 1000);
        } else if (!timer.isRunning && typeof this.interval !== 'undefined') {
            clearInterval(this.interval);
            this.interval = void 0;
        }
        this.setState({timerLastUpdated: new Date().toISOString()});
    },
    handleToggleTimerClick: function () {
        if (timerStore.updates.value.isRunning) {
            timerStore.pauseTimer();
        } else {
            timerStore.startTimer();
        }
    },
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        var iconStyle = timerStore.updates.value.isRunning ? { marginRight: '5px' } : { color: '#b2b2b2', marginRight: '5px' };
        var displayDuration = null;
        var timerStyle = {
            padding: '5px'
        };
        var textStyle = {
            verticalAlign: 'super'
        }
        
        if (timerStore.updates.value.isRunning || timerStore.updates.value.timeSoFar > 0) {
            var currentTime = new Date().getTime();
            var timeSoFar = timerStore.updates.value.timeSoFar + (currentTime - (timerStore.updates.value.startedAt || currentTime))
            var duration = new babble.Duration(timeSoFar);
            displayDuration = (<span style={textStyle}>{duration.toString(':')}</span>);
        }
        return (
            <li key="timer"><a style={timerStyle} href="javascript:;" onClick={this.handleToggleTimerClick}><i style={iconStyle} className="fa fa-2x fa-clock-o"></i>{displayDuration}</a></li>
        );
    },
});