/**
 * DropdownMenu
 * ClassNames: dropdown, dropdown-[default,primary,success,info,warning,danger], dropdown-menu, open
 * Dependencies: jQuery, Bootstrap(CSS)
 */
 (function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('jquery')
    );
 }(function (React, $) {
    var DropdownMenu = React.createClass({
        /***********************************
         * DEFINITIONS
         ***********************************/
        propTypes: {
            className: React.PropTypes.string,
            dropDownMenuStyle: React.PropTypes.object,
            buttonContent: React.PropTypes.object,
            menuItems: React.PropTypes.array,
            open: React.PropTypes.bool,
            style: React.PropTypes.object,
            useDiv: React.PropTypes.bool
        },

        getDefaultProps: function () {
            return {
              className: '',
              dropDownMenuStyle: null,
              buttonContent: null,
              menuItems: [],
              open: false,
              style: null,
              useDiv: false
            };
        },

        /***********************************
         * EVENT HANDLING
         ***********************************/
        handleToggle: function () {
            var $win = $(window);
            var $box = $(this.refs.dropdown.getDOMNode());

            var handler = function(event) {
                // handle click outside of the dropdown
                if ($box.has(event.target).length == 0 && !$box.is(event.target)) {
                  $box.removeClass('open');
                  $win.off("click.Bst", handler);
                }
            };

            $box.toggleClass('open');
            $win.on("click.Bst", handler);
        },

        /***********************************
         * RENDERING
         ***********************************/
        render: function () {
            var className = this.props.className;
            var buttonContent = this.props.buttonContent;
            var style = this.props.style;
            var menuItems = this.props.menuItems;

            if (className.length > 0) {
              className = ' ' + className;
            }

            if (this.props.useDiv === true) {
                return (
                    <div ref="dropdown" className={'dropdown' + className} onClick={this.handleToggle}>
                        <a href="#" data-toggle="dropdown" className="dropdown-toggle" style={style}>{buttonContent}</a>
                        <ul className="dropdown-menu" style={this.props.dropDownMenuStyle}>
                          {menuItems}
                        </ul>
                    </div>
                );
            } else {
                return (
                    <li ref="dropdown" className={'dropdown' + className} onClick={this.handleToggle}>
                        <a href="#" data-toggle="dropdown" className="dropdown-toggle" style={style}>{buttonContent}</a>
                        <ul className="dropdown-menu" style={this.props.dropDownMenuStyle}>
                          {menuItems}
                        </ul>
                    </li>
                );
            }

        }
    });
    return DropdownMenu;
}));
