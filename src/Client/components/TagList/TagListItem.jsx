(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('app/doozy')
    );
}(function (React, doozy) {
    var TagListItem = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [React.addons.PureRenderMixin],
        propTypes: {
            // required
            tag: React.PropTypes.object.isRequired,
            
            // optional
            handleClick: React.PropTypes.func,
            isSelected: React.PropTypes.bool,
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getDefaultProps: function () {
            return {
                isSelected: false
            };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleClick: function () {
            if (typeof this.props.handleClick === 'function') {
                this.props.handleClick();
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var tag = this.props.tag;
            var isSelected = this.props.isSelected ? ' ' + 'selected' : '';
            var domTag = <span> {tag.name}</span>;

            return (
                <li onClick={this.handleClick} className={'tag-item' + ' ' + 'clickable' + isSelected} >
                    <i className={'fa ' + doozy.classNameFromTagKind(tag.kind)}></i>{domTag}
                </li>
            );
        },
    });
    return TagListItem;
}));
