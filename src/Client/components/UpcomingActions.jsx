(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('hl-common-js/src/those'),
        require('./ActionRow')
    );
}(function (React, those, ActionRow) {
    var UpcomingActions = React.createClass({
        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        calcIsUpcomingAction: function (item) {
            /**
             * Exclude boxed actions
             */
            var boxTags = item.tags.filter(function (tag) { return tag.kind === 'Box'; });
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
                        {upcomingActions.map(function (item) {
                            return (
                                <ActionRow key={item.id}
                                    overrideIsDone={false}
                                    action={item}
                                    actionName={item.name}
                                    actionLastPerformed={item.nextDate} // use next date in last performed place so that it displays
                                                                        // when its coming up instead of when it was last performed
                                                                        // TODO: ActionRow prop should be named something more suitable and generic
                                    actionNextDate={item.nextDate} />
                            );
                        })}
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
            upcomingActions = those(upcomingActions).order(function (action) {
                return (action.nextDate + '-' + action.name);
            });

            upcomingActionsTable = this.renderUpcomingActionsTable(upcomingActions);

            /**
             * HTML
             */
            return (
                <div>
                    <div style={styles.header}>
                        <span>Upcoming Actions</span>
                    </div>
                    {upcomingActionsTable}
                </div>
            );
        }
    });

    /**
        * Inline Styles
        */
    var styles = {
        header: {
            padding: '2px 2px 2px 8px',
            fontWeight: 'bold',
            fontSize: '1.5em'
        }
    };

    return UpcomingActions;
}));
