import React from "react";
import { render } from "react-dom";
import ReactHtmlParser from 'react-html-parser';
import Masonry from "masonry-layout";
import Block from './block';


class Post extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			posts: []
		}
	}

	componentDidMount() {
		this.getPosts();
		const main = document.querySelector('#article-blocks');
		let masonry = new Masonry( main, {
			itemSelector: ".block",
			columnWidth: ".grid-sizer",
			transitionDuration: 0
		} );
	}

	componentDidUpdate(prevProps, prevState, snapshot) {

	}

	getPosts() {
		const self = this,
					{ filter } = this.props.post;
		if(filter) {
			const req = siteSettings.url.api + "get_posts?filter=" + filter.term_id;
			fetch(req)
				.then(function(res) {
					if (!res.ok) {
						throw Error(res.statusText);
					}
					return res.json();
				})
				.then(function(res) {
					self.setState({
						posts: res
					});
				});
		}
	}

	renderBlocks() {
		const self = this,
					{ posts } = this.state,
					{ masonry, post } = this.props;
		let blockElems = [];
		posts.forEach(function(block, i) {
			blockElems.push(
				<Block
					key={ i }
					post={ block }
					page={ post }
					masonry={ masonry }
					openOverlay={self.props.openOverlay.bind(self)} />
			)
		} );
		return blockElems;
	}

	render() {
		const { post } = this.props,
					{ post_title, post_name, ID, post_content, category} = post;
		return(
			<div className={`overlay post ${category ? category.slug : null}`}>
				<article>
					<header id="overlay-header">
						<div className="overlay-top">
							<a href={ siteSettings.url.root }
								className="back-button"
								onClick={this.props.closeOverlay.bind(this)}>
							</a>
						</div>
						<h2>{ post_title ? <span>{ post_title }</span> : <div className="filler"></div> }</h2>
					</header>
					<div className="body">
						{ post_content ? ReactHtmlParser( post_content ) : <div className="filler"></div> }
					</div>
				</article>
				<div id="article-blocks" className="masonry">
					<div className="grid-sizer block sm-width"></div>
					{ /*this.renderBlocks()*/ }
				</div>
			</div>
		);
	}

}

export default Post;