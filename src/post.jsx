import React from "react";
import { render } from "react-dom";
import ReactHtmlParser from 'react-html-parser';


class Post extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			
		}
	}

	componentDidMount() {
	
	}

	componentDidUpdate(prevProps, prevState, snapshot) {

	}

	render() {
		const { post } = this.props,
					{ title, slug, id, content } = post;
		return(
			<div className="overlay">
				<a href={ siteSettings.url.root }
					className="back-button"
					onClick={this.props.closeOverlay.bind(this)}>
				</a>
				<h2>{ title ? title.rendered : <div className="filler"></div> }</h2>
				<article>
					{ content ? ReactHtmlParser( content.rendered ) : <div className="filler"></div> }
				</article>
			</div>
		);
	}

}

export default Post;