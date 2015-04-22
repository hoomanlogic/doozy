var MonthlyPlan = React.createClass({
    render: function () {
        // props
        var weekStart = this.props.weekStart;
        var weather = this.props.weather;
        // calcs
        var today = new Date().getMidnight();
        var beginMonthViewDate = today.getFirstOfMonth().getBeginningOfWeek(this.props.weekStart);
        var monthdays = hldatetime.getDaysOfWeek(42, beginMonthViewDate);
        // add weather info to monthdays
        var dataIndex = 0;
        var hitToday = false;
        for (var i = 0; i < monthdays.length && dataIndex < weather.daily.data.length; i++) {
            // check if we've hit today yet
            if (hitToday === false) {
                if (monthdays[i].date.toLocaleDateString() === today.toLocaleDateString()) {
                    hitToday = true;
                } else {
                    continue;
                }
            }
            var w = weather.daily.data[dataIndex];
            var info = w.summary + ' Low: ' + w.temperatureMin + ' High: ' + w.temperatureMax + ' Sunrise: ' + hldatetime.formatTime(w.sunriseTime) + ' Sunset: ' + hldatetime.formatTime(w.sunsetTime);
            monthdays[i].info = info;
            monthdays[i].icon = w.icon;
            monthdays[i].weather = w;
            monthdays[i].id = 'icon' + monthdays[i].day.slice(0, 3) + monthdays[i].date.getDate();
            dataIndex++;
        }

        // html
        return (
            <div>
            <div style={{width: '100%', height: '100%'}}>
                <div className="week-header">Month of {hldatetime.monthsOfYear[today.getMonth()]}</div>
                    {monthdays.map( function(item, index) {
                        return (<CalendarDay key={index} data={item} />);
                    })}
                </div>
            </div>
        );
    }
});