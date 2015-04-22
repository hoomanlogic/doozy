var Timer = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            timerLastUpdated: new Date().toISOString(),
            timeSoFar: 0
        };
    },
    
    getInitialState: function () {
        return {
            connectionsLastUpdated: new Date().toISOString(),
            notificationsLastUpdated: new Date().toISOString(),
            preferencesLastUpdated: new Date().toISOString(),
            timerLastUpdated: new Date().toISOString()
        };
    },
    
    componentWillMount: function () {
        timerStore.subscribe(this.handleTimerStoreUpdate);
    },
    componentWillUnmount: function () {
        timerStore.dispose(this.handleNotificationStoreUpdate);
        if (this.interval) {
            clearInterval(this.interval);
        }
    },
    
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleTimerStoreUpdate: function (prefs) {
        this.setState({timerLastUpdated: new Date().toISOString()});
    },
    handleToggleTimerClick: function () {
        if (timerStore.updates.value.isRunning) {
            timerStore.pauseTimer();
            clearInterval(this.interval);
            this.interval = null;
        } else {
            timerStore.startTimer();
            this.interval = setInterval(this.handleRunningTotalUpdate, 1000);
        }
    },
    handleRunningTotalUpdate: function () {
        this.setState({
            time: new Date().getTime()
        });
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
        
        if (timerStore.updates.value.isRunning) {
            var timeSoFar = timerStore.updates.value.timeSoFar + (new Date().getTime() - timerStore.updates.value.startedAt)
            var duration = new babble.Duration(timeSoFar);
            displayDuration = (<span style={textStyle}>{duration.toString('seconds', ':')}</span>);
        }
        return (
            <li key="timer"><a style={timerStyle} href="javascript:;" onClick={this.handleToggleTimerClick}><i style={iconStyle} className="fa fa-2x fa-clock-o"></i>{displayDuration}</a></li>
        );
    },
});