(function (factory) {
    module.exports = exports = factory(
        require('react/addons')
    );
}(function (React) {
    var Indicator = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [React.addons.PureRenderMixin],
        propTypes: {
            value: React.PropTypes.string.isRequired,
            change: React.PropTypes.any.isRequired
        },
        statics: {
            calcColor: function (percent) {
                if (typeof percent === 'undefined' || percent === '') {
                    return null;
                }

                var multiplier = 120 / 100;
                var offBy = 100 - percent;

                var color = 'hsl(' + (120 - Math.round(offBy * multiplier)) + ',90%,40%)';

                return color;
            },

            calcProgressProps: function (target, stats) {
                var progress = {
                    kind: 'comparison',
                    value: stats.periodActive.number,
                    backgroundColor: 'white',
                    compare: target.number,
                    change: stats.periodActive.number > target.number ? stats.periodActive.number - target.number : 0
                };

                var diff = target.number - stats.periodActive.number;
                var expectedRate = target.number / stats.periodActive.daysInPeriod;
                if (diff <= 0) {
                    Object.assign(progress, {
                        kind: 'simple',
                        backgroundColor: Indicator.calcColor(100),
                        value: 'MET',
                        compare: null
                    });
                }
                else if (Math.ceil(stats.periodActive.daysLeft * expectedRate) >= diff) {
                    // do nothing
                }
                else {
                    Object.assign(progress, {
                        backgroundColor: Indicator.calcColor(Math.round((Math.ceil(stats.periodActive.daysLeft * expectedRate) / diff) * 100) - 50)
                    });
                }

                return progress;
            }
        },

        getDefaultProps: function () {
            return {
                width: '100px',
                backgroundColor: 'white',
                isPercent: false
            };
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var content;
            
            var changeColor = 'rgb(68, 68, 68)';
            var changePrefix = '';
            var suffix = '';

            if (this.props.change > 0) {
                changeColor = 'hsl(120,90%,40%)';
            }
            else if (this.props.change < 0) {
                changeColor = 'hsl(0,90%,40%)';
            }

            if (this.props.kind === 'percent') {
                suffix = '%';
            }
            if (this.props.change > 0) {
                changePrefix = '+';
            }

            /**
             * Render content based on kind of indicator
             */
            if (this.props.kind === 'percent' || this.props.kind === 'simple') {
                content = (
                    <div style={{textAlign: 'center', backgroundColor: this.props.backgroundColor, color: (this.props.backgroundColor === 'white' ? 'black' : 'white'), fontSize: 'x-large'}}>
                        {this.props.value + suffix}
                    </div>
                );
            }
            else if (this.props.kind === 'comparison') {
                content = (
                    <div style={{textAlign: 'center', backgroundColor: this.props.backgroundColor, color: (this.props.backgroundColor === 'white' ? 'black' : 'white')}}>
                        <div style={{display: 'inline', fontSize: 'x-large'}}>{this.props.value + suffix}</div>
                        <div style={{display: 'inline'}}>/{this.props.compareValue + suffix}</div>
                    </div>
                );
            }

            return (
                <div className={this.props.className} style={{minWidth: this.props.width, margin: '5px'}} onClick={this.props.onClick}>
                    <div style={{textAlign: 'center', borderRadius: '8px 8px 0 0', backgroundColor: 'rgb(68, 68, 68)', color: 'white', marginBottom: '2px'}}>{this.props.title}</div>
                    {content}
                    <div style={{textAlign: 'center', borderRadius: '0 0 8px 8px', backgroundColor: 'rgb(68, 68, 68)', color: changeColor, marginTop: '2px'}}>{changePrefix + this.props.change + suffix}</div>
                </div>
            );
        },

    });
    return Indicator;
}));
