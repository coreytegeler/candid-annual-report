import React from "react";
import { render } from "react-dom";
import ReactHtmlParser from 'react-html-parser';
import Block from './block';
import Month from './month';


class Page extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			blocks: [],
		}
	}

	componentDidMount() {
		this.getBlocks();
	}


	componentDidUpdate(prevProps, prevState, snapshot) {
		
	}

	componentWillUnmount() {
	}

	handleResize() {
	}

	getBlocks() {
		const self = this,
					{ post } = this.props;
		const req = siteSettings.url.api + "get_blocks?page=" + post.ID;
		fetch(req)
			.then(function(res) {
				if (!res.ok) {
					throw Error(res.statusText);
				}
				return res.json();
			})
			.then(function(res) {
				self.setState({
					blocks: res
				});
			});
	}

	renderBlocks() {
		const self = this,
					{ post } = this.props,
					{ blocks } = this.state;
		let blockElems = [],
				lastMonth;
		blocks.forEach(function(block, i) {
			let monthTitle;
			block.category = {
				slug: block.post_type
			};
			if(block.date) {
				const date = new Date(block.date),
							month = date.getMonth(),
							months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
				if(lastMonth !== month) {
					monthTitle = months[month];
					lastMonth = month;
				} else {
					monthTitle = "\u00A0";
				}
			}
			blockElems.push(
				<Block
					key={ i }
					post={ block }
					page={ post }
					month={ monthTitle }
					frozen={ true }
					openOverlay={self.props.openOverlay.bind(self)} />
			);
		});
		return blockElems;
	}

	render() {
		const { blocks } = this.state,
					{ post } = this.props,
					{ post_title, post_name, ID, page_type, post_content } = post;
		return(
			<div className={`overlay page ${ page_type } ${ post_name }`}>
				<article>
					<header id="overlay-header">
						<div className="overlay-top">
							<a href={ siteSettings.url.root }
								className="back-button"
								onClick={this.props.closeOverlay.bind(this)}>
							</a>
							<h3>{ post_title ? <span>{ post_title }</span> : <div className="filler"></div> }</h3>
						</div>
					</header>
					<main id="page-blocks">
						<div className="grid-sizer block sm-width"></div>
						{ blocks ? this.renderBlocks() : null }
					</main>
				</article>
			</div>
		);
	}

}

export default Page;