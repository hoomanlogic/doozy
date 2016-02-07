(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('hl-common-js/src/those'),
        require('stores/tag-store'),
        require('stores/host'),
        require('components/TagList'),
        require('components/ActivePlans'),
        require('components/NextActions'),
        require('components/UpcomingActions'),
        require('components/RecentActivity'),
        require('components/BoxedActions'),
        require('mixins/StoresMixin')
    );
}(function (React, _, those, tagStore, host, TagList, ActivePlans, NextActions,
            UpcomingActions, RecentActivity, BoxedActions, StoresMixin) {
    var ManageLogEntries = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([tagStore])],
        getInitialState: function () {
            return {
                tags: host.context.get().tags || [],
                tagFilter: [],
                tagFilterJoin: 'any'
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Log Entries');
        },
        componentWillReceiveProps: function (nextProps) {
            /**
             * Update the list of log entries for the current
             * focus when the focus changes
             */
            if (nextProps.focusTag !== this.props.focusTag) {
                this.setState({ tags: this.getTags(nextProps.focusTag) });
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
            this.setState({ tags: this.getTags(this.props.focusTag) });
        },
        
        /* eslint-disable no-unused-vars */
        getTags: function (focusTag) {
            var tags = tagStore.context({}).value.slice();
            // TODO: Filter by focus tag (is it a descendant of or associated with focus?)
            return tags;
        },
        /* eslint-enable no-unused-vars */

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderTagFilter: function () {
            var tagFilter;
            var tags = this.state.tags;
            if (tags && tags.length > 0) {
                // Exclude Box Tags which are special tags assigned to actions, not log entries
                tags = tags.filter(function (tag) {
                    return tag.kind !== 'Box';
                });
                
                tagFilter = (
                    <div style={{marginTop: '2px'}}>
                        <ul style={{ marginLeft: '2px'}} className="toggle-switch">
                            <li className={['clickable'].concat(this.state.tagFilterJoin === 'any' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'any')}>Any</li>
                            <li className={['clickable'].concat(this.state.tagFilterJoin === 'all' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'all')}>All</li>
                            <li className={['clickable'].concat(this.state.tagFilterJoin === 'not' ? ['selected'] : []).join(' ')} onClick={this.handleTagsFilterTypeClick.bind(null, 'not')}>Not</li>
                        </ul>
                        <TagList tags={tags}
                          selectedTags={this.state.tagFilter}
                          selectionChanged={this.handleTagFilterClick} />
                    </div>
                );
            }

            return tagFilter;
        },
        render: function () {
            var tagFilter = this.state.tagFilter.slice();
            if (this.props.focusTag) {
                tagFilter.push(this.props.focusTag);
            }
            return (
                <div className={this.props.hidden ? 'hidden' : ''}>
                    {this.renderTagFilter()}
                    <RecentActivity tags={tagFilter} />
                </div>
            );
        }
    });
    return ManageLogEntries;
}));
