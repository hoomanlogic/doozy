(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('stores/tag-store')
    );
}(function (React, _, doozy, tagStore) {
    /* globals $ */
    var SelectTagMixin = {
        setOptionsTag: function (selectize) {
            if (!tagStore.context({}) || !tagStore.context({}).value) {
                return;
            }

            // clear previously set options
            selectize.clearOptions();

            // add tags that user has assigned to other actions
            var tags = tagStore.context({}).value;
            tags.forEach( function (tag) {
                var parsed = doozy.parseTag(doozy.getTagValue(tag));
                parsed.value = parsed.name;
                selectize.addOption(parsed);
            });
        },
        setupTagInput: function () {
            if (!this.refs.tag) {
                return;
            }

            // initialize control for tags functionality
            $(this.refs.tag.getDOMNode()).selectize({
                delimiter: ',',
                persist: true,
                maxItems: 1,
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
            var selectize = $(this.refs.tag.getDOMNode())[0].selectize;
            this.setOptionsTag(selectize);

            // Set value from state
            selectize.setValue(this.state.tag || this.state.entityId);
        },

        renderTagInput: function () {
            return (
                <div className="form-group">
                    <label htmlFor="tag">Tags</label>
                    <input id="tag" ref="tag" type="text" />
                </div>
            );
        }
    };
    return SelectTagMixin;
}));
