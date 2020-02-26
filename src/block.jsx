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
					req = siteSettings.url.api + e.currentTarget.dataset.apiLink;
		this.props.openOverlay({});
		fetch(req)
			.then(function(res) {
				if (!res.ok) {
					throw Error(res.statusText);
				}
				return res.json();
			})
			.then(function(res) {
				self.props.openOverlay(res);
			});
	}

	render() {
		const { post, visible } = this.props,
					{ post_title, post_content, ID, url, color, size, border, format, link, category } = post;
		return(
			<React.Fragment>
				<div className={`block ${color} ${size} ${border} ${format} ${category.slug || 'default'}`} id={`block-${ID}`}>
					{ link ?
						<a href={ link.url }
							 className="block-inner" 
							 data-api-link={ link.api_url }
							 onClick={this.getContent.bind(this)} >
							{ ReactHtmlParser(post_content) }
						</a> :
						<div className="block-inner">
							{ ReactHtmlParser(post_content) }
						</div>
					}
				</div>
			</React.Fragment>
		);
	}

}

export default Block;