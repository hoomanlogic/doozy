var ConnectPage = React.createClass({
    getInitialState: function () {
        return { selectedConversation: null };  
    },
    render: function () {
        var connections = this.props.connections;
        var conversations = this.props.conversations;
        
        //if (connections.length === 0) {
        //    return null;
        //}
        //todo: implement unread count that works with all types: <span className="badge">{this.p2punreadCount(this.p2pformatId(item.id))}</span>
        
        var selectedConversation = this.state.selectedConversation;
        var domConversations = null;
        var domMessages = null;
        var domSelectedConversation = null;
        if (selectedConversation !== null) {
            domConversations = (
                <div>
                    <ul id="conversations" className="nav nav-pills">
                        {conversations.map(function(item) {
                            return ( 
                                <li key={item.id} id={'conversationWith' + item.name} className={selectedConversation.id === item.id ? 'active' : ''}>
                                    <a onClick={this.selectConversation.bind(null,item.id)}>{item.name}</a>
                                </li>
                            );
                        }.bind(this))}
                    </ul>
                </div>
            );
            
            var messages = _.sortBy(selectedConversation.messages, function (a) { return a.sent.getTime() });
            domMessages = 
                messages.map(function(msg, index) {
                    var left = null;
                    var right = null;
                    var section = null;
                

                    if (msg.from === this.props.userName) {
                        left = (
                            <div className="col-xs-10 text-right">
                                <div>{msg.text}</div>
                                <img className="message" src={msg.fileUri} />
                            </div>
                        );
                        right = (
                            <div className="col-xs-2">
                                <div className="w100 pull-right"><img className="img-responsive" src={selectedConversation.myProfileUri} /></div>
                            </div>);
                    } else {
                        left = (
                            <div className="col-xs-2">
                                <div className="w100"><img className="img-responsive" src={selectedConversation.profileUri} /></div>
                            </div>
                        );
                        right = (
                            <div className="col-xs-10">
                                <div>{msg.text}</div>
                                <img className="message" src={msg.fileUri} />
                            </div>
                        );
                    }
                
                    if (index === 0 || Math.abs(messages[index - 1].sent.getTime() - msg.sent.getTime()) > 500000) {
                        section = <div className="message-sent-grouping col-xs-12"><span className="message-sent-timestamp">{hldatetime.formatTime(msg.sent)}</span></div>;
                    }
                    return (
                        <div key={msg.sent.getTime().toString()} className="clearfix">
                            {section}
                            {left}{right}
                        </div>
                    );
                }.bind(this));
            domSelectedConversation = (
                <div className="conversation-container-full">
                    <div className="conversation-header">
                        <div>{selectedConversation.name}</div>
                    </div>
                    <div id="conversation-scroll" className="conversation-messages">
                        <div id="conversation-full-height">
                            {domMessages}
                        </div>
                    </div>
                    <div className="conversation-form-full">
                        <SendMessage userName={selectedConversation.id} send={this.props.send} />
                    </div>
                </div>
            );
        }
        
        return (
            <div>
                <div className="col-xs-3">
                    <button type="button" className="btn btn-primary pull-right" onClick={this.requestConnection}><i className="fa fa-plus"></i> Request Connection</button>
                    <input className="form-control" type="text" ref="requestUserName" />
                    <Connections connections={connections} rejectConnection={this.props.rejectConnection} onConnectionSelected={this.selectConversation} />
                    {domConversations}
                </div>
                <div className="col-xs-9">
                    {domSelectedConversation}
                </div>
            </div>
        );
    },
    requestConnection: function () {
        var userName = this.refs.requestUserName.getDOMNode().value;
        this.props.requestConnection(userName);
    },
    selectConversation: function (id) {
        var conversation = this.props.openConversation(id);
        
        var conversations = this.props.conversations;
        var selectedConversation = this.state.selectedConversation;

        // avoid setting state when it's already selected
        if (selectedConversation !== null && selectedConversation.id === id) {
            return;   
        }
        
        for (var i = 0; i < conversations.length; i++) {
            if (conversations[i].id === id) {
                this.setState({ selectedConversation: conversations[i] });   
            }
        }
    },
});