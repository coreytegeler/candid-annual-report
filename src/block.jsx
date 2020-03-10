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
			if(img) {
				img.addEventListener("load", function() {
					masonry.layout();
				});
			}
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
		const { frozen, page } = this.props,
					{ post_title, post_content, post_type, ID, url, width, height, border, link, category, image, image_type, text_size, text_weight } = post,
					block_type = category ? category.slug : post_type;
		let blockContent;
		if(block_type == "feature") {
			return(
				<div className={`block-content ${image_type ? "image-"+image_type : null}`} style={ image ? { backgroundImage: `url(${image})` } : null }>
					<div className="title">{ post_title }</div>
					<div className="read-link">Read the story</div>
				</div>
			);
		}
		if(block_type == "sidebar") {
			return(
				<div className="block-content">
					<div className="title">{ post_title }</div>
					<div className="read-link">Read the story</div>
				</div>
			);
		}
		if(block_type == "timeline") {
			return(
				<div className={`block-content ${image_type ? "image-"+image_type : null}`} style={ image ? { backgroundImage: `url(${image})` } : null }>
					<div className="text">
						<div className="category">See Year One Timeline</div>
						<div className="date">{ post.date }</div>
						<div className="title">{ post_title }</div>
					</div>
				</div>
			);
		}
		if(block_type == "quotes") {
			return(
				<div className="block-content">
					<div className="body">{ ReactHtmlParser(post_content) }</div>
					<div className="quote-by">{ post.quote_by }</div>
				</div>
			);
		}
		if(block_type == "staff-stats" || page.post_name == "staff-stats") {
			return(
				<div className="block-content">
					{ frozen ? null : <div className="category">See Staff Stats</div> }
					<div className="title">{ post_title }</div>
					<div className="body">{ ReactHtmlParser(post_content) }</div>
				</div>
			);
		}
		if(block_type == "fdo-stats" || page.post_name == "fdo-stats") {
			const { text_size, text_weight } = post;
			return(
				<div className="block-content">
					{ frozen ? null : <div className="category">See FDO Stats</div> }
					<div className={`title ${ text_size } ${ text_weight }`}>{ post_title }</div>
					<div className="body">{ ReactHtmlParser(post_content) }</div>
				</div>
			);
		}
		if(block_type == "event") {
			return(
				<div className="block-content">
					<div className="body">{ ReactHtmlParser(post_content) }</div>
				</div>
			);
		}
		if(block_type == "stat") {
			// return(
			// 	<div className="block-content">
			// 		<div className="title">{ post_title }</div>
			// 		<div className="body">{ ReactHtmlParser(post_content) }</div>
			// 	</div>
			// );
		}
		if(block_type == "outtake") {
			return(
				<div className="block-content">
					<div className="title">{ post_title }</div>
					<div className="body">{ ReactHtmlParser(post_content) }</div>
				</div>
			);
		}
	}


	render() {
		const { post, visible, frozen, month, page } = this.props,
					{ post_title, post_content, post_type, ID, url, category, image_type } = post,
					{ pages } = siteSettings,
					block_type = category ? category.slug : post_type;
		let page_url, page_id;
		if(pages.hasOwnProperty(block_type)) {
			const page = pages[block_type];
			page_url = page.url;
			page_id = page.ID;
		}
		const classProps = ["color", "width", "height", "border", "format", "block_type"],
					classNames = ["block", block_type, post_type, page.post_name];
		if(image_type) {
			classNames.push("has-image");
		}
		classProps.forEach(function(prop) {
			if(post.hasOwnProperty(prop)) {
				classNames.push(post[prop]);
			}
		});
		return(
			<React.Fragment>
				<div className={classNames.join(" ")} id={`block-${ID}`}>
					{ month ? <div className="month-label">{month}</div> : null }
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