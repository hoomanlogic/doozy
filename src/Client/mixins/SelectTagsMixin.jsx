(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('stores/tag-store')
    );
}(function (React, _, doozy, tagStore) {
    /* globals $ */
    var SelectTagsMixin = {
        setOptionsTag: function (selectize) {
            if (!tagStore.context({}) || !tagStore.context({}).value) {
                return;
            }

            // clear previously set options
            selectize.clearOptions();

            // add tags that user has assigned to other actions
            var tags = tagStore.context({}).value;
            tags.forEach( function (tag) {
                selectize.addOption(doozy.parseTag(doozy.getTagValue(tag)));
            });
        },
        setupTagsInput: function () {
            if (!this.refs.tags) {
                return;
            }

            // initialize control for tags functionality
            $(this.refs.tags.getDOMNode()).selectize({
                delimiter: ',',
                persist: true,
                valueField: 'value',
                labelField: 'name',
                searchField: ['name', 'kind'],
                onChange: function (value) {
                    // get tags from control
                    var tags = value.split(',');
                    this.setState({
                        tags: tags
                    });

                }.bind(this),
                render: {
                    item: function (item, escape) {
                        return '<div class="item"><i class="fa ' + item.className + '"></i> ' + escape(item.name) + '</div>';
                    },
                    option: function (item, escape) {
                        var label = item.name || item.kind;
                        var caption = item.kind ? item.kind : null;
                        return '<div>' +
                            '<span class="label">' + escape(label) + '</span>' +
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                    }
                },
                create: function (input) {
                    return doozy.parseTag(input);
                }
            });

            // populate existing tag options
            var selectize = $(this.refs.tags.getDOMNode())[0].selectize;
            this.setOptionsTag(selectize);

            // Set value from state
            selectize.setValue(this.state.tags);
        },

        renderTagsInput: function () {
            return (
                <div className="form-group">
                    <label htmlFor="action-tags">Tags</label>
                    <input id="action-tags" ref="tags" type="text" />
                </div>
            );
        }
    };
    return SelectTagsMixin;
}));
