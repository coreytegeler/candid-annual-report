import React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { browserHistory } from 'react-router';
import Masonry from "masonry-layout";
import publicCss from './sass/public.scss';
import Header from './header';
import Block from './block';
import FilterBlock from './filterblock';
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
		const self = this,
					{ current, categories, filters, home_id } = siteSettings;
		this.getBlocks();
		const main = document.querySelector('#main-blocks');
		let masonry = new Masonry( main, {
			itemSelector: ".block",
			columnWidth: ".grid-sizer",
			transitionDuration: 0
		} );
		this.setState({
			masonry: masonry
		});
		window.addEventListener("resize", this.handleResize.bind(this));

		// const filterSlugs = Object.keys(filters);
		// this.updateParams(filterSlugs);
		const firstFilter = Object.keys(filters).shift();
		this.updateParams([firstFilter]);
		

		window.onpopstate = (e) => {
			if(e.state) {
				this.openOverlay(e.state, false);
			} else {
				this.setState({
					post: null
				});
			}
		}
		if(current.ID !== home_id) {	
			this.openOverlay(current, false);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const body = document.querySelector("body"),
					filterBlocks = document.getElementsByClassName(".filter-block"),
					{ masonry } = this.state;
		if(masonry && filterBlocks) {
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

	updateParams(params) {
		this.setState({
			params: params
		});
	}

	clearParams() {
		const allFilterSlugs = Object.keys(siteSettings.filters);
		this.setState({
			params: allFilterSlugs
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
					{ blocks, masonry, params } = this.state,
					{ home, filters } = siteSettings;
		let blockElems = [],
				visibleBlocks = blocks.filter(post => params.indexOf(post.filter ? post.filter.slug : null) > -1);
				// visibleBlocks = blocks;

		
		if(params.length == 1) {
			const param = params[0],
						filter = filters[param];
			blockElems.push(
				<FilterBlock
					key={ 0 }
					filter={ filter }
					masonry={ masonry }
					clearParams={self.clearParams.bind(self)} />
			);
		}


		if(visibleBlocks) {
			visibleBlocks.forEach(function(post, i) {
				if(typeof post === "object") {
					const frozen = post.category.slug == "quotes";
					blockElems.push(
						<Block
							key={ i+1 }
							post={ post }
							page={ home }
							frozen={ frozen }
							masonry={ masonry }
							openOverlay={self.openOverlay.bind(self)} />
					)
				} else if(params.length == 1) {
					const param = params[0],
								filter = siteSettings.filters[param];
				}
			} );
		}
		return blockElems;
	}

	renderOverlay(post) {
		if(post.post_type === "post") {
			return(
				<Post
					post={ post }
					openOverlay={ this.openOverlay.bind(this) }
					closeOverlay={ this.closeOverlay.bind(this) } />
			);
		}
		if(post.post_type === "page") {
			return(
				<Page
					post={ post }
					openOverlay={ this.openOverlay.bind(this) }
					closeOverlay={ this.closeOverlay.bind(this) } />
			);
		}
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
		const { params, post } = this.state;
		return(
			<React.Fragment>
				<Header
					params={ params }
					closeOverlay={ this.closeOverlay.bind(this) }
					updateParams={ this.updateParams.bind(this) } />
				<main id="main-blocks" className="index masonry">
					<div className="grid-sizer block sm-width"></div>
					{ this.renderBlocks() }
				</main>
				{ post ? this.renderOverlay(post) : null }
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