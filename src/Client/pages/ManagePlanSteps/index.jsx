(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('./PlanStep'),
        require('stores/planstep-store')
    );
}(function (React, _, doozy, PlanStep, planStepStore) {
    /* globals $ */
    var ManagePlanSteps = React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            /**
             * Subscribe globally to additional stores
             */
            // TODO: Subscribe by Plan ID so we only pull data for one plan
            planStepStore.subscribe(this.handleStoreUpdate, {});
        },
        componentDidMount: function () {
            if (!this.refs.topScroller) {
                return;
            }
            $(this.refs.topScroller.getDOMNode()).scroll(function () {
                $(this.refs.bottomScroller.getDOMNode())
                    .scrollLeft($(this.refs.topScroller.getDOMNode()).scrollLeft());
            }.bind(this));
            $(this.refs.bottomScroller.getDOMNode()).scroll(function () {
                $(this.refs.topScroller.getDOMNode())
                    .scrollLeft($(this.refs.bottomScroller.getDOMNode()).scrollLeft());
            }.bind(this));
        },
        componentDidUpdate: function () {
            if (!this.refs.topScroller) {
                return;
            }
            $(this.refs.topScroller.getDOMNode()).scroll(function () {
                $(this.refs.bottomScroller.getDOMNode())
                    .scrollLeft($(this.refs.topScroller.getDOMNode()).scrollLeft());
            }.bind(this));
            $(this.refs.bottomScroller.getDOMNode()).scroll(function () {
                $(this.refs.topScroller.getDOMNode())
                    .scrollLeft($(this.refs.bottomScroller.getDOMNode()).scrollLeft());
            }.bind(this));
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            planStepStore.unsubscribe(this.handleStoreUpdate, {});
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleStoreUpdate: function () {
            this.setState({ storeLastUpdated: (new Date()).toISOString() });
        },
        handleCloseClick: function () {
            window.location.href = '/doozy';
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            // get root level steps for this plan
            var planSteps = planStepStore.getPlan(this.props.planId);
            if (!planSteps || !planSteps.length) {
                return <div>Loading...</div>;
            }

            var steps = doozy.filterChildren(planSteps, null);

            var childrenCount = 1;

            steps = _.sortBy(steps, function (item) {
                var children = doozy.filterChildren(planSteps, item.id);
                childrenCount += children.length + 1;
                return item.ordinal;
            });

            var stepsDom = steps.map(function (step) {
                return (
                    <PlanStep planId={this.props.planId} data={step} level={1} steps={planSteps} />
                );
            }.bind(this));

            stepsDom.push((
                <PlanStep planId={this.props.planId} data={doozy.calculateNewPlanStep(null, this.props.planId, planSteps)} steps={planSteps} level={1} />
            ));

            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>{/* TODO: may need to subscribe to planStore for plan.name */}</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div ref="topScroller" style={{ height: '20px', width: '100%', overflowX: 'auto', overflowY: 'hidden'}}>
                        <div id="topScrollerDiv" style={{height: '20px', width: (childrenCount * 190) + 'px'}}></div>
                    </div>
                    <div ref="bottomScroller" style={{ overflowX: 'auto', paddingBottom: '5px' }}>

                        <div style={{ width: (childrenCount * 190) + 'px' }}>
                            <ul style={{listStyle: 'none', padding: '0', margin: '0', overflow: 'hidden', width: '100%'}}>
                                {stepsDom}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    });

    /**
     * Inline Styles
     */
    var headerStyle = {
        display: 'flex',
        flexDirection: 'row',
        color: '#e2ff63',
        backgroundColor: '#444',
        padding: '2px 2px 0 8px',
        fontWeight: 'bold',
        fontSize: '1.5em'
    };

    // var buttonStyle = {
    //     paddingTop: '1px',
    //     paddingBottom: '1px',
    //     height: '25px',
    //     margin: '1px 8px 0 0',
    //     backgroundImage: 'none',
    //     color: '#444',
    //     backgroundColor: '#e2ff63',
    //     borderColor: '#e2ff63',
    //     fontWeight: 'bold',
    //     outlineColor: 'rgb(40, 40, 40)'
    // };

    return ManagePlanSteps;
}));
