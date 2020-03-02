import React from "react";
import { render } from "react-dom";


class CatBlock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		}
	}

	componentDidMount() {
		const { masonry, post, index } = this.props,
					block = document.getElementById("cat-block");
		if(masonry) {
			masonry.addItems(block);
			masonry.layout();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {

	}

	clearParams(e) {
		e.preventDefault();
		this.props.clearParams();
	}

	render() {
		return(
			<React.Fragment>
				<div className="block sm-width" id="cat-block">
					<div className="block-inner">
						<a href={siteSettings.url.root} onClick={this.clearParams.bind(this)}>
							<div className="back-button"></div>
							<span>{this.props.cat.name} selected</span>
							<br/><br/>
					  	<span>Back to see everything</span>
				  	</a>
			  	</div>
				</div>
			</React.Fragment>
		);
	}

}

export default CatBlock;