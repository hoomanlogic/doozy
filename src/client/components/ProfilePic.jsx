(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('./Uploader')
    );
}(function (React, Uploader) {
    var ProfilePic = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return {
                filesSelected: false
            };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleOnFileChange: function (filesSelected) {
            this.setState({
                filesSelected: filesSelected
            });
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var currentImage;
            if (!this.state.filesSelected) {
                currentImage = (<img style={{display: 'inline', maxWidth: '100px', maxHeight: '100px'}} src={this.props.uri} />);
            }
            return (
                <div>
                    <label>What picture do you want others to see?</label>
                    {currentImage}
                    <Uploader type="Profile" onFileChange={this.handleOnFileChange} />
                </div>
            );
        }
    });
    return ProfilePic;
}));
