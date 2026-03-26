function BF_Button(props) {

	const classesName = "bf-button bf-main-button " + (props.classesName || '');

	// const customAttrs = (props.customAttrs||[]).map((attr)=>{
	//
	// 	return `${attr.key}="${attr.value}"`;
	//
	// }).join(" ");

    return (
        <div className="bf-button-field-container">

            <a className={classesName}
               dangerouslySetInnerHTML={{__html: props.name}}>
            </a>
        </div>

    )
}

module.exports = BF_Button;
