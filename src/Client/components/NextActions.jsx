(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('babble'),
        require('stores/host'),
        require('lodash'),
        require('./ActionRow')
    );
}(function (React, babble, host, _, ActionRow) {
    var NextActions = React.createClass({
        propTypes: {
            actions: React.PropTypes.array.isRequired
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleAddActionClick: function () {
            // ui.addAction();
            host.go('/doozy/action/new');
        },

        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        isNextAction: function (item) {
            /**
             * Exclude boxed actions
             */
            var boxTags = item.tags.filter(function (tag) { return tag.kind === 'Box'; });
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
         * RENDERING
         *************************************************************/
        renderNextActionsTable: function (nextActions) {
            return (
                <table className="table table-striped">
                    <tbody>
                        {nextActions.map(function (item) {
                            return (
                                <ActionRow key={item.id}
                                    action={item}
                                    actionName={item.name}
                                    actionLastPerformed={item.lastPerformed}
                                    actionNextDate={item.nextDate} />
                            );
                        })}
                    </tbody>
                </table>
            );
        },
        render: function () {

            var nextActionsTable = null;
            var nextActions = this.props.actions.filter(this.isNextAction);

            /**
             * Sort the actions by completed and name
             */
            nextActions = _.sortBy(nextActions, function (action) {
                var checked =
                    (action.lastPerformed !== null && (action.nextDate === null ||
                                                       new Date(action.nextDate) > new Date()));
                return (checked ? '1' : '0') + '-' + (action.ordinal === null ? '' : action.ordinal + '-') + action.name.toLowerCase();
            });

            /**
             * Render the table if there are any actions
             */
            if (nextActions.length > 0) {
                nextActionsTable = this.renderNextActionsTable(nextActions);
            }

            // html
            return (
                <div>
                    <div style={styles.header}>
                        <span>Next Actions</span>
                        <button type="button" style={styles.button} className="btn pull-right" onClick={this.handleAddActionClick}>
                            Add a new action
                        </button>
                    </div>
                    {nextActionsTable}
                </div>
            );
        }
    });

    /**
     * Inline Styles
     */
    var styles = {
        header: {
            color: '#e2ff63',
            backgroundColor: '#444',
            padding: '2px 2px 0 8px',
            fontWeight: 'bold',
            fontSize: '1.5em'
        },
        button: {
            paddingTop: '3px',
            paddingBottom: '3px',
            backgroundImage: 'none',
            color: '#444',
            backgroundColor: '#e2ff63',
            borderColor: '#e2ff63',
            fontWeight: 'bold',
            outlineColor: 'rgb(40, 40, 40)'
        }
    };

    return NextActions;
}));
