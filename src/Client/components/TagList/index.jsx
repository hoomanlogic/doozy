(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('hl-common-js/src/those'),
        require('./TagListItem')
    );
}(function (React, those, TagListItem) {
    var TagList = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getDefaultProps: function () {
            return {
                canAdd: false,
                canEdit: false,
                canRemove: false
            };
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var tags = this.props.tags;

            var domTags = tags.map(
                function (tag) {
                    return (
                        <TagListItem key={tag}
                            tag={tag}
                            canEdit={this.props.canEdit}
                            canRemove={this.props.canRemove}
                            isSelected={those(this.props.selectedTags).has(tag)}
                            handleClick={this.props.selectionChanged.bind(null,tag)}
                            onTagUpdated={this.props.onTagUpdated} />
                    );
                }.bind(this)
            );

            if (this.props.canAdd) {
                domTags.push(
                    <TagListItem key="newtag"
                         tag=""
                         canEdit={true}
                         canRemove={false}
                         isSelected={false}
                         handleClick={this.props.selectionChanged.bind(null,'')}
                         onTagUpdated={this.props.onTagUpdated}/>
                );
            }

            return (
                <ul className={'tag-list'}>
                    {domTags}
                </ul>
            );
        },
    });
    return TagList;
}));
