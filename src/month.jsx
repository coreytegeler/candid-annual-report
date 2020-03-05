import React from "react";
import ReactHtmlParser from 'react-html-parser';
import { render } from "react-dom";


class Month extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		}
	}

	componentDidMount() {
		const { masonry, month } = this.props,
					block = document.getElementById("month-"+month);
		if(masonry) {
			masonry.addItems(block);
			masonry.layout();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {

	}

	getContent(e) {
		
	}

	render() {
		const { month } = this.props,
					months = ["January","February","March","April","May","June","July","August","September","October","November","December"],
					monthTitle = months[month];
		return(
			<div className="block sm-width month-label" id={ "month-"+month }>
				{ monthTitle }
			</div>
		);
	}

}

export default Month;