import React from "react";
import { render } from "react-dom";


class FilterBlock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		}
	}

	componentDidMount() {
		const { masonry, post, index } = this.props,
					blocks = document.getElementsByClassName("filter-block");
		if(masonry) {
			blocks.forEach(function(block) {
				masonry.addItems(block);
			});
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
				<div className="block filter-block sm-width">
					<div className="block-inner">
						<a href={siteSettings.url.root} onClick={this.clearParams.bind(this)}>
							<div className="back-button"></div>
							<span>{this.props.filter.name} selected</span>
							<br/><br/>
					  	<span>Back to see everything</span>
				  	</a>
			  	</div>
				</div>
			</React.Fragment>
		);
	}

}

export default FilterBlock;