(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('./PlanStep'),
        require('stores/plan-store'),
        require('stores/planstep-store'),
        require('mixins/SubscriberMixin')
    );
}(function (React, PlanStep, planStore, planStepStore, SubscriberMixin) {
    var PlanSteps = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [SubscriberMixin(planStore)],
        getInitialState: function () {
            return {
                storeLastUpdated: (new Date()).toISOString()
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            /**
             * Subscribe globally to additional stores
             */
            planStepStore.subscribe(this.handleStoreUpdate, {});
        },
        componentDidMount: function () {
            $(this.refs.topScroller.getDOMNode()).scroll(function(){
                $(this.refs.bottomScroller.getDOMNode())
                    .scrollLeft($(this.refs.topScroller.getDOMNode()).scrollLeft());
            }.bind(this));
            $(this.refs.bottomScroller.getDOMNode()).scroll(function(){
                $(this.refs.topScroller.getDOMNode())
                    .scrollLeft($(this.refs.bottomScroller.getDOMNode()).scrollLeft());
            }.bind(this));
        },
        componentDidUpdate: function () {
            $(this.refs.topScroller.getDOMNode()).scroll(function(){
                $(this.refs.bottomScroller.getDOMNode())
                    .scrollLeft($(this.refs.topScroller.getDOMNode()).scrollLeft());
            }.bind(this));
            $(this.refs.bottomScroller.getDOMNode()).scroll(function(){
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

        calculateNewStep: function () {
            var steps = planStepStore.getChildren(null, this.props.planId);
            var nextOrdinal = 1;
            if (steps.length > 0) {
                steps = _.sortBy(steps, function (item) {
                    return item.ordinal;
                });
                steps.reverse();
                nextOrdinal = steps[0].ordinal + 1;
            }

            return {
                id: hlcommon.uuid(),
                planId: this.props.planId,
                parentId: null,
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

            // get root level steps for this plan
            var steps = planStepStore.getChildren(null, this.props.planId);
            var childrenCount = 1;

            steps = _.sortBy(steps, function (item) {
                
                var children = planStepStore.getChildren(item.id, item.planId);
                childrenCount += children.length + 1;
                return item.ordinal;
            });

            var planId = this.props.planId;
            var plan = planStore.get(planId);

            if (!plan) {
                window.location.href = '/doozy/actions';
                return <div></div>;
            }

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

            var buttonStyle = {
                paddingTop: '1px',
                paddingBottom: '1px',
                height: '25px',
                margin: '1px 8px 0 0',
                backgroundImage: 'none',
                color: '#444',
                backgroundColor: '#e2ff63',
                borderColor: '#e2ff63',
                fontWeight: 'bold',
                outlineColor: 'rgb(40, 40, 40)'
            };

            var stepsDom = steps.map(function (step) {
                return (
                    <PlanStep planId={this.props.planId} data={step} level={1} />
                );
            }.bind(this));

            stepsDom.push((
                <PlanStep planId={this.props.planId} data={this.calculateNewStep()} level={1} />
            ));

            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>{plan.name}</div>
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
    return PlanSteps;
 }));
