var Uploader = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            filesSelected: false,
            dataUrl: null
        };  
    },
    
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleFileChange: function () {
        if ($('#theFile').prop('files').length > 0) {
            hlio.convertFileToDataUrl($('#theFile').prop('files')[0], function (fileName, dataUrl) {
                this.setState({ 
                    filesSelected: true,
                    dataUrl: dataUrl
                });
            }.bind(this));
        } else if ($('#theFile').prop('files').length === 0) {
            this.setState({
                filesSelected: false,
                dataUrl: null
            });
        }
    },
    handleFileDialogClick: function () {
        $('#theFile').click();
    },
    handleUploadClick: function (evt) {
        if ($('#theFile').prop('files').length > 0) {
            for (var i = 0; i < $('#theFile').prop('files').length; i++) {
                hlio.convertFileToDataUrl($('#theFile').prop('files')[i], function (fileName, dataUrl) {
                    $.connection.chatHub.server.upload(this.props.type, this.props.arg || null, dataUrl, fileName);
                }.bind(this));
            }
        }
    },
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        var img = null;
        if (this.state.dataUrl) {
            img = <img style={{display: 'inline'}} src={this.state.dataUrl} />
        }
        
        return (
            <div style={{display: 'inline'}}>
                {img}
                <a onClick={this.handleFileDialogClick}>
                    <i className={'file-img fa fa-2x fa-camera' + (this.state.filesSelected ? ' selected' : ' none')}></i>
                    <input type="file" className="file-input-hidden" id="theFile" multiple accept="image/*" placeholder="upload an image..." onChange={this.handleFileChange} />
                </a>
                <button className="btn btn-default btn-primary" type="button" onClick={this.handleUploadClick} disabled={!this.state.filesSelected}>Upload</button>
            </div>
        );
    }
});