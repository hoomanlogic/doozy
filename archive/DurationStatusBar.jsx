var DurationStatusBar = React.createClass({
    render: function () {
        // props
        var totalMinutes = this.props.totalMinutes;
        var minutesRemaining = this.props.minutesRemaining;
        
        // calcs
        var elapsedStyle = {
            width: (100 / (totalMinutes / (totalMinutes - minutesRemaining))) + '%'
        };
        var remainingStyle = {
            width: (100 / (totalMinutes / minutesRemaining)) + '%'
        };
        
        // html
        return (
            <div>
                <div className="duration-bar elapsed" style={elapsedStyle} title={hldatetime.formatDuration(totalMinutes - minutesRemaining)}><pre style={{margin: '0', overflow: 'visible'}}> </pre></div>
                <div className="duration-bar remaining" style={remainingStyle} title={hldatetime.formatDuration(minutesRemaining)}><pre style={{margin: '0', overflow: 'visible'}}> </pre></div> 
            </div>
        );
    }
});