/**
 * ContentEditable
 */
(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('react/addons')
    );
}(function (React, addons) {
    var ContentEditable = React.createClass({
        /***********************************
        * DEFINITIONS
        ***********************************/
        mixins: [addons.PureRenderMixin],

        /***********************************
        * EVENT HANDLING
        ***********************************/
        emitChange: function () {
            var html = this.getDOMNode().innerHTML;
            if (this.props.onChange && html !== this.lastHtml) {
                this.props.onChange({
                    target: {
                        id: this.props.id || null,
                        value: html
                    }
                });
            }
            this.lastHtml = html;
        },

        /***********************************
        * RENDERING
        ***********************************/
        render: function () {
            return (
                <div
                    style={Object.assign({display: 'inline'}, this.props.style)}
                    onInput={this.emitChange}
                    onBlur={this.emitChange}
                    contentEditable
                    dangerouslySetInnerHTML={{__html: this.props.html}}></div>
            );
        }
    });

    return ContentEditable;
}));
