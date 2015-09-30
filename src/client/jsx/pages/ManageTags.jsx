// CommonJS, AMD, and Global shim
(function (factory) {
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('react'),
            require('../../js/stores/TagStore')
        );
    }
    else {
        // Global (browser)
        window.ManageTags = factory(
            window.React,
            window.tagStore
        );
    }
}(function (React, tagStore) {
    return React.createClass({

        getInitialState: function () {
            return {
                tagsLastUpdated: (new Date()).toISOString()
            };
        },

        componentWillMount: function () {
            /**
             * Subscribe to Tag Store to be
             * notified of updates to the store
             */
            this.tagsObserver = tagStore.updates
                .subscribe(this.handleTagStoreUpdate);

        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.tagsObserver.dispose();
        },


        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            ui.goBack();
        },
        handleTagClick: function (tag) {
            ui.goTo('Manage Tag', {tagId: tag.id});
        },
        handleTagStoreUpdate: function (tags) {
            this.setState({ tagsLastUpdated: (new Date()).toISOString() });
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderTagIcon: function (tag) {
            var tagIcon = 'fa-tag';

            if (tag.kind === 'Focus') {
                tagIcon = 'fa-eye';
            } else if (tag.kind === 'Place') {
                tagIcon = 'fa-anchor';
            } else if (tag.kind === 'Goal') {
                tagIcon = 'fa-trophy';
            } else if (tag.kind === 'Need') {
                tagIcon = 'fa-recycle';
            } else if (tag.kind === 'Box') {
                tagIcon = 'fa-cube';
            }
            return (
                <i className={"fa " + tagIcon} style={{ width: '20px', textAlign: 'center' }}></i>
            );
        },
        render: function () {

            var tags = tagStore.updates.value;

            /**
             * Sort the actions by completed and name
             */
            tags = _.sortBy(tags, function(tag) {
                return tag.kind + '-' + tag.name.toLowerCase();
            })

            /**
             * Inline Styles
             */
            var headerStyle = {
                display: 'flex',
                flexDirection: 'row',
                color: '#e2ff63',
                backgroundColor: '#444',
                padding: '2px 2px 0 8px',
                fontWeight: 'bold',
                fontSize: '1.5em'
            };

            var tagStyle = {
                fontSize: 'large',
                padding: '5px',
                borderBottom: 'solid 1px #e0e0e0'
            };

            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Tags</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {tags.map(function(item, index) {
                            return (
                                <div key={item.id} className="clickable" style={tagStyle} onClick={this.handleTagClick.bind(null, item)}>
                                    {this.renderTagIcon(item)}<span> {item.name}</span>
                                </div>
                            );
                        }.bind(this))}
                    </div>
                </div>
            );
        }
    });
 }));
