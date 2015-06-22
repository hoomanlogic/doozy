// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('react')
        );
    }
    else if (typeof define === "function" && define.amd) {
        // AMD
        define([
            'react'
        ], factory);
    }
    else {
        // Global (browser)
        window.Uploader = factory(window.React);
    }
}(function (React) {
    'use strict';
    return React.createClass({
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
                if (this.props.onFileChange) {
                    this.props.onFileChange(true);
                }
                hlio.convertFileToDataUrl($('#theFile').prop('files')[0], function (fileName, dataUrl) {
                    this.setState({ 
                        filesSelected: true,
                        dataUrl: dataUrl
                    });
                }.bind(this));
            } else if ($('#theFile').prop('files').length === 0) {
                if (this.props.onFileChange) {
                    this.props.onFileChange(false);
                }
                this.setState({
                    filesSelected: false,
                    dataUrl: null
                });
            }
        },
        handleFileDialogClick: function () {
            $('#theFile').click();
        },
        
//        handleUploadClick: function (evt) {
//            if ($('#theFile').prop('files').length > 0) {
//                for (var i = 0; i < $('#theFile').prop('files').length; i++) {
//                    hlio.convertFileToDataUrl($('#theFile').prop('files')[i], function (fileName, dataUrl) {
//                        $.connection.chatHub.server.upload(this.props.type, this.props.arg || null, dataUrl, fileName);
//                    }.bind(this));
//                }
//            }
//        },
        
        uploadFile: function () {
 
            var fd = new FormData();
 
            var count = document.getElementById('theFile').files.length;

            for (var index = 0; index < count; index ++) {
                var file = document.getElementById('theFile').files[index];
                fd.append(file.name, file);
            }

            var xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", this.uploadProgress, false);
            xhr.addEventListener("load", this.uploadComplete, false);
            xhr.addEventListener("error", this.uploadFailed, false);
            xhr.addEventListener("abort", this.uploadCanceled, false);
            if (this.props.arg) {
                xhr.open("POST", "api/uploadfiles/" + this.props.type + '/' + this.props.arg);
            } else {
                xhr.open("POST", "api/uploadfiles/" + this.props.type);
            }
            xhr.setRequestHeader('Authorization', 'Bearer ' + clientApp.getAccessToken());
            xhr.send(fd);

        },
        
        uploadProgress: function (evt) {
            if (evt.lengthComputable) {
                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                document.getElementById('progress').innerHTML = percentComplete.toString() + '%';

            } else {
                document.getElementById('progress').innerHTML = 'Uploading...';
            }
        },
 
        uploadComplete: function (evt) {
            var result = JSON.parse(evt.target.responseText); 

            if (this.props.type.toLowerCase() === 'profile') {
                userStore.updateProfileUriFromSignalR(result[0])
            } else if (this.props.type.toLowerCase() === 'focus') {
                focusStore.updateFromServer(this.props.arg, { iconUri: result[0] });
            }
        },

        uploadFailed: function (evt) {
            toastr.error("There was an error attempting to upload the file.");
        },

        uploadCanceled: function (evt) {
            toastr.error("The upload has been canceled by the user or the browser dropped the connection.");
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var img = null;
            if (this.state.dataUrl) {
                img = <img style={{display: 'inline', maxWidth: '100px', maxHeight: '100px'}} src={this.state.dataUrl} />
            }

            return (
                <div style={{display: 'inline'}}>
                    {img}
                    <a onClick={this.handleFileDialogClick}>
                        <i className={'file-img fa fa-2x fa-camera' + (this.state.filesSelected ? ' selected' : ' none')}></i>
                        <input type="file" className="file-input-hidden" id="theFile" multiple accept="image/*" placeholder="upload an image..." onChange={this.handleFileChange} />
                    </a>
                    <button className="btn btn-default btn-primary" type="button" onClick={this.uploadFile} disabled={!this.state.filesSelected}>Upload</button>
                    <span id="progress"></span>
                </div>
            );
        }
    });
}));