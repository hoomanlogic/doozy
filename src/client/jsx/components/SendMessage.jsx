var SendMessage = React.createClass({
    /*************************************************************
     * COMPONENT LIFECYCLE
     *************************************************************/
    getInitialState: function () {
        return {
            filesSelected: false,
            mode: 'inbox'
        };  
    },
    
    /*************************************************************
     * EVENT HANDLING
     *************************************************************/
    handleFileChange: function () {
        if ($('#theFile').prop('files').length > 0 && this.state.filesSelected === false) { 
            this.setState({ filesSelected: true });
        } else if ($('#theFile').prop('files').length === 0 && this.state.filesSelected === true) {
            this.setState({ filesSelected: false });
        }
    },
    handleFileDialogClick: function () {
        $('#theFile').click();
    },
    handleKeyPress: function (e) {
        if (e.which === 13) {
            this.handleSendClick();
        }
    },
    handlePrivateConnectionClick: function () {
        if (this.state.mode === 'inbox') {
            this.setState({ mode: 'relay' });
        } else {
            this.setState({ mode: 'inbox' });
        }
    },
    handleSendClick: function () {
        var numOfFiles = $('#theFile').prop('files').length;
        var lengthOfMessage = $('#msg').val().length;
        
        if (numOfFiles + lengthOfMessage === 0) {
            return;   
        }
        
        if ($('#theFile').prop('files').length > 0) {
            for (var i = 0; i < $('#theFile').prop('files').length; i++) {
                hlio.convertFileToDataUrl($('#theFile').prop('files')[i], function (fileName, dataUrl) {
                    msg.dataUrl = dataUrl;
                    msg.fileName = fileName;
                    this.props.send(this.state.mode, this.props.userName, $('#msg').val(), dataUrl, fileName);
                }.bind(this));
            }
        } else {
            this.props.send(this.state.mode, this.props.userName, $('#msg').val(), null, null);
        }
        $('#msg').val('');
    },
    
    /*************************************************************
     * RENDERING
     *************************************************************/
    render: function () {
        return (
            <div className="form form-inline" role="form" style={{width: '100%'}} onKeyPress={this.handleKeyPress}>
                <div className="form-group" style={{width: '100%'}}>
                    <input type="text" className="form-control" id="msg" placeholder="message to send..." />
                    <button className="btn btn-default btn-primary" type="button" onClick={this.handleSendClick}>Send</button>
                    <a onClick={this.handleFileDialogClick}>
                        <i className={'file-img fa fa-2x fa-camera' + (this.state.filesSelected ? ' selected' : ' none')}></i>
                        <input type="file" className="file-input-hidden" id="theFile" multiple accept="image/*" placeholder="share an image..." onChange={this.handleFileChange} />
                    </a>
                    <a onClick={this.handlePrivateConnectionClick}>            
                        <i className={'chat-link fa fa-2x' + (this.state.mode !== 'inbox' ? ' fa-link enabled' : ' fa-unlink disabled')}></i>
                    </a>
                </div>
            </div>  
        );
    }
});