<?php
function candid_2019_scripts() {
	global $post;
	$ver = '0.1.2';
	$env = ( in_array( $_SERVER['REMOTE_ADDR'], array( '127.0.0.1', '::1' ) ) ? 'dev' : 'prod' );

	$vendor_script_url = get_stylesheet_directory_uri() . '/dist/vendors'.( $env == 'prod' ? '.min' : '' ) . '.js';
	$app_script_url = get_stylesheet_directory_uri() . '/dist/app'.( $env == 'prod' ? '.min' : '' ) . '.js';

	wp_enqueue_script( 'vendor_script', $vendor_script_url, array(), $ver, true );
	wp_enqueue_script( 'app_script', $app_script_url, array(), $ver, true );

	// wp_enqueue_style( 'fonts_style', 'http://cdn.candid.org/base/candid-base.css' );
	wp_enqueue_style( 'algebra', 'https://cdn.candid.org/fonts/algebra/algebra.css' );
	wp_enqueue_style( 'Akkurat-Bold', 'https://cdn.candid.org/fonts/akkurat/Akkurat-Bold/css/stylesheet.css' );
	wp_enqueue_style( 'Akkurat-BoldItalic', 'https://cdn.candid.org/fonts/akkurat/Akkurat-BoldItalic/css/stylesheet.css' );
	wp_enqueue_style( 'Akkurat-Italic', 'https://cdn.candid.org/fonts/akkurat/Akkurat-Italic/css/stylesheet.css' );
	wp_enqueue_style( 'Akkurat-Regular', 'https://cdn.candid.org/fonts/akkurat/Akkurat-Regular/css/stylesheet.css' );
	wp_enqueue_style( 'app_style', get_stylesheet_directory_uri() . '/dist/app.css', null, $ver );

	$url = trailingslashit( home_url() );
	$path = trailingslashit( parse_url( $url, PHP_URL_PATH ) );
	$home_id = intval( get_option( 'page_on_front' ) );

	// $cats = get_terms( 'filter' );
	// $block_cats = array();
	// foreach( $cats as $cat ) {
	// 	$block_cats[$cat->slug] = $cat;
	// }

	$_categories = get_terms( 'category' );
	$categories = array();
	foreach( $_categories as $category ) {
		if( $category->slug !== 'default' ) {
			$categories[$category->slug] = $category;
		}
	}

	$_filters = get_terms( 'filter' );
	$filters = array();
	foreach( $_filters as $filter ) {
		if( $filter->slug !== 'default' ) {
			$filters[$filter->slug] = $filter;
		}
	}


	$pages = get_pages();
	$page_slugs = array();
	foreach( $pages as $page ) {
		$page->url = get_permalink( $page );
		$page->page_type = get_page_type( $page );
		$page_slugs[$page->post_name] = $page;
	}

	// $post_api =  esc_url_raw( get_rest_url( null, '/wp/v2/' . $post->post_type . 's/' . $post->ID ) );
	// $post_api_res = wp_remote_get( $post_api );
	// $post_api_data = wp_remote_retrieve_body( $post_api_res );
	// if ( !is_wp_error( $post_api_data )  ) {
	// 	$post_api_json = json_decode( $post_api_data );
	// }
	if( isset( $post ) ) {
		$post->url = get_permalink( $post );
		$post->blocks = get_blocks( $post );
		$post->page_type = get_page_type( $post );
		$post->category = get_post_category( $post );
		$post->filter = get_post_filter( $post );
	}

	wp_scripts()->add_data( 'app_script', 'data', sprintf( 'var siteSettings = %s;', wp_json_encode( 
		array(
			'title' => get_bloginfo( 'name', 'display' ),
			'tagline' => get_bloginfo( 'description', 'display' ),
			'path' => $path,
			'page_type' => get_page_type( $post ),
			'url' => array(
				'api' => esc_url_raw( get_rest_url( null, '/wp/v2/' ) ),
				'root' => esc_url_raw( $url ),
				'theme' => esc_url_raw( get_stylesheet_directory_uri() )
			),
			'current' => $post,
			'home_id' => $home_id,
			'categories' => $categories,
			'filters' => $filters,
			'pages' => $page_slugs
		)
	) ) );

}
add_action( 'wp_enqueue_scripts', 'candid_2019_scripts' );

function get_post_category( $post ) {
	$categories = get_the_category( $post );
	if( $post->post_type == 'post' && $categories ) {
		$category = get_the_category( $post )[0];
	} else {
		$category = array( 'slug' => null );
	}
	return $category;
}

function get_post_filter( $post ) {
	$filters = get_the_terms( $post, 'filter' );
	if( $filters ) {
		$filter = get_the_terms( $post, 'filter' )[0];
	} else {
		$filter = array( 'slug' => null );
	}
	return $filter;
}

function get_page_type( $post ) {
	return str_replace( 'page-', '', basename( get_page_template_slug( $post ), '.php' ) );
}

function get_post_endpoint() {

	$id = $_GET['id'];
	$post = get_post( $id );

	$post->type = get_field( 'article_type', $post );
	$post->link = get_permalink( $post );
	$post->page_type = get_page_type( $post );
	$post->category = get_post_category( $post );
	$post->filter = get_post_filter( $post );

	return $post;

}


function get_posts_endpoint() {

	$args = array(
		'post_type' => 'post',
		'posts_per_page'=> -1,
	);

	if( isset( $_GET['cat'] ) ) {
		$cat = $_GET['cat'];
		$args['category'] = $cat;
		// $args['posts_per_page'] = -1;
	}
	$posts = get_posts( $args );
	foreach ( $posts as $key => $post ) {
		$posts[$key] = $post;
		$post->page_type = get_page_type( $post );
		$post->url = get_permalink( $post );
		$post->width = get_field( 'width', $post );
		$post->height = get_field( 'height', $post );
		$post->image = get_the_post_thumbnail_url( $post, 'large' );
		$post->image_type = get_field( 'image_type', $post );

		$post->text_size = get_field( 'text_size', $post );
		$post->text_weight = get_field( 'text_weight', $post );

		$post->border = '';
		if( $border_color = get_field( 'border_color', $post ) ) {
			$post->border .= 'border-' . $border_color;
		}
		if( $border_style = get_field( 'border_style', $post ) ) {
			if( strlen( $post->border ) ) {
				$post->border .= ' ';	
			}
			$post->border .= 'border-' . $border_style;
		}
		$post->category = get_post_category( $post );
		$post->filter = get_post_filter( $post );
		
		$posts[$key] = $post;
	}

	return $posts;

}


function get_blocks_endpoint() {
	$page_id = $_GET['page'];
	$page = get_post( $page_id );
	return get_blocks( $page );
}

function get_blocks( $page ) {
	$blocks = get_field( 'blocks', $page );
	if( $blocks ) {
		foreach( $blocks as $block ) {
			$block->url = get_permalink( $block );

			if( $link = get_field( 'link', $block ) ) {
				$link->url = get_permalink( $link );
				$link->api_url = $link->post_type . 's/' . $link->ID;
				$block->link = $link;
			}

			$date = get_field( 'date', $block );
			if( $date ) {
				$block->date = $date;
			}
			$quote_by = get_field( 'quote_by', $block );
			if( $quote_by ) {
				$block->quote_by = $quote_by;
			}

			$block->color = get_field( 'color', $block );
			$block->width = get_field( 'width', $block );
			$block->height = get_field( 'height', $block );
			$block->image = get_the_post_thumbnail_url( $block, 'large' );
			$block->image_type = get_field( 'image_type', $block );

			$block->text_size = get_field( 'text_size', $block );
			$block->text_weight = get_field( 'text_weight', $block );

			$block->border = '';
			if( $border_color = get_field( 'border_color', $block ) ) {
				$block->border .= 'border-' . $border_color;
			}
			if( $border_style = get_field( 'border_style', $block ) ) {
				if( strlen( $block->border ) ) {
					$block->border .= ' ';	
				}
				$block->border .= 'border-' . $border_style;
			}

			$block->category = get_post_category( $block );
			$block->filter = get_post_filter( $block );

		}
		return $blocks;
	} else {
		return false;
	}
}

function remove_support() {
  remove_post_type_support( 'post', 'excerpt' );
}
add_action('init', 'remove_support');

add_theme_support( 'post-thumbnails' );

function register_filters() {
	$labels = array(
		'name'              => _x( 'Filters', 'taxonomy general name' ),
		'singular_name'     => _x( 'Filter', 'taxonomy singular name' ),
		'search_items'      => __( 'Search Filters' ),
		'all_items'         => __( 'All Filters' ),
		'parent_item'       => __( 'Parent Filter' ),
		'parent_item_colon' => __( 'Parent Filter:' ),
		'edit_item'         => __( 'Edit Filter' ), 
		'update_item'       => __( 'Update Filter' ),
		'add_new_item'      => __( 'Add New Filter' ),
		'new_item_name'     => __( 'New Filter' ),
		'menu_name'         => __( 'Filters' ),
	);
	$args = array(
		'labels' => $labels,
		'hierarchical' => true,
		'show_in_rest' => true,
	);
	register_taxonomy( 'filter', 'post', $args );
}
add_action( 'init', 'register_filters', 0 );


function register_stat_types() {
	$labels = array(
		'name'              => _x( 'Stat Types', 'taxonomy general name' ),
		'singular_name'     => _x( 'Stat Type', 'taxonomy singular name' ),
		'search_items'      => __( 'Search Stat Types' ),
		'all_items'         => __( 'All Stat Types' ),
		'parent_item'       => __( 'Parent Stat Type' ),
		'parent_item_colon' => __( 'Parent Stat Type:' ),
		'edit_item'         => __( 'Edit Stat Type' ), 
		'update_item'       => __( 'Update Stat Type' ),
		'add_new_item'      => __( 'Add New Stat Type' ),
		'new_item_name'     => __( 'New Stat Type' ),
		'menu_name'         => __( 'Stat Types' ),
	);
	$args = array(
		'labels' => $labels,
		'hierarchical' => true,
		'show_in_rest' => true,
	);
	register_taxonomy( 'stat_type', 'stat', $args );
}
add_action( 'init', 'register_stat_types', 0 );


function register_stats() {
	$labels = array(
		'name'                  => _x( 'Stats', 'Post type general name', 'textdomain' ),
		'singular_name'         => _x( 'Stat', 'Post type singular name', 'textdomain' ),
		'menu_name'             => _x( 'Stats', 'Admin Menu text', 'textdomain' ),
		'name_admin_bar'        => _x( 'Stat', 'Add New on Toolbar', 'textdomain' ),
		'add_new'               => __( 'Add New', 'textdomain' ),
		'add_new_item'          => __( 'Add New Stat', 'textdomain' ),
		'new_item'              => __( 'New Stat', 'textdomain' ),
		'edit_item'             => __( 'Edit Stat', 'textdomain' ),
		'view_item'             => __( 'View Stat', 'textdomain' ),
		'all_items'             => __( 'All Stats', 'textdomain' ),
		'search_items'          => __( 'Search Stats', 'textdomain' ),
		'parent_item_colon'     => __( 'Parent Stats:', 'textdomain' ),
		'not_found'             => __( 'No stats found.', 'textdomain' ),
		'not_found_in_trash'    => __( 'No stats found in Trash.', 'textdomain' )
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'menu_icon'					 => 'dashicons-chart-area',
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array( 'slug' => 'stat' ),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => 4,
		'supports'           => array( 'title', 'editor', 'author', 'thumbnail' ),
		'show_in_rest' 			 => true
	);

	register_post_type( 'stat', $args );
}
add_action( 'init', 'register_stats' );

function register_events() {
	$labels = array(
		'name'                  => _x( 'Events', 'Post type general name', 'textdomain' ),
		'singular_name'         => _x( 'Event', 'Post type singular name', 'textdomain' ),
		'menu_name'             => _x( 'Events', 'Admin Menu text', 'textdomain' ),
		'name_admin_bar'        => _x( 'Event', 'Add New on Toolbar', 'textdomain' ),
		'add_new'               => __( 'Add New', 'textdomain' ),
		'add_new_item'          => __( 'Add New Event', 'textdomain' ),
		'new_item'              => __( 'New Event', 'textdomain' ),
		'edit_item'             => __( 'Edit Event', 'textdomain' ),
		'view_item'             => __( 'View Event', 'textdomain' ),
		'all_items'             => __( 'All Events', 'textdomain' ),
		'search_items'          => __( 'Search Events', 'textdomain' ),
		'parent_item_colon'     => __( 'Parent Events:', 'textdomain' ),
		'not_found'             => __( 'No events found.', 'textdomain' ),
		'not_found_in_trash'    => __( 'No events found in Trash.', 'textdomain' )
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'menu_icon'					 => 'dashicons-calendar-alt',
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array( 'slug' => 'event' ),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => 5,
		'supports'           => array( 'title', 'editor', 'author', 'thumbnail' ),
		'show_in_rest' 			 => true
	);

	register_post_type( 'event', $args );
}
add_action( 'init', 'register_events' );


function register_outtakes() {
	$labels = array(
		'name'                  => _x( 'Outtakes', 'Post type general name', 'textdomain' ),
		'singular_name'         => _x( 'Outtake', 'Post type singular name', 'textdomain' ),
		'menu_name'             => _x( 'Outtakes', 'Admin Menu text', 'textdomain' ),
		'name_admin_bar'        => _x( 'Outtake', 'Add New on Toolbar', 'textdomain' ),
		'add_new'               => __( 'Add New', 'textdomain' ),
		'add_new_item'          => __( 'Add New Outtake', 'textdomain' ),
		'new_item'              => __( 'New Outtake', 'textdomain' ),
		'edit_item'             => __( 'Edit Outtake', 'textdomain' ),
		'view_item'             => __( 'View Outtake', 'textdomain' ),
		'all_items'             => __( 'All Outtakes', 'textdomain' ),
		'search_items'          => __( 'Search Outtakes', 'textdomain' ),
		'parent_item_colon'     => __( 'Parent Outtakes:', 'textdomain' ),
		'not_found'             => __( 'No outtakes found.', 'textdomain' ),
		'not_found_in_trash'    => __( 'No outtakes found in Trash.', 'textdomain' )
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'menu_icon'					 => 'dashicons-format-status',
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array( 'slug' => 'outtake' ),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => 6,
		'supports'           => array( 'title', 'editor', 'author', 'thumbnail' ),
		'show_in_rest' 			 => true
	);

	register_post_type( 'outtake', $args );
}
 
add_action( 'init', 'register_outtakes' );


// function add_editor_style( $stylesheet = 'admin.css' ) {
// 	global $editor_styles;

// 	add_theme_support( 'editor-style' );

// 	$editor_styles = (array) $editor_styles;
// 	$stylesheet = (array) $stylesheet;

// 	$editor_styles = array_merge( $editor_styles, $stylesheet );
// }


function register_endpoints() {

	register_rest_route( 'wp/v2', '/get_post', array(
		'methods' => 'GET',
		'callback' => 'get_post_endpoint'
	));

	register_rest_route( 'wp/v2', '/get_posts', array(
		'methods' => 'GET',
		'callback' => 'get_posts_endpoint'
	));

	register_rest_route( 'wp/v2', '/get_blocks', array(
		'methods' => 'GET',
		'callback' => 'get_blocks_endpoint'
	));

};

add_action( 'rest_api_init', 'register_endpoints' );
 

?>