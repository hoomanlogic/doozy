var TagListItem = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getDefaultProps: function () {
      return { canRemove: false, canEdit: false };
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
        var tag = this.props.tag;
        var isSelected = this.props.isSelected ? ' selected' : '';
      
        var closeButton = null;
        if (this.props.canRemove) {
            closeButton = <button type="button" className="close"><span aria-hidden="true">&times;</span></button>;
        }
        var domTag = <span>{tag}</span>;
        if (this.props.canEdit) {
            domTag = <ContentEditable html={tag} onChange={this.handleTagNameChange} />
        }
      
        return (
            <li onClick={this.handleClick} className={'tag-item clickable' + isSelected} >
                <i className="fa fa-tag"></i> {domTag}{closeButton}
            </li>
        );
    },
});