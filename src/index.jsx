import React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { browserHistory } from 'react-router';
import Masonry from "masonry-layout";
import publicCss from './sass/public.scss';
import Header from './header';
import Block from './block';
import CatBlock from './catblock';
import Page from './page';
import Post from './post';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			blocks: [],
			post: null,
			params: [],
			headerHeight: 0,
			masonry: null
		}
	}

	componentDidMount() {
		const { current, categories, home_id } = siteSettings;
		this.getBlocks();
		const main = document.querySelector('#main');
		let masonry = new Masonry( main, {
			itemSelector: ".block",
			columnWidth: ".grid-sizer",
			transitionDuration: 0
		} );
		this.setState({
			masonry: masonry
		});
		window.addEventListener("resize", this.handleResize.bind(this));

		const catSlugs = Object.keys(categories);
		this.updateParams([catSlugs[0]]);


		window.onpopstate = (e) => {
			if(e.state) {
				this.openOverlay(e.state, false);
			} else {
				this.setState({
					post: null
				});
			}
		}
		if(current.id !== home_id) {
			this.openOverlay(current, false);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const body = document.querySelector("body"),
					catBlock = document.getElementById("#cat-block"),
					{ masonry } = this.state;
		if(masonry && catBlock) {
			masonry.appended();
			masonry.layout();
		}	
		if(this.state.post) {
			body.classList.add("article-open");
		} else {
			body.classList.remove("article-open");
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

	clearParams() {
		const allCatSlugs = Object.keys(siteSettings.categories);
		this.setState({
			params: allCatSlugs
		});
	}

	getBlocks() {
		const { home_id } = siteSettings;
		const self = this,
					req = siteSettings.url.api + "get_blocks?page=" + home_id;
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
					{ blocks, masonry, params } = this.state;
		let blockElems = [],
				visibleBlocks = blocks.filter(post => params.indexOf(post.category.slug) > -1);
				// visibleBlocks = blocks;
		visibleBlocks.forEach(function(post, i) {
			if(typeof post === "object") {
				blockElems.push(
					<Block
						key={ i }
						post={ post }
						masonry={ masonry }
						openOverlay={self.openOverlay.bind(self)} />
				)
			} else if(params.length == 1) {
				const param = params[0],
							cat = siteSettings.categories[param];
				blockElems.push(
					<CatBlock
						key={ i }
						cat={ cat }
						masonry={ masonry }
						clearParams={self.clearParams.bind(self)} />
				)
			}
		} );

		return blockElems;
	}

	updateParams(params) {
		this.setState({
			params: params
		});
	}

	openOverlay(post, updateHistory = true) {
		if(Object.keys(post).length && updateHistory) {
			const { post_title, link } = post;
			history.pushState(post, post_title, link);
		}
		this.setState({
			post: post
		});
	}

	closeOverlay(e) {
		let { title, url } = siteSettings;
		if(e) {
			e.preventDefault();
			url = e.target.href;
		} else {
			url = url.root;
		}
		history.pushState(null, title, url);
		this.setState({
			post: null
		});
	}

	render() {
		const { params, post } = this.state
		return(
			<React.Fragment>
				<Header
					params={ params }
					closeOverlay={ this.closeOverlay.bind(this) }
					updateParams={ this.updateParams.bind(this) } />
				<main id="main">
					<div className="grid-sizer block small"></div>
					{ this.renderBlocks() }
				</main>
				{ post ?
					post.type === "post" ?
						<Post
							post={ post }
							closeOverlay={ this.closeOverlay.bind(this) } /> :
						<Page
							post={ post }
							closeOverlay={ this.closeOverlay.bind(this) } />
				: null}
			</React.Fragment>
		);
	}

}

const routes = (
	<Router>
		<Route path="/" component={ App } />
	</Router>
);

render(
	(routes), document.getElementById("page")
);