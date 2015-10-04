(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('./Day'),
        require('app/doozy'),
        require('stores/TargetStore')
    );
}(function (React, Day, doozy, targetStore) {
    var Calendar = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        statics: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },

        getDefaultProps: function () {
            return {
                targetId: null
            };
        },

        getInitialState: function () {
            return {
                date: this.props.date || Date.create('today')
            };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            ui.goBack();
        },
        handleLeftClick: function () {
            var date = this.state.date;
            date.setMonth(date.getMonth() - 1);
            this.setState({
                date: date
            });
        },
        handleRightClick: function () {
            var date = this.state.date;
            date.setMonth(date.getMonth() + 1);
            this.setState({
                date: date
            });
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

            var targetId = this.props.targetId;
            // just process the first one
            var today = Date.create('today');
            var date = Date.create(this.state.date);

            days.forEach(function (day) {
                var targetsStats;
                if (targetId && today > day.date) {
                    var nextDay = Date.create(day.date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    targetsStats = doozy.targetsStats(targetId, nextDay);
                    if (targetsStats[0].error) {
                        targetsStats = undefined;
                    }
                }
                day.isMonth = this.calcIsMonth(date, day.date);
                day.isWeek = day.isMonth && beginningOfWeek <= day.date && day.date <= endOfWeek;
                day.isDay = day.isMonth && date.getDate() === day.date.getDate();
                day.targetsStats = targetsStats;
            }.bind(this));
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // props
            var weekStarts = this.props.weekStarts;
            var target = _.find(targetStore.updates.value, {id: this.props.targetId})
            var appendTargetName = '';

            if (target) {
                appendTargetName = ': ' + target.name;
            }

            // state
            var date = Date.create(this.state.date);

            // calcs
            var beginMonthViewDate = this.getBeginningOfWeek(this.getFirstOfMonth(date), this.props.weekStart);
            var days = this.getMonthDays(beginMonthViewDate);
            this.styleDaysOfMonth(days);

            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{paddingRight: '5px'}} onClick={this.handleLeftClick}><i className="clickable fa fa-chevron-left fa-2x"></i></div>
                        <div style={{flexGrow: '1'}}>Month of {Calendar.months[date.getMonth()] + appendTargetName}</div>
                        <div style={{paddingRight: '5px'}} onClick={this.handleRightClick}><i className="clickable fa fa-chevron-right fa-2x"></i></div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div>
                        {days.map( function(item, index) {
                            return (<Day key={index} data={item} />);
                        })}
                    </div>
                </div>
            );
        }
    });

    var headerStyle = {
        display: 'flex',
        flexDirection: 'row',
        color: '#e2ff63',
        backgroundColor: '#444',
        padding: '2px 2px 0 8px',
        fontWeight: 'bold',
        fontSize: '1.5em'
    };

    return Calendar;
}));
