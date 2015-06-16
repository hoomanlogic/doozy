// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('./ActionRow'),
            require('../../../../../babble/src/durations')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            './ActionRow',
            '../../../../../babble/src/durations'
        ], factory);
	}
	else {
		// Global (browser)
		root.NextActions = factory(root.React, root.ActionRow, root.babble);
	}
}(this, function (React, ActionRow, babble) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        isNextAction: function (item, index) {
            /**
              * Exclude boxed actions
              */ 
            var boxTags = _.filter(item.tags, function(tag) { return tag.slice(0,1) === '#'; });
            if (boxTags.length > 0) {
                return false;
            }

            /**
              * Next Action has either never been performed or has a Next Date up to today
              */ 
            if ((item.nextDate === null && item.lastPerformed === null) || (item.nextDate !== null && new Date(item.nextDate) <= new Date())) {
                return true;
            }

            /**
              * Keep Actions logged as performed today in Next Actions until tomorrow
              */
            return babble.durations.hourDiff(new Date(item.lastPerformed), new Date()) < 24 && new Date(item.lastPerformed).getDate() === (new Date()).getDate();
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleAddActionClick: function () {
            ui.addAction();  
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        renderNextActionsTable: function (nextActions) {
            return (
                <table className="table table-striped">
                    <tbody>                        
                        {nextActions.map(function(item, index) {
                            return (
                                <ActionRow key={item.id} 
                                    action={item}
                                    actionName={item.name} 
                                    actionLastPerformed={item.lastPerformed} 
                                    actionNextDate={item.nextDate} />
                            );
                        }.bind(this))}
                    </tbody>
                </table>  
            );
        },
        render: function () {

            var nextActionsTable = null,
                nextActions = this.props.actions.filter(this.isNextAction);

            /**
             * Sort the actions by completed and name
             */
            nextActions = _.sortBy(nextActions, function(action){ 
                var checked = 
                    (action.lastPerformed !== null && (action.nextDate === null || 
                                                       new Date(action.nextDate) > new Date()));
                return (checked ? '1' : '0') + '-' + (action.ordinal === null ? '' : action.ordinal + '-') + action.name.toLowerCase(); 
            })

            /**
             * Render the table if there are any actions
             */
            if (nextActions.length > 0) {
                nextActionsTable = this.renderNextActionsTable(nextActions);
            }

            /**
             * Inline Styles
             */
            var headerStyle = { 
                color: '#e2ff63', 
                backgroundColor: '#444', 
                padding: '2px 2px 0 8px',
                fontWeight: 'bold',
                fontSize: '1.5em'
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
        
            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <span>Next Actions</span>
                        <button type="button" style={buttonStyle} className="btn pull-right" onClick={this.handleAddActionClick}>
                            Add a new action
                        </button>
                    </div>
                    {nextActionsTable}
                </div>
            );
        }
    });
 }));