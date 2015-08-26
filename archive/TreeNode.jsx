var TreeNode = React.createClass({
    getInitialState: function () {
        var state = 'normal';
        if (this.props.node.items.length > 0) {
            state = 'collapsed';
        }

        return { state: state };
    },
    getDefaultProps: function () {
        return { level: 1, mode: null };
    },
    render: function () {
        // set initial mode
        if (this.props.level === 1 && !_.isUndefined(this.props.node.kind)) {
            this.props.mode = this.props.node.kind;
        }

        // toggle button for alternate modes
        var kindToggle = null;
        if (this.props.mode !== null) {
            var css = null;
            if (this.props.node.kind === 'Project') {
                css = 'fa fa-bullseye';
            } else if (this.props.node.kind === 'Milestone') {
                css = 'fa fa-line-chart';
            } else if (this.props.node.kind === 'Flow') {
                css = 'fa fa-road';
            } else if (this.props.node.kind === 'Action') {
                css = 'fa fa-bolt';
            } else if (this.props.node.kind === 'ToDo') {
                css = 'fa fa-check-square-o';
            }
            kindToggle = <i className={css} style={{paddingLeft: '2px', paddingRight: '2px'}}></i>;
        }

        // set the correct node handle
        var state = this.state.state;
        var selected = this.props.isSelectedNode(this.props.node);
        var items = null
        var handle = null;
        if (this.props.node.items.length === 0) {
            state = 'normal';
        }
        if (state === 'collapsed') {
            handle = <i className="collapsed fa fa-plus" onClick={this.expandNode}></i>;
        } else if (state === 'expanded') {
            handle = <i className="expanded fa fa-minus" onClick={this.collapseNode}></i>;
            var sortedItems = _.sortBy(this.props.node.items, function(item) { return item.items.length; });
            items = sortedItems.map(function(item) {
                return (
                    <TreeNode key={item.id} node={item}
                              selectNode={this.props.selectNode}
                              deleteNode={this.props.deleteNode}
                              isSelectedNode={this.props.isSelectedNode}
                              nodeChanged={this.props.nodeChanged}
                              level={this.props.level + 1}
                              mode={this.props.mode} />
                );
            }.bind(this));
        } else {
            handle = <i className="normal"></i>;
        }

        // add and delete buttons are only available when the node is selected
        var nodeAddOption = null;
        var nodeDeleteOption = null;
        if (selected) {
            nodeAddOption = <i className="button fa fa-plus" style={{paddingLeft: '12px', paddingRight: '2px'}} onClick={this.addChild}></i>;
            nodeDeleteOption = <i className="button fa fa-trash" style={{paddingLeft: '8px', paddingRight: '2px'}} onClick={this.deleteNode}></i>;
        }

        return (
            <ul>
                <li>
                    {handle}
                    {kindToggle}
                    <span className={selected ? 'selected' : ''} onClick={this.selectNode}><ContentEditable html={this.props.node.name} onChange={this.handleChangeName} /></span>
                    {nodeAddOption}
                    {nodeDeleteOption}
                    {items}
                </li>
            </ul>
        );
    },
    handleChangeName: function(event) {
        this.props.node.name = event.target.value;
        this.props.nodeChanged();
    },
    addChild: function () {
        var mode = this.props.mode;
        var name = 'New Node';
        var id = new Date().getTime().toString();

        if (mode === 'Project') {
            var child = new ToDo('New To-Do');

            // change action to a milestone
            if (this.props.node.kind === 'ToDo') {
                this.props.node.kind = 'Milestone';
                if (this.props.node.name === 'New To-Do') {
                    this.props.node.name = 'New Milestone';
                }
            }

            this.props.node.items.push(child);

        } else if (mode === 'Flow') {
            var child = new Action('New Action');

            // change action to a milestone
            if (this.props.node.kind === 'Action') {
                this.props.node.kind = 'Flow';
                if (this.props.node.name === 'New Action') {
                    this.props.node.name = 'New Flow';
                }
            }

            this.props.node.items.push(child);
        } else {
            this.props.node.items.push({
                id: id,
                name: 'New Node',
                items: []
            });
        }


        this.expandNode();
        this.props.nodeChanged();
    },
    collapseNode: function () {
        this.setState({ state: 'collapsed' });
    },
    expandNode: function () {
        this.setState({ state: 'expanded' });
    },
    selectNode: function () {
        this.props.selectNode(this.props.node);
    },
    deleteNode: function () {
        this.props.deleteNode(this.props.node.id);
    },
});
