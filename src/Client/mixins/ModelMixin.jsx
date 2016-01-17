(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/store')
    );
}(function (React, storeClass) {
    var ModelMixin = function (store, propName, pathArg) {

        var mixinObj;
        var path = pathArg || 'props';
        var thisStore = store;
        var handleStoreUpdateName = 'handle' + (store.storeName || String(Math.random()).split('.')[1].slice(0, 3)) + 'StoreUpdate';

        if (store instanceof storeClass.Store) {
            mixinObj = {
                /*************************************************************
                * COMPONENT LIFECYCLE
                *************************************************************/
                componentWillMount: function () {
                    thisStore.subscribe(this[handleStoreUpdateName]);
                },

                componentWillUnmount: function () {
                    thisStore.unsubscribe(this[handleStoreUpdateName]);
                },
            };
        }
        else {
            var thisProp = 'id';
            mixinObj = {
                /*************************************************************
                * COMPONENT LIFECYCLE
                *************************************************************/
                componentWillMount: function () {
                    if (this[path][thisProp]) {
                        // Subscribe to one
                        thisStore.subscribe(this[handleStoreUpdateName], { id: this[path][thisProp] });
                    }
                },

                componentWillReceiveProps: function (nextProps) {
                    if (!this.props.globalSubscriberContext && nextProps[thisProp] !== this[path][thisProp]) {
                        if (this[path][thisProp]) {
                            thisStore.unsubscribe(this[handleStoreUpdateName], { id: this[path][thisProp] });
                        }
                        if (nextProps[thisProp]) {
                            thisStore.subscribe(this[handleStoreUpdateName], { id: nextProps[thisProp] });
                        }
                    }
                },

                componentWillUnmount: function () {
                    if (this[path][thisProp]) {
                        thisStore.unsubscribe(this[handleStoreUpdateName], { id: this[path][thisProp] });
                    }
                },
            };
        }




        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        mixinObj[handleStoreUpdateName] = function (result) {
            if (this.handleModelUpdate) {
                this.handleModelUpdate(result);
            }
            else {
                this.setState({
                    lastModelUpdate: (new Date()).toISOString()
                });
            }
        };

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        mixinObj.renderButtons = function () {
            /**
             * Buttons array to pass to Modal component
             */
            var buttons;

            if (this.props.mode === 'Add') {
                buttons = [{type: 'primary',
                            text: 'Save Action',
                            handler: this.handleSaveClick,
                            buttonStyle: buttonStyle},
                           {type: 'default',
                            text: 'Cancel',
                            handler: this.handleCancelClick,
                            buttonStyle: buttonStyle},
                           ];
            }
            else {
                buttons = [{type: 'primary',
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
            }

            var buttonsDom = buttons.map(function (button, index) {
                return (<button key={index} style={button.buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>);
            });

            return buttonsDom;
        };

        return mixinObj;
    };


    /*************************************************************
     * STYLES
     *************************************************************/
    var buttonStyle = {
        display: 'block',
        width: '100%',
        marginBottom: '5px',
        fontSize: '1.1rem'
    };

    var deleteButtonStyle = Object.assign({}, buttonStyle, {
        marginTop: '3rem'
    });

    return ModelMixin;
}));
