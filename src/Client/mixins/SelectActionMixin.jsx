(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('babble'),
        require('app/doozy'),
        require('stores/action-store')
    );
}(function (React, _, babble, doozy, actionStore) {
    /* globals $ */
    var SelectActionMixin = {
        setupActionInput: function () {
            if (!this.refs.action) {
                return;
            }

            $(this.refs.action.getDOMNode()).selectize({
                delimiter: '|',
                persist: true,
                create: function (input) {
                    return {
                        value: input,
                        text: input
                    };
                },
                maxItems: 1,
                openOnFocus: false,
                onChange: function (value) {
                    var state = {};

                    // Get action from cache (if it isn't a new action)
                    var existingAction = actionStore.get(value);
                    if (existingAction) {
                        state.actionId = existingAction.id;

                        // Default the action's duration if duration isn't already set
                        if (!this.state.duration) {
                            // set default duration if it is not already set
                            var duration = new babble.Duration(existingAction.duration * 60000);
                            if (duration.toMinutes() > 0) {
                                Object.assign(state, {
                                    duration: duration.toMinutes(),
                                    durationInput: duration.toString(),
                                    durationFeedback: duration.toString()
                                });
                            }
                        }

                        // display action tags
                        state.actionTags = [].concat(existingAction.tags);
                    }

                    if (state.actionId || state.duration) {
                        this.setState(state);
                    }

                }.bind(this)
            });
            
            // populate existing action option
            var selectize = $(this.refs.action.getDOMNode())[0].selectize;
            this.setOptionsAction(selectize);

            // Set value from state
            selectize.setValue(this.state.actionId || this.state.actionName || this.state.entityId);
        },
        setOptionsAction: function (selectActions) {
            if (!actionStore.context({}) || !actionStore.context({}).value) {
                return;
            }

            // clear previously set options
            selectActions.clearOptions();

            // get actions sorted by name
            var actions = _.sortBy(actionStore.context({}).value, function (action) {
                return action.name;
            });

            // add actions to selection control
            actions.forEach( function (action) {
                selectActions.addOption({
                    value: action.id,
                    text: action.name
                });
            });
        },

        renderActionInput: function () {
            return (
                <div className="form-group">
                    <label htmlFor="f1">Action</label>
                    <input id="f1" ref="action" type="text" />
                    <span>{(this.state.actionTags || []).join(',')}</span>
                </div>
            );
        }
    };
    return SelectActionMixin;
}));
