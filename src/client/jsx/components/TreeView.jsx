var TreeView = React.createClass({
    getInitialState: function () {
        return { selectedNode: null };  
    },
    render: function () {
        var data = this.props.data;
        var nodes = data.map(function(item) {
            return <TreeNode key={item.id} node={item} selectNode={this.selectNode} deleteNode={this.deleteNode} isSelectedNode={this.isSelectedNode} nodeChanged={this.nodeChanged} />;
        }.bind(this));
        
        return (
            <div className="tree">
                {nodes}
            </div>
        );
    },
    selectNode: function (node) {
        this.setState({ selectedNode: node });
    },
    deleteNode: function (id) {
        var data = this.props.data;
        var result = this.findNode(data, id);
        if (result !== null) {
            result.collection.splice(result.index, 1);
            if (result.parent && result.collection.length === 0 && result.root.kind === 'Project') {
                result.parent.kind = 'ToDo';
                if (result.parent.name = 'New Milestone') {
                    result.parent.name = 'New To-Do';
                }
            } else if (result.parent && result.collection.length === 0 && result.root.kind === 'Flow') {
                result.parent.kind = 'Action';
                if (result.parent.name = 'New Flow') {
                    result.parent.name = 'New Action';
                }
            }
        }
        this.nodeChanged();
    },
    isSelectedNode: function (node) {
        return (this.state.selectedNode !== null && node.id === this.state.selectedNode.id);
    },
    nodeChanged: function () {
        this.props.handleChange();
    },
    findNode: function (collection, id, parent, root) {

        var result = null;

        for (var i = 0; i < collection.length; i++) {
            if (collection[i].id === id) {
                result = { item: collection[i], collection: collection, index: i, parent: parent, root: root };
                break;
            }
            result = this.findNode(collection[i].items, id, collection[i], (_.isUndefined(root) ? collection[i] : root));
            if (result !== null) {
                break;
            }
        }

        return result;
    }
});