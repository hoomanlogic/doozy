/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('../../js/stores/ActionStore'), 
            require('./TagList'),
            require('./NextActions'),
            require('./UpcomingActions'),
            require('./RecentActions'),
            require('./BoxedActions')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react', 
            '../../js/stores/ActionStore', 
            './TagList',
            './NextActions',
            './UpcomingActions',
            './RecentActions',
            './BoxedActions'
        ], factory);
	}
	else {
		// Global (browser)
		root.FocusActions = factory(
            root.React, 
            root.actionStore, 
            root.TagList, 
            root.NextActions, 
            root.UpcomingActions, 
            root.RecentActions, 
            root.BoxedActions
        );
	}
}(this, function (React, actionStore, TagList, NextActions, UpcomingActions, RecentActions, BoxedActions) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return { 
                focusActions: [],
                tags: [],
                tagsFilter: [],
                tagsFilterType: 'any'
            };
        },

        componentWillMount: function () {
            /**
             * Subscribe to Action Store to be 
             * notified of updates to the store
             */
            this.actionsObserver = actionStore.updates
                .subscribe(this.handleActionStoreUpdate);
        },
        componentWillReceiveProps: function (nextProps) {
            /**
             * Update the list of actions for the current 
             * focus when the focus changes
             */
            if (nextProps.focusTag !== this.props.focusTag) {
                this.handleActionStoreUpdate(actionStore.updates.value, nextProps.focusTag);
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
        handleTagFilterClick: function(tag) {
            var tagsFilter = this.state.tagsFilter;

            /**
             * Toggle tag selection (remove if exists, add if doesn't)
             */
            if (_.contains(tagsFilter, tag)) {
                tagsFilter.splice(_.indexOf(tagsFilter, tag), 1);
            } else {
                tagsFilter.push(tag);
            }

            /**
             * Update filter state
             */
            this.setState({tagsFilter: tagsFilter});

            /**
             * Update globally accessible default tags
             */
            window['ui'] = window['ui'] || {};
            window['ui'].tags = tagsFilter;
        },

        handleActionStoreUpdate: function (actions, focusTag) {
            /**
             * actionsObserver does not pass focusTag
             * so we default to the props.focusTag
             * but when we receive new props we 
             * need to pass those props (componentWillReceiveProps)
             */
            if (typeof focusTag === 'undefined') {
                focusTag = this.props.focusTag;
            }

            /**
             * Filter actions in store to those that belong to this focus
             */
            var focusActions = actions.filter(function (action) {
                if (action.tags.indexOf(focusTag) > -1) {
                    return action.kind !== 'Flow' && action.kind !== 'Block';
                } else {
                    return false;   
                }
            }, this);

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
        getFocusTags: function (focusActions, focusTag) {

            var distinctTags = [];

            /**
             * Get all distinct tags of all this focus' 
             * actions except for the special tags
             */
            var specialPrefixes = ['!','#'];
            focusActions.map(function(action) {
                distinctTags = _.union(distinctTags, _.reject(action.tags, function (tag) { 
                    return specialPrefixes.indexOf(tag.slice(0,1)) > -1; 
                }));
            });

            /**
             * Return sorted tags
             */
            return distinctTags.sort();
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var tagFilterTypeDom,
                tagListDom;
            
            if (this.state.tags && this.state.tags.length > 0) {
                tagFilterTypeDom = (
                    <ul style={{ marginLeft: '2px'}} className="toggle-switch">
                        <li className={'clickable' + (this.state.tagsFilterType === 'any' ? ' selected' : '')} onClick={this.handleTagsFilterTypeClick.bind(null, 'any')}>Any</li>
                        <li className={'clickable' + (this.state.tagsFilterType === 'all' ? ' selected' : '')} onClick={this.handleTagsFilterTypeClick.bind(null, 'all')}>All</li>
                        <li className={'clickable' + (this.state.tagsFilterType === 'not' ? ' selected' : '')} onClick={this.handleTagsFilterTypeClick.bind(null, 'not')}>Not</li>
                    </ul>
                );
                tagListDom = (
                    <TagList tags={this.state.tags} 
                          selectedTags={this.state.tagsFilter} 
                          selectionChanged={this.handleTagFilterClick} />
                );
            }
            
            /**
             * Filter focus actions by the tags filter to pass filtered list to children
             */
            var tagsFilteredFocusActions = hlapp.filterActions(this.state.focusActions, this.state.tagsFilter, this.state.tagsFilterType);

            return (
                <div>
                    {tagFilterTypeDom}
                    {tagListDom}
                    <NextActions actions={tagsFilteredFocusActions} />
                    <UpcomingActions actions={tagsFilteredFocusActions} />
                    <RecentActions actions={tagsFilteredFocusActions} />
                    <BoxedActions actions={tagsFilteredFocusActions} />
                </div>
            );
        }
    });
}));