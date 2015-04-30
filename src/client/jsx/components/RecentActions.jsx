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
		root.RecentActions = factory(root.React, root.ActionRow, root.hldatetime);
	}
}(this, function (React, ActionRow, hldatetime) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return { 
                showAll: false 
            };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleShowAllClick: function () {
            this.setState({ 
                showAll: true 
            });
        },

        /*************************************************************
         * CALCULATIONS
         *************************************************************/

        /**
         * A Recent Action has been performed at least 24  
         * hours ago and is not at or past the Next Date
         */
        isRecentAction: function (item, index) {
            /**
              * Indicators that it is a Next Actions means it is not a Recent Action
              */
            if (_.isNull(item.lastPerformed) || (item.nextDate !== null && item.nextDate <= new Date())) {
              return false;
            }

            /**
              * Was performed at least 24 hours ago
              */
            return hldatetime.hourDiff(new Date(item.lastPerformed), new Date()) >= 24;
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var recentActions = this.props.actions.filter(this.isRecentAction);

            /** 
              * Sort actions by the most recently performed
              */
            recentActions = _.sortBy(recentActions, function(action){ 
                return action.lastPerformed.toISOString() + '-' + action.name.toLowerCase(); 
            })
            recentActions.reverse();

            // show all logged actions
            var domShowAll = null;
            if (!this.state.showAll && recentActions.length > 10) {
                recentActions = recentActions.slice(0, 10);
                domShowAll = (
                    <a href="javascript:;" style={{ position: 'relative', top: '-20px', left: '30px'}} onClick={this.handleShowAllClick}>Show All Recent Actions</a>
                );    
            }

            if (recentActions.length === 0) {
                return null;        
            }

            // html
            return (
                <div>
                    <div className="table-title">Recent Actions<button type="button" style={{ paddingTop: '3px', paddingBottom: '3px' }} className="btn btn-primary pull-right" onClick={ui.logAction}><i className="fa fa-plus"></i> Log Action</button></div>
                    <table className="table table-striped">
                        <tbody>                        
                            {recentActions.map(function(item, index) {
                                return (
                                    <ActionRow key={item.ref} 
                                        action={item} 
                                        actionRef={item.ref} 
                                        actionId={item.id} 
                                        actionName={item.name} 
                                        actionRetire={item.retire} 
                                        actionLastPerformed={item.lastPerformed} 
                                        actionNextDate={item.nextDate} />
                                );
                            }.bind(this))}
                        </tbody>
                    </table>
                    {domShowAll}
                </div>
            );
        }
    });
 }));