// CommonJS, AMD, and Global shim
(function (factory) {
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
        window.UpcomingActions = factory(window.React, window.ActionRow);
    }
}(function (React, ActionRow) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        calcIsUpcomingAction: function (item, index) {
            /**
             * Exclude boxed actions
             */ 
            var boxTags = _.filter(item.tags, function(tag) { return tag.slice(0,1) === '#'; });
            if (boxTags.length > 0) {
                return false;   
            }

            /**
             * Upcoming Action less than 7 days away
             */
            if (item.nextDate !== null) {
                var time = new Date(item.nextDate);
                var now = new Date();
                time.setHours(0,0,0,0);
                now.setHours(0,0,0,0);
                var timeDiff = Math.abs(now.getTime() - time.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (diffDays > 0 && diffDays < 7) {
                    return true;
                }
            }

            /**
             * Not an upcoming action
             */
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
                                    actionName={item.name}
                                    actionLastPerformed={item.nextDate} // use next date in last performed place so that it displays 
                                                                        // when it's coming up instead of when it was last performed
                                                                        // TODO: ActionRow prop should be named something more suitable and generic
                                    actionNextDate={item.nextDate} />
                            );
                        }.bind(this))}
                    </tbody>
                </table>  
            );
        },
        render: function () {

            var upcomingActions,
                upcomingActionsTable;
        
            /**
             * Return null if there are no upcoming actions
             */
            upcomingActions = this.props.actions.filter(this.calcIsUpcomingAction);
            if (upcomingActions.length === 0) {
                return null;
            }
        
            /**
             * Sort the actions by next date and name
             */
            upcomingActions = _.sortBy(upcomingActions, function(action){ 
                return (action.nextDate + '-' + action.name); 
            })

            upcomingActionsTable = this.renderUpcomingActionsTable(upcomingActions); 

            /**
             * Inline Styles
             */
            var headerStyle = { 
                padding: '2px 2px 2px 8px',
                fontWeight: 'bold',
                fontSize: '1.5em'
            };
        
            /**
             * HTML
             */
            return (
                <div>
                    <div style={headerStyle}>
                        <span>Upcoming Actions</span>
                    </div>
                    {upcomingActionsTable}
                </div>
            );
        }
    });
 }));