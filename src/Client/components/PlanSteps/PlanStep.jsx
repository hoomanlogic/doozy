(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy')
    );
}(function (React, _, doozy) {
    var PlanStep = React.createClass({
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCardClick: function () {
            // Build hierarchical path
            var path = this.props.data.planId;
            if (this.props.data.planId !== (this.props.data.parentId || this.props.data.planId)) {
                path += '/' + this.props.data.parentId;
            }
            // New or existing
            if (!this.props.data.isNew) {
                window.location.href = '/doozy/planstep/' + path + '/' + this.props.data.id;
            }
            else {
                window.location.href = '/doozy/planstep/' + path + '/new';
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var nameStyle;

            var stepStyles = [
                {},
                {
                    background: '#aed9e9',
                    border: 'solid 1px #8fcbe3',
                    color: '#274e5b',
                    width: '180px',
                    minWidth: '180px',
                    height: '120px'
                },
                {
                    background: '#f4e459',
                    border: 'solid 1px #e8cf01',
                    color: '#635207',
                    width: '180px',
                    minWidth: '180px',
                    height: '120px',
                    overflow: 'auto'
                },
                {
                    background: '##fff',
                    border: 'solid 1px #cecece',
                    color: '#4f4f4f',
                    width: '180px',
                    minWidth: '180px',
                    height: '120px'
                },
            ];

            var newStepStyle = {
                opacity: '0.5',
                borderStyle: 'dashed',
                textAlign: 'center',
                verticalAlign: 'middle'
            };

            if (this.props.level > 2) {
                Object.assign(newStepStyle, {
                    height: '40px'
                });
            }
            else {
                Object.assign(newStepStyle, {
                    width: '40px',
                    minWidth: '40px',
                    paddingTop: '45px'
                });
            }

            var childStepsStyles = [
                {},
                {
                    display: 'inline-block'
                },
                {
                    display: 'inline-block'
                },
                {
                    display: 'block'
                }
            ];
            
            var steps = doozy.filterChildren(this.props.steps, this.props.data.id);
            steps = _.sortBy(steps, function (item) {
                var type = 0;
                if (item.status === 'Doing') {
                    type = 1;
                }
                else if (item.status === 'Ready') {
                    type = 2;
                }
                else if (item.status === 'Todo') {
                    type = 3;
                }
                else if (item.status === 'Done') {
                    type = 4;
                }
                return type + '-' + item.ordinal;
            });

            var stepsDom = steps.map( function (step) {
                return (
                    <PlanStep planId={this.props.planId} data={step} level={this.props.level + 1} steps={this.props.steps} />
                );
            }.bind(this));

            if ((!this.props.data.hasOwnProperty('isNew') || !this.props.data.isNew) && this.props.level < 3) {
                stepsDom.push((
                    <PlanStep planId={this.props.planId} data={this.calculateNewPlanStep(this.props.data.id, this.props.planId, this.props.steps)} level={this.props.level + 1} steps={this.props.steps} />
                ));
            }

            if (this.props.data.status === 'Done') {
                nameStyle = {
                    textDecoration: 'line-through',
                    backgroundColor: 'rgb(255, 163, 163)'
                };
            }
            else if (this.props.data.status === 'Doing') {
                nameStyle = {
                    backgroundColor: '#FFF086'
                };
            }
            else if (this.props.data.status === 'Ready') {
                nameStyle = {
                    backgroundColor: '#E2FF63'
                };
            }

            return (
                <li key={this.props.data.id} style={Object.assign({}, listItemStyle, childStepsStyles[this.props.level])}>
                    <div className="clickable" onClick={this.handleCardClick}>
                        <div style={Object.assign({}, stepStyles[this.props.level], {padding: '5px', margin: '5px'}, (this.props.data.hasOwnProperty('isNew') && this.props.data.isNew ? newStepStyle : null))}>
                            <span style={nameStyle}>{this.props.data.name}</span>
                        </div>
                    </div>
                    <ul style={{listStyle: 'none', padding: '0', margin: '0'}}>
                        {stepsDom}
                    </ul>
                </li>
            );
        }
    });
    
    /**
     * Inline Styles
     */
    var listItemStyle = {
        fontSize: 'large',
        verticalAlign: 'top'
        // padding: '5px',
        // borderBottom: 'solid 1px #e0e0e0'
    };

    // var buttonStyle = {
    //     paddingTop: '3px',
    //     paddingBottom: '3px',
    //     backgroundImage: 'none',
    //     color: '#444',
    //     backgroundColor: '#e2ff63',
    //     borderColor: '#e2ff63',
    //     fontWeight: 'bold',
    //     outlineColor: 'rgb(40, 40, 40)'
    // };
    
    return PlanStep;
}));
