var DoPage = React.createClass({
    render: function () {
        // states
        var currentFocus = this.props.currentFocus;

        // html
        return (
            <div className="row">
                <div className="col-xs-8">

                </div>
                <div className="col-xs-4">
                    <NextActions currentFocus={currentFocus} defaultFilter={[]} addAction={this.props.addAction} editAction={this.props.editAction} />
                </div>
            </div>
        );
    },
    handleFocusClicked: function (item) {
        this.setState( { currentFocus: item } );  
    },
});