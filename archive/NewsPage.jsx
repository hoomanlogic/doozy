var NewsPage = React.createClass({
    componentDidMount: function () {
      //loadNewsFeedClient();  
    },
    render: function () {
        return (
            <div id="lh-index">
                <div>
                    <button type="button" className="btn btn-primary" onClick={this.zoomIn}><i className="fa fa-plus"></i></button>
                    <button type="button" className="btn btn-primary" onClick={this.zoomOut}><i className="fa fa-minus"></i></button>
                    <div className="form-group">
                        <div className="input-group">
                            <input id="lh-search-input" className="form-control" type="text" title="Search News" />
                            <input id="lh-search-button" className="form-control" type="button" title="Submit Search" value="Search" />
                        </div>
                    </div>
                </div>
                <div id="lh-main">
                    <nav id="lh-nav">
                        <div id="lh-add">
                            <input id="lh-addfeed-button" className="lh-inputctrl" type="button" title="Subscribe to a Feed" value="Add Feed" />
                        </div>
                        <div id="lh-feeds">
                        </div>
                    </nav>
                    <div id="lh-articles">
                        <div id="lh-articles-header">
                            <div id="lh-title">Home</div>
                            <input id="lh-showvideo" type="button" style={{display: 'none'}} value="Video!" />
                            <audio id="audioplayer" src="" controls autobuffer style={{display: 'none'}}></audio>
                        </div>
                        <table id="lh-articles-container">
                            <tbody>
                                <tr>
                                    <td id="lh-toggle-nav" className="togglenav-expanded"><div id="lh-togglenav-icon"></div></td>
                                    <td id="lh-articles-content">
                                        <div id="lh-articles-content-header"></div>
                                        <div id="lh-entries-container" style={{height: '800px'}} className="list">
                                            <div id="lh-entries-zoom">
                                            </div>
                                        </div>
                                        <div id="lh-articles-content-footer"></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    },
    getTokenFromFeedly: function () {
        
    },
    zoomIn: function () {
        zoomIn();
    },
    zoomOut: function () {
        zoomOut();
    }
});
    
