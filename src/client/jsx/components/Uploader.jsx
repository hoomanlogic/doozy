var Uploader = React.createClass({
    getInitialState: function () {
        return { filesSelected: false, dataUrl: null };  
    },
    render: function () {
        var img = null;
        if (this.state.dataUrl) {
            img = <img style={{display: 'inline'}} src={this.state.dataUrl} />
        }
        
        return (
            <div style={{display: 'inline'}}>
                {img}
                <a onClick={this.handleOpenFileDialogClick}>
                    <i className={'file-img fa fa-2x fa-camera' + (this.state.filesSelected ? ' selected' : ' none')}></i>
                    <input type="file" className="file-input-hidden" id="theFile" multiple accept="image/*" placeholder="upload an image..." onChange={this.onFilesChanged} />
                </a>
                <button className="btn btn-default btn-primary" type="button" onClick={this.uploadFiles} disabled={!this.state.filesSelected}>Upload</button>
            </div>
        );
    },
    uploadFiles: function (evt) {
        
        if ($('#theFile').prop('files').length > 0) {
            for (var i = 0; i < $('#theFile').prop('files').length; i++) {
                hlio.convertFileToDataUrl($('#theFile').prop('files')[i], function (fileName, dataUrl) {
                    $.connection.chatHub.server.upload(this.props.type, this.props.arg || null, dataUrl, fileName);
                }.bind(this));
            }
        }
    },
    upload: function (dataUrl, fileName) {
        $.ajax({
            type: "POST",
            url: "/api/uploadfiles/" + this.props.type,
            contentType: false,
            processData: false,
            headers: {
                'Authorization': 'Bearer ' + hlapp.getAccessToken()
            },
            data: { 
                dataUrl: dataUrl,
                fileName: fileName
            },
            success: function (messages) {
                for (i = 0; i < messages.length; i++) {
                    alert(messages[i]);
                }
            },
            error: function () {
                alert("Error while invoking the Web API");
            }
        });
    },
    handleOpenFileDialogClick: function () {
        $('#theFile').click();
    },
    onFilesChanged: function () {
        if ($('#theFile').prop('files').length > 0) {
            hlio.convertFileToDataUrl($('#theFile').prop('files')[0], function (fileName, dataUrl) {
                this.setState({ filesSelected: true, dataUrl: dataUrl });
            }.bind(this));
        } else if ($('#theFile').prop('files').length === 0) {
            this.setState({ filesSelected: false, dataUrl: null });
        }
    },
});