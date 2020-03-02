import React from "react";
import { render } from "react-dom";


class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			params: this.props.params
		}
	}

	componentDidMount() {
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if(this.props.params !== prevProps.params) {
			this.setState({
				params: this.props.params
			});
		}
	}

	handleFilter(e) {
		const checkbox = e.target,
					{ checked, value } = checkbox;
		let { params } = this.state;
		if(checked) {
			params.push(value);
		} else {
			params.splice(params.indexOf(value), 1);
		}
		this.setState({
			params: params
		});
		this.props.updateParams(params);
	}

	renderCategoryFilters() {
		const self = this,
					{ params } = this.state,
					{ categories } = siteSettings,
					categoryKeys = Object.keys(categories);
		let categoryFilters = [];
		categoryKeys.forEach(function(key, index) {
			const category = categories[key],
						{ slug, name } = category;
			categoryFilters.push(
				<div className="block-filter" key={key}>
					<input
						type="checkbox"
						id={ slug }
						name={ name }
						value={ slug }
						checked={ params.indexOf(slug) > -1 }
						onChange={ self.handleFilter.bind(self) } />

					<label htmlFor={ slug }>
						{ name }
					</label>
				</div>
			);
		});
		return categoryFilters;
	}

	render() {
		let { title, tagline, url } = siteSettings;
		tagline = tagline.replace("Candid.", "");
		return(
			<header id="header">
				<div id="site-header">
					<h1 id="site-title">
						<a href={url.root} onClick={this.props.closeOverlay.bind(this)}>
							It's been<br/>
							a year.
						</a>
					</h1>
					<h2 id="site-tagline">
						The 2019 annual report<br/>
						from <span className="screen-reader-text">Candid</span>
						<span className="candid-logo">.</span>
					</h2>
				</div>
				<div id="block-filters">
					<form>
						{this.renderCategoryFilters()}
					</form>
				</div>
			</header>
		);
	}

}

export default Header;