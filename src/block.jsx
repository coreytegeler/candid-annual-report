import React from "react";
import ReactHtmlParser from 'react-html-parser';
import { render } from "react-dom";


class Block extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		}
	}

	componentDidMount() {
		const { masonry, post } = this.props,
					{ ID } = post,
					block = document.getElementById("block-"+ID),
					img = block.querySelector("img");
		if(masonry) {
			masonry.addItems(block);
			masonry.layout();
		}
		if(img) {
			img.addEventListener("load", function() {
				masonry.layout();
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {

	}

	getContent(e) {
		e.preventDefault();
		const self = this,
					req = siteSettings.url.api + "get_post?id=" + e.currentTarget.dataset.id;
		this.props.openOverlay({});
		fetch(req)
			.then(function(res) {
				if (!res.ok) {
					throw Error(res.statusText);
				}
				return res.json();
			})
			.then(function(res) {
				self.props.openOverlay(res, true);
			});
	}

	renderContent(post) {
		const { post_title, post_content, ID, url, width, height, border, link, category, image, image_type } = post;
		switch(category.slug) {
			case "feature":
				return(
					<div className={`block-content ${image_type ? "image-"+image_type : null}`} style={ image? { backgroundImage: `url(${image.sizes.medium_large})` } : null }>
						<div className="title">{ post_title }</div>
						<div className="read-link">Read the story</div>
					</div>
				);
				break;
			case "sidebar":
				return(
					<div className="block-content">
						<div className="title">{ post_title }</div>
						<div className="read-link">Read the story</div>
					</div>
				);
				break;
			case "timeline":
				return(
					<div className={`block-content ${image_type ? "image-"+image_type : null}`} style={{ backgroundImage: `url(${image.sizes.medium_large})` }}>
						<div className="text">
							<div className="category">See Year One Timeline</div>
							<div className="date">{ post.date }</div>
							<div className="title">{ post_title }</div>
						</div>
					</div>
				);
				break;
			case "quotes":
				return(
					<div className="block-content">
						<div className="body">{ ReactHtmlParser(post_content) }</div>
						<div className="quote-by">{ post.quote_by }</div>
					</div>
				);
				break;
			case "staff-stats":
				return(
					<div className="block-content">
						<div className="category">See Staff Stats</div>
						<div className="title">{ post_title }</div>
						<div className="body">{ ReactHtmlParser(post_content) }</div>
					</div>
				);
				break;
			case "fdo-stats":
				return(
					<div className="block-content">
						<div className="category">See FDO Stats</div>
						<div className="title">{ post_title }</div>
						<div className="body">{ ReactHtmlParser(post_content) }</div>
					</div>
				);
				break;
			case "timeline":
				break;
		}
	}


	render() {
		const { post, visible, frozen } = this.props,
					{ post_title, post_content, ID, url, color, width, height, border, format, link, category } = post,
					{ pages } = siteSettings,
					catSlug = category.slug;
		let page_url, page_id;
		if(pages.hasOwnProperty(catSlug)) {
			const page = pages[catSlug];
			page_url = page.url;
			page_id = page.ID;
		}
		return(
			<React.Fragment>
				<div className={`block ${color} ${width} ${height} ${border} ${format} ${category ? category.slug : 'default'}`} id={`block-${ID}`}>
					<a href={ frozen ? null : ( page_url ? page_url : url ) }
						 className="block-inner"
						 data-id={ page_id ? page_id : ID }
						 onClick={ frozen ? null : this.getContent.bind(this)} >
						{ this.renderContent(post) }
					</a>
				</div>
			</React.Fragment>
		);
	}

}

export default Block;