(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('pages/ManageAction'),
    );
}(function (React, ManageAction) {

    var ActionFormInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return {
                currentFocus: null
            };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleFocusClick: function (item) {
            this.setState({ currentFocus: item.name === null ? undefined : item });
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // let other components know what page we're on
            var mode = this.props.mode || 'Add';
            var page = (<ManageAction action={this.props.action} mode={mode} focusTag={this.state.currentFocus ? '!' + this.state.currentFocus.tagName : ''} />);

            return (
                <div>
                    {page}
                </div>
            );
        },
    });

    return ActionFormInterface;
}));
