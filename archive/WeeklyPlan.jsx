var WeeklyPlan = React.createClass({
    render: function () {
        // props
        var weekStart = this.props.weekStart;
        var weather = this.props.weather;
        
        if (weather === null) {
            return null;   
        }
        
        // calculations
        var today = new Date().getMidnight();
        var beginWeekViewDate = today.getBeginningOfWeek(this.props.weekStart);
        var weekdays = hldatetime.getDaysOfWeek(7, beginWeekViewDate);
        var beginOfWeek = today.getBeginningOfWeek(weekStart);
        var endOfWeek = new Date(beginOfWeek.toString());
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        // add weather info to weekdays
        var dataIndex = 0;
        for (var i = hldatetime.getAdjustedDay(today.getDay(), weekStart); i < weekdays.length && dataIndex < weather.daily.data.length; i++) {
            var w = weather.daily.data[dataIndex];
            var info = w.summary + ' Low: ' + w.temperatureMin + ' High: ' + w.temperatureMax + ' Sunrise: ' + hldatetime.formatTime(w.sunriseTime) + ' Sunset: ' + hldatetime.formatTime(w.sunsetTime);
            weekdays[i].info = info;
            weekdays[i].icon = w.icon;
            weekdays[i].weather = w;
            weekdays[i].id = 'icon' + weekdays[i].day.slice(0, 3);
            dataIndex++;
        }
        return (
            <div>
                <div style={{width: '100%', height: '100%'}}>
                    <div className="week-header">Week of {beginOfWeek.toLocaleDateString()} to {endOfWeek.toLocaleDateString()}</div>
                    {weekdays.map(function(item, index) {
                        return (<CalendarDay key={index} data={item} />);
                    })}
                </div>
            </div>
        );
    }
});