(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('stores/host'),
        require('stores/tag-store'),
        require('mixins/StoresMixin')
    );
}(function (React, _, host, tagStore, StoresMixin) {
    var ManageTags = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([tagStore])],

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            host.go('/doozy');
        },
        handleTagClick: function (tag) {
            host.go('/doozy/tag/' + tag.id);
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderTagIcon: function (tag) {
            var tagIcon = 'fa-tag';

            if (tag.kind === 'Focus') {
                tagIcon = 'fa-eye';
            }
            else if (tag.kind === 'Place') {
                tagIcon = 'fa-anchor';
            }
            else if (tag.kind === 'Goal') {
                tagIcon = 'fa-trophy';
            }
            else if (tag.kind === 'Need') {
                tagIcon = 'fa-recycle';
            }
            else if (tag.kind === 'Box') {
                tagIcon = 'fa-cube';
            }
            return (
                <i className={'fa ' + tagIcon} style={{ width: '20px', textAlign: 'center' }}></i>
            );
        },
        render: function () {


            var ctxTags = tagStore.context({});
            if (!ctxTags || !ctxTags.value) {
                return <div>Loading...</div>;
            }

            /**
             * Sort the actions by completed and name
             */
            var tags = _.sortBy(ctxTags.value, function (tag) {
                return tag.kind + '-' + tag.name.toLowerCase();
            });

            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Tags</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {tags.map(function (item) {
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

    return ManageTags;
}));
