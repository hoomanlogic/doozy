var TIME_SCOPE = {
    this: {
        moment: 'Now',
        day: 'Today',
        week: 'This Week',
        month: 'This Month',
        year: 'This Year'
    },
    day: 'Day of {0}',
    week: 'Week of {0}',
    month: 'Month of {0}',
    year: 'Year of {0}'
};


handleTimeScopeClicked: function (item) {
	this.setState({ timeScope: item });  
},