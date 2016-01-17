(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('stores/host'),
        require('stores/target-store'),
        require('stores/action-store'),
        require('stores/tag-store'),
        require('mixins/ModelMixin'),
        require('mixins/StoresMixin'),
        require('mixins/SelectActionMixin'),
        require('mixins/SelectTagsMixin')
    );
}(function (React, _, doozy, host, targetStore, actionStore, tagStore, ModelMixin, StoresMixin, SelectActionMixin, SelectTagsMixin) {
    var ManageTarget = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [ModelMixin(targetStore), StoresMixin([actionStore, tagStore]), SelectActionMixin, SelectTagsMixin],
        propTypes: {
            id: React.PropTypes.string,
        },

        getInitialState: function () {
            return doozy.target();
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Target');
        },
        componentDidMount: function () {
            if (!this.refs.entity) {
                return;
            }
            if (this.state.entityType === 'Tag') {
                this.setupTagsInput();
            }
            else if (this.state.entityType === 'Action') {
                this.setupActionInput();
            }
        },
        componentDidUpdate: function () {
            if (!this.refs.entity) {
                return;
            }
            if (this.state.entityType === 'Tag') {
                this.setupTagsInput();
            }
            else if (this.state.entityType === 'Action') {
                this.setupActionInput();
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            host.go('/doozy/targets');
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            }
            else if (event.target === this.refs.entityType.getDOMNode()) {
                this.setState({entityType: event.target.value, entityId: null});
            }
            else if (event.target === this.refs.measure.getDOMNode()) {
                this.setState({measure: parseInt(event.target.value, 10)});
            }
            else if (event.target === this.refs.period.getDOMNode()) {
                this.setState({period: parseInt(event.target.value, 10)});
            }
            else if (event.target === this.refs.multiplier.getDOMNode()) {
                this.setState({multiplier: parseInt(event.target.value, 10)});
            }
            else if (event.target === this.refs.number.getDOMNode()) {
                this.setState({number: parseInt(event.target.value, 10)});
            }
        },
        handleDeleteClick: function () {
            host.prompt('Are you sure you want to delete this target?\n\nIf so, type DELETE and hit enter', function (response) {
                if ((response || '').toLowerCase() === 'delete') {
                    targetStore.destroy(this.props.id);
                    host.go('/doozy/targets');
                }
            }.bind(this));
        },
        handleSaveClick: function () {
            var entity = this.refs.entity.getDOMNode().value;
            if (this.state.entityType === 'Tag') {
                entity = _.find(tagStore.updates.value, function (tag) {
                    return doozy.getTagValue(tag) === entity;
                });
            }
            else if (this.state.entityType === 'Action') {
                entity = actionStore.getActionByName(entity);
            }
            if (!entity) {
                // ui.message('Cannot save target without a tag or action assigned', 'error');
                return;
            }
            this.state.entityId = entity.id;
            if (this.state.isNew) {
                targetStore.create(this.state);
            }
            else {
                targetStore.update(this.state);
            }
            host.go('/doozy/targets');
        },
        handleModelUpdate: function (model) {
            if (!model) {
                this.setState(this.getInitialState());    
                return;
            }
            this.setState(model);
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // Waiting on store
            if (this.props.id && this.state.isNew) {
                return <div>Loading...</div>;
            }

            var selectorDom;
            if (this.state.entityType === 'Tag') {
                selectorDom = (
                    <div className="form-group">
                        <label htmlFor="target-entity">Tag</label>
                        <input id="target-entity" ref="entity" type="text" />
                    </div>
                );
            }
            else if (this.state.entityType === 'Action') {
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
                    <h2>{this.state.isNew ? 'New Target' : 'Update Target'}</h2>
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
                    {this.renderButtons()}
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

    return ManageTarget;
}));
