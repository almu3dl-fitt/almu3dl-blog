class BF_Edit_Panel extends wp.element.Component {

	wrapper = React.createRef();

    componentDidMount() {

        document.dispatchEvent(
            new CustomEvent('bf-edit-gutenberg-block', {detail: this.wrapper.current,})
        );
    }

    render() {

        return (
            <div ref={this.wrapper} className="bf-edit-gutenberg-block">
                {this.props.children}
            </div>
        );
    }
}


module.exports = BF_Edit_Panel;
