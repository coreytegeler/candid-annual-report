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
		// window.removeEventListener("resize", this.handleResize.bind(this));
	}

	handleResize() {
		const { masonry } = this.state;
		if(masonry) {
			masonry.layout();
		}
	}

	getBlocks() {
		const self = this,
					{ post } = this.props,
					category = siteSettings.categories[post.post_name];
		if(category) {
			const req = siteSettings.url.api + "get_posts?cat=" + category.term_id;
			console.log(req);
			fetch(req)
				.then(function(res) {
					if (!res.ok) {
						throw Error(res.statusText);
					}
					return res.json();
				})
				.then(function(res) {
					console.log(res);
					self.setState({
						blocks: res
					});
				});
			}
	}

	renderBlocks() {
		const self = this,
					{ blocks, masonry } = this.state;
		let blockElems = [],
				lastMonth = '';
		if(blocks) {
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
						frozen={ true }
						masonry={ masonry }
						openOverlay={self.props.openOverlay.bind(self)} />
				);
			});
			return blockElems;
		}
	}

	render() {
		const { post } = this.props,
					{ post_title, post_name, ID, post_content } = post;
		return(
			<div className="overlay page">
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
					<main id={ post_name }>
						<div className="grid-sizer block small"></div>
						{ this.renderBlocks() }
					</main>
				</article>
			</div>
		);
	}

}

export default Page;