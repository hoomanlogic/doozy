(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('hl-common-js/src/those'),
        require('stores/action-store'),
        require('stores/host'),
        require('components/TagList'),
        require('components/ActivePlans'),
        require('components/NextActions'),
        require('components/UpcomingActions'),
        require('components/RecentActivity'),
        require('components/BoxedActions'),
        require('mixins/StoresMixin')
    );
}(function (React, _, those, actionStore, host, TagList, ActivePlans, NextActions,
            UpcomingActions, RecentActivity, BoxedActions, StoresMixin) {
    var ManageActions = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([actionStore])],
        getInitialState: function () {
            return {
                focusActions: [],
                tags: [],
                tagFilter: [],
                tagFilterJoin: 'any'
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Actions');
        },
        componentWillReceiveProps: function (nextProps) {
            /**
             * Update the list of actions for the current
             * focus when the focus changes
             */
            if (nextProps.focusTag !== this.props.focusTag) {
                this.updateActions(nextProps.focusTag);
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleTagsFilterTypeClick: function (filterJoin) {
            if (filterJoin !== this.state.tagFilterJoin) {
                this.setState({ tagFilterJoin: filterJoin });
            }
        },
        handleTagFilterClick: function (tag) {
            var tagFilter = this.state.tagFilter;

            /**
             * Toggle tag selection
             */
            those(tagFilter).toggle(tag);

            /**
             * Update filter state
             */
            this.setState({tagFilter: tagFilter});

            /**
             * Update globally accessible default tags
             */
            host.context.set({
                tags: tagFilter
            });
        },

        handleStoresMixinUpdate: function () {
            this.updateActions(this.props.focusTag);
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
        filterActionsByTag: function (actions, tags, filterJoin) {
            // no filter, return all
            if (typeof tags === 'undefined' || tags === null || tags.length === 0) {
                return actions;
            }

            if (typeof filterJoin !== 'string') {
                filterJoin = 'any'; // eslint-disable-line no-param-reassign
            }

            // filter is a string, convert to array
            if (typeof tags === 'string') {
                tags = [tags]; // eslint-disable-line no-param-reassign
            }

            // get actions that match at least one of the filter tags
            switch (filterJoin) {
                case 'any':
                    return actions.filter(function (item) { return _.intersection(tags, item.tags).length > 0; });
                case 'all':
                    return actions.filter(function (item) { return _.intersection(tags, item.tags).length === tags.length; });
                case 'not':
                    return actions.filter(function (item) { return _.intersection(tags, item.tags).length === 0; });
                default:
                    throw new Error('filterJoin must be \'any\', \'all\' or \'not\'.');
            }
        },
        filterActionsByFocus: function (focusTag) {
            if (focusTag) {
                return actionStore.getCache().filter(function (action) {
                    if (action.tags.indexOf(focusTag) > -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }, this);
            }
            else {
                return actionStore.getCache();
            }
        },

        updateActions: function (focusTag) {
            var focusActions = this.filterActionsByFocus(focusTag);
            var tags = this.getFocusTags(focusActions, focusTag);
            var tagFilter = _.intersection(this.state.tagFilter, tags);
            this.setState({
                focusActions: focusActions,
                tags: tags,
                tagFilter: tagFilter
            });
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
                            <li className={['clickable'].concat(this.state.tagFilterJoin === 'any' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'any')}>Any</li>
                            <li className={['clickable'].concat(this.state.tagFilterJoin === 'all' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'all')}>All</li>
                            <li className={['clickable'].concat(this.state.tagFilterJoin === 'not' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'not')}>Not</li>
                        </ul>
                        <TagList tags={this.state.tags}
                          selectedTags={this.state.tagFilter}
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
            var tagsFilteredFocusActions = this.filterActionsByTag(this.state.focusActions, this.state.tagFilter, this.state.tagFilterJoin);

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
