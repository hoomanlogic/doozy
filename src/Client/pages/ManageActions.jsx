(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('hl-common-js/src/those'),
        require('stores/ActionStore'),
        require('stores/host'),
        require('components/TagList'),
        require('components/ActivePlans'),
        require('components/NextActions'),
        require('components/UpcomingActions'),
        require('components/RecentActivity'),
        require('components/BoxedActions')
    );
}(function (React, _, those, actionStore, host, TagList, ActivePlans, NextActions, UpcomingActions, RecentActivity, BoxedActions) {
    var ManageActions = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return {
                focusActions: [],
                tags: [],
                tagsFilter: [],
                tagsFilterType: 'any'
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            /**
             * Subscribe to Action Store to be
             * notified of updates to the store
             */
            this.actionsObserver = actionStore.updates
                .subscribe(this.handleActionStoreUpdate);
            host.setTitle('Actions');
        },
        componentWillReceiveProps: function (nextProps) {
            /**
             * Update the list of actions for the current
             * focus when the focus changes
             */
            if (nextProps.focusTag !== this.props.focusTag) {
                this.handleActionStoreUpdate(actionStore.updates.value, nextProps.focusTag, true);
            }
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.actionsObserver.dispose();
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleTagsFilterTypeClick: function (type) {
            if (type !== this.state.tagsFilterType) {
                this.setState({ tagsFilterType: type });
            }
        },
        handleTagFilterClick: function (tag) {
            var tagsFilter = this.state.tagsFilter;

            /**
             * Toggle tag selection
             */
            those(tagsFilter).toggle(tag);

            /**
             * Update filter state
             */
            this.setState({tagsFilter: tagsFilter});

            /**
             * Update globally accessible default tags
             */
            host.setContext({
                tags: tagsFilter
            });
        },

        handleActionStoreUpdate: function (actions, focusTag, focusChange) {
            /**
             * actionsObserver does not pass focusTag
             * so we default to the props.focusTag
             * but when we receive new props we
             * need to pass those props (componentWillReceiveProps)
             */
            if (!focusChange && typeof focusTag === 'undefined') {
                focusTag = this.props.focusTag; // eslint-disable-line no-param-reassign
            }

            /**
             * Filter actions in store to those that belong to this focus
             */
            var focusActions;
            if (focusTag) {
                focusActions = actions.filter(function (action) {
                    if (action.tags.indexOf(focusTag) > -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }, this);
            }
            else {
                focusActions = [].concat(actions);
            }

            /**
             * Update state
             */
            var tags = this.getFocusTags(focusActions, focusTag);
            var tagsFilter = _.intersection(this.state.tagsFilter, tags);
            this.setState({
                focusActions: focusActions,
                tags: tags,
                tagsFilter: tagsFilter
            });

            /**
             * Reset globally accessible default tags
             */
            window['ui'] = window['ui'] || {};
            window['ui'].tags = [];
        },

        /*************************************************************
         * HELPERS
         *************************************************************/
        getFocusTags: function (focusActions) {

            var distinctTags = [];

            /**
             * Get all distinct tags of all this focus'
             * actions except for the special tags
             */
            var specialPrefixes = ['!','#'];
            focusActions.map(function (action) {
                distinctTags = _.union(distinctTags, _.reject(action.tags, function (tag) {
                    return specialPrefixes.indexOf(tag.slice(0,1)) > -1;
                }));
            });

            /**
             * Return sorted tags
             */
            return distinctTags.sort();
        },
        filterActions: function (actions, tags, type) {
            // no filter, return all
            if (typeof tags === 'undefined' || tags === null || tags.length === 0) {
                return actions;
            }

            if (typeof type !== 'string') {
                type = 'any'; // eslint-disable-line no-param-reassign
            }

            // filter is a string, convert to array
            if (typeof tags === 'string') {
                tags = [tags]; // eslint-disable-line no-param-reassign
            }

            // get actions that match at least one of the filter tags
            if (type === 'any') {
                return actions.filter(function (item) { return _.intersection(tags, item.tags).length > 0; });
            }
            else if (type === 'all') {
                return actions.filter(function (item) { return _.intersection(tags, item.tags).length === tags.length; });
            }
            else if (type === 'not') {
                return actions.filter(function (item) { return _.intersection(tags, item.tags).length === 0; });
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderTagFilter: function () {
            var tagFilter;

            if (this.state.tags && this.state.tags.length > 0) {
                tagFilter = (
                    <div style={{marginTop: '2px'}}>
                        <ul style={{ marginLeft: '2px'}} className="toggle-switch">
                            <li className={['clickable'].concat(this.state.tagsFilterType === 'any' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'any')}>Any</li>
                            <li className={['clickable'].concat(this.state.tagsFilterType === 'all' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'all')}>All</li>
                            <li className={['clickable'].concat(this.state.tagsFilterType === 'not' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'not')}>Not</li>
                        </ul>
                        <TagList tags={this.state.tags}
                          selectedTags={this.state.tagsFilter}
                          selectionChanged={this.handleTagFilterClick} />
                    </div>
                );
            }

            return tagFilter;
        },
        render: function () {
            /**
             * Filter focus actions by the tags filter to pass filtered list to children
             */
            var tagsFilteredFocusActions = this.filterActions(this.state.focusActions, this.state.tagsFilter, this.state.tagsFilterType);

            return (
                <div className={this.props.hidden ? 'hidden' : ''}>
                    {this.renderTagFilter()}
                    <NextActions actions={tagsFilteredFocusActions} />
                    <ActivePlans focusTag={this.props.focusTag} />
                    <UpcomingActions actions={tagsFilteredFocusActions} />
                    <BoxedActions actions={tagsFilteredFocusActions} />
                    <RecentActivity actions={tagsFilteredFocusActions} />
                </div>
            );
        }
    });
    return ManageActions;
}));
