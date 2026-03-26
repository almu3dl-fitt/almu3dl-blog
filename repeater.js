class BF_Repeater extends wp.element.Component {

	constructor(props) {

		super(...arguments);

		let items = [];

		if (props.value && Array.isArray(props.value)) {
			items = props.value;
		}

		this.state = {items};
	}

	isEmpty(object) {
		if (!object) {
			return true;
		}

		if (Object.keys) {
			return !Object.keys(object).length;
		}

		var i;

		for (i in object) {
			if (object.hasOwnProperty(i)) {

				return false;
			}
		}

		return true;
	}

	appendItem() {

		this.setState({items: this.items().concat([this.props.defaultParams])});
	}

	itemChanged(value) {

		const items = JSON.parse(JSON.stringify(this.repeater.state.items)) || {};

		if (!items[this.i]) {
			items[this.i] = {};
		}

		items[this.i][this.id] = value;

		this.repeater.setState({items});

		this.repeater.onChange(items);
	}

	onChange(items) {

		this.props.onChange && this.props.onChange(items || this.items());
	}

	prepareChildrenElements(elements, elementsValue, i) {

		return elements.map((element) => {

			const id = element.props.id,
				value = elementsValue && elementsValue[id] ? elementsValue[id] : '';

			const key = id + "__" + i;

			const props = {
				value,
				key,
				i,
				id,
				onChange: this.itemChanged.bind({repeater: this, id, i})
			};

			if (element.props.children) {

				props.children = this.prepareChildrenElements(Array.isArray(element.props.children) ? element.props.children : [element.props.children], elementsValue, i);
			}

			return React.cloneElement(element, props);
		});
	}

	items() {

		const items = this.state.items,
			propsValue = Array.isArray(this.props.value) ? this.props.value : [];

		propsValue.forEach((value, key) => {

			items[key] = Object.assign(items[key] || {}, value || {});
		});

		return items.filter((item) => !this.isEmpty(item));
	}

	removeItem(i) {

		let items = JSON.parse(JSON.stringify(this.state.items)) || {};

		delete items[i];

		items = items.filter((item) => !this.isEmpty(item))

		this.setState({items});

		this.onChange(items);

	}

	render() {

		const itemsEl = this.items().map((values, i) => {

			return (
				<div className="bf-repeater-item" key={i}>
					<div className="bf-repeater-item-title ui-sortable-handle">
						<h5>
							<span className="handle-repeater-title-label">{this.props.itemTitle}</span>
							<span className="handle-repeater-item"></span>
							<span className="bf-remove-repeater-item-btn no-event" onClick={() => this.removeItem(i)}>
								<span className="dashicons dashicons-trash"></span>
								{this.props.deleteLabel}
							</span>
						</h5>
					</div>

					<div className="repeater-item-container bf-clearfix">
						{this.prepareChildrenElements(this.props.children, values, i)}
					</div>
				</div>
			)
		});

		return (

			<div className="bf-controls bf-nonrepeater-controls bf-controls-repeater-option no-desc bf-clearfix">
				<div className="bf-repeater-items-container bf-clearfix">
					{itemsEl}
				</div>
				<button className="bf-clone-repeater-item bf-button bf-main-button no-event"
						onClick={this.appendItem.bind(this)}
						dangerouslySetInnerHTML={{__html: this.props.addLabel}}>
				</button>
			</div>
		)
	}
}

module.exports = BF_Repeater;
