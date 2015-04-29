var ProfilePic = React.createClass({
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        return (
            <div className="focus">
                <img style={{display: 'inline'}} src={this.props.uri} />
                <Uploader type="Profile" />
            </div>
        );
    }
});