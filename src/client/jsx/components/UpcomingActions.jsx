/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('./ActionRow'),
            require('../../../../../common_js/src/datetime')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            './ActionRow',
            '../../../../../common_js/src/datetime'
        ], factory);
	}
	else {
		// Global (browser)
		root.UpcomingActions = factory(root.React, root.ActionRow, root.hldatetime);
	}
}(this, function (React, ActionRow, hldatetime) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        isUpcomingAction: function (item, index) {
            /**
              * Exclude boxed actions
              */ 
            var boxTags = _.filter(item.tags, function(tag) { return tag.slice(0,1) === '#'; });
            if (boxTags.length > 0) {
                return false;   
            }

            /**
              * Upcoming Action
              */ 
            if (item.nextDate !== null && item.nextDate > new Date()) {
                return true;
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderUpcomingActionsTable: function (upcomingActions) {
            return (
                <table className="table table-striped">
                    <tbody>                        
                        {upcomingActions.map(function(item, index) {
                            return (
                                <ActionRow key={item.ref || item.id} 
                                    action={item} 
                                    actionRef={item.ref} 
                                    actionId={item.id} 
                                    actionName={item.name} 
                                    actionRetire={item.retire} 
                                    actionLastPerformed={item.nextDate} 
                                    actionNextDate={item.nextDate} />
                            );
                        }.bind(this))}
                    </tbody>
                </table>  
            );
        },
        render: function () {

            var upcomingActionsTable = null,
                upcomingActions = this.props.actions.filter(this.isUpcomingAction);

            /**
              * Sort the actions by date and name
              */
            upcomingActions = _.sortBy(upcomingActions, function(action){ 
                return (action.nextDate.toISOString() + '-' + action.name); 
            })

            /**
              * Render the table if there are any actions
              */
            if (upcomingActions.length > 0) {
                upcomingActionsTable = this.renderUpcomingActionsTable(upcomingActions); 
            }

            // html
            return (
                <div>
                    <div className="table-title">
                        Upcoming Actions
                    </div>
                    {upcomingActionsTable}
                </div>
            );
        }
    });
 }));