(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('babble')
    );
}(function (React, babble) {
    var RelativeTime = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        propTypes: {
            isoTime: React.PropTypes.string,
            accuracy: React.PropTypes.oneOf([
                'd', // day
                'a'  // auto
            ])
        },

        getDefaultProps: function () {
            return {
                accuracy: 'a' // auto
            };
        },

        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        calcRelativeTime: function () {
            var time = new Date(this.props.isoTime);
            var now = new Date();

            if (this.props.accuracy === 'd') {
                time = new Date(time.toLocaleDateString()); // away with thee, time specificity
                now = new Date(now.toLocaleDateString()); // and thee as well

                var timeDiff = Math.abs(now.getTime() - time.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (time < now) {
                    if (diffDays === 0) {
                        return 'Today';
                    }
                    else if (diffDays === 1) {
                        return 'Yesterday';
                    }
                    else if (diffDays < 7) {
                        return babble.moments.daysOfWeek[time.getDay()];
                    }
                    else {
                        return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
                    }
                }
                else if (diffDays === 0) {
                    return 'Today';
                }
                else if (diffDays === 1) {
                    return 'Tomorrow';
                }
                else if (diffDays < 7) {
                    return babble.moments.daysOfWeek[time.getDay()];
                }
                else {
                    return 'in ' + diffDays + ' day' + (diffDays > 1 ? 's' : '');
                }
            }
            else {
                var duration = new babble.Duration(new Date() - new Date(this.props.isoTime));
                if (time < now) {
                    return duration.toString().split(', ')[0] + ' ago';
                }
                else {
                    return 'in ' + duration.toString().split(', ')[0];
                }
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            if (!this.props.isoTime) {
                return null;
            }
            else {
                return (<span>{this.calcRelativeTime(this.props.isoTime)}</span>);
            }
        },
    });
    return RelativeTime;
}));
