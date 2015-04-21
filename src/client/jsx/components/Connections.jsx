var Connections = React.createClass({
    render: function () {
        var connections = this.props.connections;
        
        if (connections.length === 0) {
            return null;
        }
        
        var listItems = (
            <div>
                <ul className="list-group">
                    {connections.map(function(item) {
                        return ( 
                            <li key={item.name} className="list-group-item">
                                <div className="w50 inline-block v-align-middle"><img className="img-responsive" src={item.profileUri} onClick={this.props.onConnectionSelected.bind(null,item.userName)} /></div>
                                <span className="connection-list-name">{item.name}</span>
                                <span className="connection-list-lastmsg">{item.lastMessage ? item.lastMessage.text : ''}</span>
                                <span className="pull-right">
                                    <button type="button" className="btn btn-danger" onClick={this.props.rejectConnection.bind(null,item.userName)}><i className="fa fa-trash"></i></button>
                                </span>
                            </li>
                        );
                    }.bind(this))}
                </ul>
            </div>
        );

        return listItems;
    },
});