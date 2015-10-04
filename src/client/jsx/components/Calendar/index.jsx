(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('./Day')
    );
}(function (React, Day) {
    var Calendar = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        statics: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },

        getInitialState: function () {
            return {
                date: this.props.date || Date.create('today')
            };
        },

        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        calcIsMonth: function (date1, date2) {
            return date1.getMonth() === date2.getMonth()
                && date1.getFullYear() === date2.getFullYear();
        },
        getMonthDays: function (beginMonthViewDate) {
            var date = Date.create(this.state.date);
            var days = this.getDaysOfWeek(Date.create(beginMonthViewDate), 35);
            var nextDate = Date.create(days[days.length - 1].date);
            nextDate.setDate(nextDate.getDate() + 1);
            if (this.calcIsMonth(date, nextDate)) {
                days = days.concat(this.getDaysOfWeek(nextDate, 7));
            }
            return days;
        },
        getDaysOfWeek: function (date, count) {
            var days = [];
            for (var i = 0; i < count; i++) {
                days.push({
                    date: new Date(date.toISOString()),
                    day: date.getDay(),
                    dayName: Calendar.days[date.getDay()]
                });
                date.setDate(date.getDate() + 1);
            }
            return days;
        },
        getBeginningOfWeek: function (date, weekStarts) {
            if (typeof weekStarts === 'undefined') {
                weekStarts = 0;
            }

            date.setHours(0,0,0,0);
            var diff = weekStarts - date.getDay();
            if (weekStarts > date.getDay()) {
                date.setDate(date.getDate() + (diff - 7));
            } else {
                date.setDate(date.getDate() + diff);
            }

            return date;
        },
        getFirstOfMonth: function (date) {
            return new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-01' + ' ' + date.toString().split(' ')[5]);
        },
        styleDaysOfMonth: function (days) {

            var beginningOfWeek = this.getBeginningOfWeek(Date.create(this.state.date), this.props.weekStarts);
            var endOfWeek = new Date(beginningOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);

            var date = Date.create(this.state.date);
            days.forEach(function (day) {
                day.isMonth = this.calcIsMonth(date, day.date);
                day.isWeek = day.isMonth && beginningOfWeek <= day.date && day.date <= endOfWeek;
                day.isDay = day.isMonth && date.getDate() === day.date.getDate();
            }.bind(this));
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // props
            var weekStarts = this.props.weekStarts;

            // state
            var date = Date.create(this.state.date);

            // calcs
            var beginMonthViewDate = this.getBeginningOfWeek(this.getFirstOfMonth(date), this.props.weekStart);
            var days = this.getMonthDays(beginMonthViewDate);
            this.styleDaysOfMonth(days);

            // html
            return (
                <div>
                    <div style={{width: '100%', height: '100%'}}>
                        <div className="week-header">Month of {Calendar.months[date.getMonth()]}</div>
                        {days.map( function(item, index) {
                            return (<Day key={index} data={item} />);
                        })}
                    </div>
                </div>
            );
        }
    });
    return Calendar;
}));
