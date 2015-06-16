// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react'
        ], factory);
	}
	else {
		// Global (browser)
		window.TagListItem = factory(window.React);
	}
}(function (React) {
    'use strict';
    return React.createClass({
        mixins: [React.addons.PureRenderMixin],
        propTypes: {
            // required
            tag: React.PropTypes.string.isRequired,
            handleClick: React.PropTypes.func.isRequired,
            onTagUpdated: React.PropTypes.func.isRequired,
            // optional
            canEdit: React.PropTypes.bool,
            canRemove: React.PropTypes.bool,
            isSelected: React.PropTypes.bool,
        },
        
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getDefaultProps: function () {
          return { 
              canEdit: false,
              canRemove: false,
              isSelected: false
          };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleClick: function () {
            if (this.props.canEdit && this.props.tag === '') {
                this.props.tag = 'new tag';
                this.forceUpdate();
            } else {
                this.props.handleClick(); 
            }
        },

        handleTagNameChange: function (event) {
            // don't update if value is the same
            if (this.props.tag === event.target.value) {
                // cancel existing interval
                if (_.isNull(this.intervalId) === false) {
                    clearInterval(this.intervalId);
                }
                return;
            }

            // cancel existing interval
            if (_.isNull(this.intervalId) === false) {
                clearInterval(this.intervalId);
            }

            // update in 3 seconds if no more changes occur in that period
            this.intervalId = setInterval(this.updateTagInterval.bind(null, event.target.value), 3000);
        },

        /*************************************************************
         * MISC
         *************************************************************/
        intervalId: null,
        updateTagInterval: function (newValue) {
            clearInterval(this.intervalId);
            this.props.onTagUpdated(this.props.tag, newValue);
            this.props.tag = newValue;
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var tag = doozy.parseTag(this.props.tag);
            
            var isSelected = this.props.isSelected ? ' selected' : '';

            var closeButton = null;
            if (this.props.canRemove) {
                closeButton = <button type="button" className="close"><span aria-hidden="true">&times;</span></button>;
            }

            var domTag = <span> {tag.name}</span>;
            if (this.props.canEdit) {
                domTag = <ContentEditable html={tag.value} onChange={this.handleTagNameChange} />
            }

            return (
                <li onClick={this.handleClick} className={'tag-item clickable' + isSelected} >
                    <i className={"fa " + tag.className}></i>{domTag}{closeButton}
                </li>
            );
        },
    });
}));