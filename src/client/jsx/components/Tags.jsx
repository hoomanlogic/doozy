var Tags = React.createClass({
    getDefaultProps: function () {
      return { canAdd: false, canEdit: false, canRemove: false };
    },
    render: function () {
        var tags = this.props.tags;
        
        var domTags = tags.map(
            function(tag, index) {
                      return (
                          <Tag key={tag}
                               tag={tag}
                               canEdit={this.props.canEdit}
                               canRemove={this.props.canRemove}
                               isSelected={_.contains(this.props.selectedTags, tag)}
                               handleClick={this.props.selectionChanged.bind(null,tag)}
                               onTagUpdated={this.props.onTagUpdated} />
                      );
            }.bind(this)
        );

        if (this.props.canAdd) {
            domTags.push(
                <Tag key="newtag" 
                     tag="" 
                     canEdit={true}
                     canRemove={false}
                     isSelected={false}
                     handleClick={this.props.selectionChanged.bind(null,"")}
                     onTagUpdated={this.props.onTagUpdated}/>
            );
        }

        return (
            <ul className="list-tags">
                {domTags}
            </ul>
        );
    },
});