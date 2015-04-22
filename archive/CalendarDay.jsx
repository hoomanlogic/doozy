var CalendarDay = React.createClass({
    render: function () {
        return (
            <div className={'calendar-box ' + this.props.data.className}>
                <div className="calendar-box-header"><span className="calendar-day">{this.props.data.day.slice(0,3)}</span><span className="calendar-date">{this.props.data.date.getDate()}</span></div>
                <WeatherIcon id={this.props.data.id} info={this.props.data.info} icon={this.props.data.icon} color={_.isUndefined(this.props.data.weather) ? 'black' : (this.props.data.weather.temperatureMin < 60 ? 'blue' : (this.props.data.weather.temperatureMax > 80 ? 'red' : 'black'))} />
            </div>
        );
    }
});