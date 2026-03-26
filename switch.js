class BF_Switch extends wp.element.Component {

    constructor() {

        super(...arguments);

        this.inputField = React.createRef();

    }

    componentDidMount() {

        this.inputField.current.addEventListener('input', this.onChange.bind(this), false)
    }

    componentWillUnmount() {

        this.inputField.current.removeEventListener('input', this.onChange.bind(this), false)

    }

    onChange() {

        if (this.props.onChange) {

        	let value = parseInt(this.inputField.current.value);

        	if(value && typeof this.props.onValue !== 'undefined') {

				value = this.props.onValue;

			} else if(!value && typeof this.props.offValue !== 'undefined') {

				value = this.props.offValue;
			}

            this.props.onChange(value);
        }
    }

    render() {

        const intValue = parseInt(this.props.value),
			checked = isNaN(intValue) ? !!this.props.value : !!intValue;


        return (

            <div className="bf-switch bf-clearfix">
                <label
                    className={"cb-enable" + (checked ? ' selected' : '')}><span>{this.props.onLabel}</span></label>
                <label
                    className={"cb-disable" + (checked ? '' : ' selected')}><span>{this.props.offLabel}</span></label>

                <input type="hidden" value="0" className="checkbox" ref={this.inputField}/>
            </div>
        )
    }
}

module.exports = BF_Switch;
