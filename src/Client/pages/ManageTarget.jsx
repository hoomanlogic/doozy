(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('app/doozy'),
        require('stores/target-store'),
        require('stores/action-store'),
        require('stores/tag-store'),
        require('mixins/SubscriberMixin')
    );
}(function (React, doozy, targetStore, actionStore, tagStore, SubscriberMixin) {
    var ManageTarget = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [SubscriberMixin(targetStore), SubscriberMixin(actionStore), SubscriberMixin(tagStore)],
        propTypes: {
            targetId: React.PropTypes.string,
        },
        
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return doozy.target();
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentDidMount: function () {
            /**
             * Setup Entity selector
             */
            if (this.state.entityType === 'Tag') {
                this.setupTagsControl();
            } else if (this.state.entityType === 'Action') {
                this.setupActionsControl();
            }
        },

        componentDidUpdate: function () {
            if (this.state.entityType === 'Tag') {
                this.setupTagsControl();
            } else if (this.state.entityType === 'Action') {
                this.setupActionsControl();
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            window.location.href = '/doozy/targets';
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            } else if (event.target === this.refs.entityType.getDOMNode()) {
                this.setState({entityType: event.target.value, entityId: null});
            } else if (event.target === this.refs.measure.getDOMNode()) {
                this.setState({measure: parseInt(event.target.value)});
            } else if (event.target === this.refs.period.getDOMNode()) {
                this.setState({period: parseInt(event.target.value)});
            } else if (event.target === this.refs.multiplier.getDOMNode()) {
                this.setState({multiplier: parseInt(event.target.value)});
            } else if (event.target === this.refs.number.getDOMNode()) {
                this.setState({number: parseInt(event.target.value)});
            }
        },
        handleDeleteClick: function () {
            targetStore.destroy(this.props.targetId);
            window.location.href = '/doozy/targets';
        },
        handleSaveClick: function () {
            var entity = this.refs.entity.getDOMNode().value;
            if (this.state.entityType === 'Tag') {
                entity = _.find(tagStore.updates.value, function (tag) {
                     return doozy.getTagValue(tag) === entity;
                });
            } else if (this.state.entityType === 'Action') {
                entity = actionStore.getActionByName(entity);
            }
            if (!entity) {
                ui.message('Cannot save target without a tag or action assigned', 'error');
                return;
            }
            this.state.entityId = entity.id;
            if (this.state.isNew) {
                targetStore.create(this.state);
            } else {
                targetStore.update(this.state);
            }
            window.location.href = '/doozy/targets';
        },
        handleStoreUpdate: function (model) {
            this.setState(model);
        },

        /*************************************************************
         * MISC
         *************************************************************/
        setOptionsAction: function (selectize) {
            // clear previously set options
            selectize.clearOptions();

            // get actions sorted by name
            var actions = actionStore.context({}).value;
            actions = _.sortBy(actions, function (action) {
                action.name;
            });

            // add actions
            actions.forEach( function (action) {
                selectize.addOption({
                    id: action.id,
                    value: action.name,
                    name: action.name
                });
            });

            // set current value
            if (this.state.entityId) {
                var action = actionStore.get(this.state.entityId);
                if (action) {
                    selectize.setValue(action.name);
                }
            }
        },
        setOptionsTag: function (selectize) {
            // clear previously set options
            selectize.clearOptions();

            // get distinct tags user has assigned to other actions
            var tags = tagStore.context({}).value;
            tags = _.sortBy(tags, function (tag) {
                tag.name;
            });

            // add tags that user has assigned to other actions
            tags.forEach(function (tag) {
                selectize.addOption({
                    id: tag.id,
                    name: tag.name,
                    kind: tag.kind,
                    value: doozy.getTagValue(tag),
                });
            });

            // set current value
            if (this.state.entityId) {
                var tag = tagStore.get(this.state.entityId);
                if (tag) {
                    selectize.setValue(doozy.getTagValue(tag));
                }
            }
        },
        setupActionsControl: function () {
            if (!this.refs.entity) {
                return;
            }
            $(this.refs.entity.getDOMNode()).selectize({
                delimiter: '|',
                persist: true,
                maxItems: 1,
                openOnFocus: false,
                valueField: 'value',
                labelField: 'name',
                searchField: ['name'],
                render: {
                    item: function (item, escape) {
                        return '<div class="item">' + escape(item.value) + '</div>';
                    },
                    option: function (item, escape) {
                        var label = item.name;
                        return '<div>' +
                            '<span class="label">' + escape(label) + '</span>' +
                        '</div>';
                    }
                },
            });

            // populate existing action options
            var selectize = $(this.refs.entity.getDOMNode())[0].selectize;
            this.setOptionsAction(selectize);
        },
        setupTagsControl: function () {
            if (!this.refs.entity) {
                return;
            }
            // initialize control for tags functionality
            $(this.refs.entity.getDOMNode()).selectize({
                delimiter: ',',
                persist: true,
                maxItems: 1,
                openOnFocus: false,
                valueField: 'value',
                labelField: 'name',
                searchField: ['name', 'kind'],
                render: {
                    item: function (item, escape) {
                        return '<div class="item">' + escape(item.value) + '</div>';
                    },
                    option: function (item, escape) {
                        var label = item.name || item.kind;
                        var caption = item.kind ? item.kind : null;
                        return '<div>' +
                            '<span class="label">' + escape(label) + '</span>' +
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                    }
                }
            });

            // populate existing tag options
            var selectize = $(this.refs.entity.getDOMNode())[0].selectize;
            this.setOptionsTag(selectize);
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // Waiting on store
            if (this.props.targetId && this.state.isNew) {
                return <div>Loading...</div>;
            }

            var buttons = [
                {type: 'primary',
                 text: 'Save Changes',
                 handler: this.handleSaveClick,
                 buttonStyle: buttonStyle},
                {type: 'default',
                 text: 'Cancel',
                 handler: this.handleCancelClick,
                 buttonStyle: buttonStyle},
                {type: 'danger',
                 text: 'Delete',
                 handler: this.handleDeleteClick,
                 buttonStyle: deleteButtonStyle}
            ];

            var buttonsDom = buttons.map(function (button, index) {
                return (<button key={index} style={button.buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>);
            });

            var selectorDom;
            if (this.state.entityType === 'Tag') {
                selectorDom = (
                    <div className="form-group">
                        <label htmlFor="target-entity">Tag</label>
                        <input id="target-entity" ref="entity" type="text" />
                    </div>
                );
            } else if (this.state.entityType === 'Action') {
                selectorDom = (
                    <div className="form-group">
                        <label htmlFor="target-entity">Action</label>
                        <input id="target-entity" ref="entity" type="text" />
                    </div>
                );
            }

            // html
            return (
                <div style={styles.main}>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="target-name">Name</label>
                            <input id="target-name" ref="name" type="text" className="form-control" placeholder="Name of target" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="target-entitytype">What kind of target is this?</label>
                            <select id="target-entitytype" ref="entityType" className="form-control" value={this.state.entityType} onChange={this.handleChange}>
                                <option value="Action">Action</option>
                                <option value="Tag">Tag</option>
                            </select>
                        </div>
                        {selectorDom}
                        <div className="form-group">
                            <label htmlFor="target-measure">How is this target measured?</label>
                            <select id="target-measure" ref="measure" className="form-control" value={this.state.measure} onChange={this.handleChange}>
                                <option value="0">By Execution</option>
                                <option value="1">By Progress</option>
                                <option value="2">By Duration</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="target-period">What period?</label>
                            <select id="target-period" ref="period" className="form-control" value={this.state.period} onChange={this.handleChange}>
                                <option value="0">Years</option>
                                <option value="1">Months</option>
                                <option value="2">Weeks</option>
                                <option value="3">Days</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="target-multiplier">How many periods?</label>
                            <input id="target-multiplier" ref="multiplier" type="number" className="form-control" value={this.state.multiplier} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="target-number">What is the target number?</label>
                            <input id="target-number" ref="number" type="number" className="form-control" value={this.state.number} onChange={this.handleChange} />
                        </div>
                    </form>
                    {buttonsDom}
                </div>
            );
        }
    });
    
    var styles = {
        main: {
            padding: '1rem',
            margin: 'auto',
            maxWidth: '40rem'
        }
    };
    
    var buttonStyle = {
        display: 'block',
        width: '100%',
        marginBottom: '5px',
        fontSize: '1.1rem'
    };

    var deleteButtonStyle = Object.assign({}, buttonStyle, {
        marginTop: '3rem'
    });

    return ManageTarget;
}));
