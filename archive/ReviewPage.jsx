var ReviewPage = React.createClass({
    getInitialState: function () {
        return { nodes: [{
            id: '1',
            name: 'Take over the world',
            items: [{
                id: '1.1',
                name: 'Take over the US',
                items: []
            },{
                id: '1.2',
                name: 'Take over Germany',
                items: [{
                    id: '1.2.1',
                    name: 'Take over West Germany',
                    items: []
                },{
                    id: '1.2.2',
                    name: 'Take over East Germany',
                    items: []
                }]
            },{
                id: '1.3',
                name: 'Take over Austria',
                items: []
            },{
                id: '1.4',
                name: 'Take over the UK',
                items: []
            },
            ]
        },
        ]};  
    },
    render: function () {
        var nodes = this.state.nodes;
        return (<div><TreeView data={nodes} handleChange={this.handleChange} /></div>);    
    },
    handleChange: function () {
        this.setState({ nodes: this.state.nodes });
    }
});