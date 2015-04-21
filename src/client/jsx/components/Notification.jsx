var Notification = React.createClass({
    render: function () {
        var item = this.props.data;
        
        var classNames = 'notification';
        if (item.readAt !== null) {
            classNames += ' read';   
        }
        var notification = null;
        if (item.kind === 'Connection Request') {
            notification = (
                <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                    <span className={classNames}>{item.subject} requested to connect with you</span>
                    <button type="button" className="btn btn-success pull-right" onClick={this.props.handleNotificationClicked.bind(null, item, 'Accept Connection')}><i className="fa fa-check-square-o"></i></button>
                    <button type="button" className="btn btn-danger pull-right" onClick={this.props.handleNotificationClicked.bind(null, item, 'Reject Connection')}><i className="fa fa-trash"></i></button>
                </a>  
            );
        } else if (item.kind === 'Connection Accepted') {
            notification = (
                <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                    <span className={classNames}>{item.subject} accepted your connection request</span>
                </a>  
            );
        } else if (item.kind === 'New Message') {
            notification = (
                <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                    <span className={classNames}>{item.subject} sent you a message</span>
                </a>  
            );
        } else {
            // general notifications
            notification = (
                <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                    <span className={classNames}>{item.subject}</span>
                </a>
            );
        }

        return (
            <li key={'notify' + item.occurredAt.getTime()}>
                {notification}
            </li>
        );
    }
});