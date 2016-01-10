(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/PlanStepStore')
    );
}(function (React, planStepStore) {
    var PlanStep = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return {
                planStepsLastUpdated: (new Date()).toISOString()
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            /**
             * Subscribe to Tag Store to be
             * notified of updates to the store
             */
            this.planStepsObserver = planStepStore.updates
                .subscribe(this.handlePlanStepStoreUpdate);

        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.planStepsObserver.dispose();
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handlePlanStepStoreUpdate: function (plans) {
            this.setState({ planStepsLastUpdated: (new Date()).toISOString() });
        },
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

        calculateNewStep: function () {

            var steps = _.where(planStepStore.updates.value, {
                planId: this.props.planId,
                parentId: this.props.data.id
            });

            var nextOrdinal = 1;
            if (steps.length > 0) {
                steps = _.sortBy(steps, function (item) {
                    return item.ordinal;
                });
                steps.reverse();
                nextOrdinal = steps[0].ordinal + 1;
            }

            return {
                id: undefined, // hlcommon.uuid()
                planId: this.props.planId,
                parentId: this.props.data.id,
                name: '+',
                kind: 'Step',
                status: 'Todo',
                created: (new Date()).toISOString(),
                content: null,
                ordinal: nextOrdinal,
                isNew: true
            };
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            /**
             * Inline Styles
             */
            var listItemStyle = {
                fontSize: 'large',
                verticalAlign: 'top'
                //padding: '5px',
                //borderBottom: 'solid 1px #e0e0e0'
            };

            var buttonStyle = {
                paddingTop: '3px',
                paddingBottom: '3px',
                backgroundImage: 'none',
                color: '#444',
                backgroundColor: '#e2ff63',
                borderColor: '#e2ff63',
                fontWeight: 'bold',
                outlineColor: 'rgb(40, 40, 40)'
            };

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
            } else {
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

            var steps = planStepStore.getChildren(this.props.planId, this.props.data.id);
            steps = _.sortBy(steps, function (item) {
                var type = 0;
                if (item.status === 'Doing') {
                    type = 1;
                } else if (item.status === 'Ready') {
                    type = 2;
                } else if (item.status === 'Todo') {
                    type = 3;
                } else if (item.status === 'Done') {
                    type = 4;
                }
                return type + '-' + item.ordinal;
            });

            var stepsDom = steps.map( function (step) {
                return (
                    <PlanStep planId={this.props.planId} data={step} level={this.props.level + 1} />
                );
            }.bind(this));

            if ((!this.props.data.hasOwnProperty('isNew') || !this.props.data.isNew) && this.props.level < 3) {
                stepsDom.push((
                    <PlanStep planId={this.props.planId} data={this.calculateNewStep()} level={this.props.level + 1} />
                ));
            }

            if (this.props.data.status === 'Done') {
                var nameStyle = {
                    textDecoration: 'line-through',
                    backgroundColor: 'rgb(255, 163, 163)'
                };
            } else if (this.props.data.status === 'Doing') {
                var nameStyle = {
                    backgroundColor: '#FFF086'
                };
            } else if (this.props.data.status === 'Ready') {
                var nameStyle = {
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
    return PlanStep;
 }));
