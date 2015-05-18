/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('./ActionRow')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            './ActionRow',
        ], factory);
	}
	else {
		// Global (browser)
		root.UpcomingActions = factory(root.React, root.ActionRow);
	}
}(this, function (React, ActionRow) {
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
            
            if (item.nextDate !== null) {
                var time = new Date(item.nextDate);
                var now = new Date();
                var timeDiff = Math.abs(now.getTime() - time.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (diffDays < 7) {
                    return true;
                }
            }
            
            return false;
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
                                <ActionRow key={item.id} 
                                    overrideIsDone={false}
                                    action={item} 
                                    actionId={item.id} 
                                    actionName={item.name}
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
                return ((new Date(action.nextDate)).toISOString() + '-' + action.name); 
            })

            /**
              * Return null if there are no upcoming actions
              */
            if (upcomingActions.length === 0) {
                return null;
            }
        
            upcomingActionsTable = this.renderUpcomingActionsTable(upcomingActions); 

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