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

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var tags = this.props.tags;

            var domTags = tags.map(
                function (tag) {
                    return (
                        <TagListItem key={tag.id}
                            tag={tag}
                            isSelected={those(this.props.selectedTags).has(tag)}
                            handleClick={this.props.selectionChanged ? this.props.selectionChanged.bind(null,tag) : undefined}
                            onTagUpdated={this.props.onTagUpdated} />
                    );
                }.bind(this)
            );

            if (this.props.canAdd) {
                domTags.push(
                    <TagListItem key="newtag"
                         tag=""
                         isSelected={false}
                         handleClick={this.props.selectionChanged ? this.props.selectionChanged.bind(null,'') : undefined}
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
