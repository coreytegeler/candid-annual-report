import React from "react";
import { render } from "react-dom";
import ReactHtmlParser from 'react-html-parser';
import Masonry from "masonry-layout";
import Block from './block';
import Month from './month';


class Page extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			blocks: [],
			masonry: null
		}
	}

	componentDidMount() {
		
		// window.addEventListener("resize", this.handleResize.bind(this));
	}


	componentDidUpdate(prevProps, prevState, snapshot) {
		const { post } = this.props,
					{ blocks, masonry } = this.state;
		if(!blocks.length && Object.keys(post)) {
			this.getBlocks();
		}

		const main = document.querySelector('main#' + post.slug);
		if(main && !masonry) {
			let masonry = new Masonry( main, {
				itemSelector: ".block",
				columnWidth: ".grid-sizer",
				transitionDuration: 0
			} );
			this.setState({
				masonry: masonry
			});
		} else if(masonry) {
			masonry.layout();
		}	
		this.handleResize();
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.handleResize.bind(this));
	}

	handleResize() {
		const { masonry } = this.state;
		if(masonry) {
			masonry.layout();
		}
	}

	getBlocks() {
		const { post } = this.props;
		const self = this,
					req = siteSettings.url.api + "get_blocks?page=" + post.id;
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
					{ blocks, masonry } = this.state;
		let blockElems = [],
				lastMonth = '';
		blocks.forEach(function(post, i) {

			if(post.date) {
				const date = new Date(post.date),
							month = date.getMonth();
				if(lastMonth !== month) {
					lastMonth = month;
					blockElems.push(
						<Month
							key={ "month" + i }
							month={ month }
							masonry={ masonry } />
					);
				}
				
			}

			blockElems.push(
				<Block
					key={ i }
					post={ post }
					masonry={ masonry } />
			);
		});
		return blockElems;
	}

	render() {
		const { post } = this.props,
					{ title, slug, id, content } = post;
		return(
			<div className="overlay">
				<h3>
					<a href={ siteSettings.url.root }
						className="back-button"
						onClick={this.props.closeOverlay.bind(this)}>
					</a>
					{ title ? title.rendered : <div className="filler"></div> }
				</h3>
				<main id={slug}>
					<div className="grid-sizer block small"></div>
					{ this.renderBlocks() }
				</main>
			</div>
		);
	}

}

export default Page;