(function (factory) {
    module.exports = exports = factory(
        require('react')
    );
}(function (React) {
    var Day = React.createClass({
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var style = {
                display: 'inline-block',
                borderRadius: '0',
                margin: '0',
                width: '14%',
                height: '100%',
                minHeight: '100px',
                border: '1px solid #81981d',
                borderWidth: '1px 0 1px 1px'
            };

            var styleOutOfScope = {
                border: '1px solid hsl(0, 0%, 53%)'
            };

            if (!this.props.data.isMonth) {
                style = Object.assign(style, styleOutOfScope);
            }

            var styleIsDay = {
                boxShadow: '#e2ff63 0 0 100px inset'
            };
            if (this.props.data.isDay) {
                style = Object.assign(style, styleIsDay);
            }

            return (
                <div style={style}>
                    <div className="calendar-box-header">
                        <span className="calendar-day">{this.props.data.dayName.slice(0,3)}</span>
                        <span style={{float: 'right'}}>{this.props.data.date.getDate()}</span>
                    </div>
                </div>
            );
        }
    });
    return Day;
}));
