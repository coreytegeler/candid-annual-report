<?php
function candid_2019_scripts() {
	global $post;
	$ver = '0.0.1';
	$env = ( in_array( $_SERVER['REMOTE_ADDR'], array( '127.0.0.1', '::1' ) ) ? 'dev' : 'prod' );

	$vendor_script_url = get_stylesheet_directory_uri() . '/dist/vendors'.( $env == 'prod' ? '.min' : '' ) . '.js';
	$app_script_url = get_stylesheet_directory_uri() . '/dist/app'.( $env == 'prod' ? '.min' : '' ) . '.js';

	wp_enqueue_script( 'vendor_script', $vendor_script_url, array(), $ver, true );
	wp_enqueue_script( 'app_script', $app_script_url, array(), $ver, true );

	wp_enqueue_style( 'app_style', get_stylesheet_directory_uri() . '/dist/app.css' );

	$url = trailingslashit( home_url() );
	$path = trailingslashit( parse_url( $url, PHP_URL_PATH ) );

	// $cats = get_terms( 'block_category' );
	// $block_cats = array();
	// foreach( $cats as $cat ) {
	// 	$block_cats[$cat->slug] = $cat;
	// }

	$cats = get_terms( 'category' );
	$cat_slugs = array();
	foreach( $cats as $cat ) {
		if( $cat->slug !== 'default' ) {
			$cat_slugs[$cat->slug] = $cat;
		}
	}


	$pages = get_pages();
	$page_slugs = array();
	foreach( $pages as $page ) {
		$page->url = get_permalink( $page );
		$page_slugs[$page->post_name] = $page;
	}

	// $post_api =  esc_url_raw( get_rest_url( null, '/wp/v2/' . $post->post_type . 's/' . $post->ID ) );
	// $post_api_res = wp_remote_get( $post_api );
	// $post_api_data = wp_remote_retrieve_body( $post_api_res );
	// if ( !is_wp_error( $post_api_data )  ) {
	// 	$post_api_json = json_decode( $post_api_data );
	// }
	
	$post->url = get_permalink( $post );

	$categories = get_the_category( $post );
	if( is_array( $categories ) && sizeof( $categories ) ) {
		$category = get_the_category( $post )[0];
		$post->category = $category;
	}

	wp_scripts()->add_data( 'app_script', 'data', sprintf( 'var siteSettings = %s;', wp_json_encode( 
		array(
			'title' => get_bloginfo( 'name', 'display' ),
			'tagline' => get_bloginfo( 'description', 'display' ),
			'path' => $path,
			'template' => str_replace( 'page-', '', basename( get_page_template_slug(), '.php' ) ),
			'url' => array(
				'api' => esc_url_raw( get_rest_url( null, '/wp/v2/' ) ),
				'root' => esc_url_raw( $url ),
				'theme' => esc_url_raw( get_stylesheet_directory_uri() )
			),
			'current' => $post,
			'home_id' => intval( get_option( 'page_on_front' ) ),
			'categories' => $cat_slugs,
			'pages' => $page_slugs
		)
	) ) );

}
add_action( 'wp_enqueue_scripts', 'candid_2019_scripts' );


function get_post_endpoint() {

	$id = $_GET['id'];
	$post = get_post( $id );

	$post->type = get_field( 'article_type', $post );
	$post->link = get_permalink( $post );

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
		$post->type = get_field( 'article_type', $post );
		$post->url = get_permalink( $post );
		$post->width = get_field( 'width', $post );
		$post->height = get_field( 'height', $post );
		$post->image = get_field( 'image', $post );
		$post->image_type = get_field( 'image_type', $post );

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

		$categories = get_the_category( $post );
		if( is_array( $categories ) && sizeof( $categories ) ) {
			$category = get_the_category( $post )[0];
			$post->category = $category;
		}
		$posts[$key] = $post;
	}

	return $posts;

}


function get_blocks_endpoint() {
	$page_id = $_GET['page'];
	$page = get_post( $page_id );
	$blocks = get_field( 'blocks', $page );
	if( $blocks ) {
		foreach( $blocks as $block ) {
			$block->url = get_permalink( $block );

			if( $link = get_field( 'link', $block ) ) {
				$link->url = get_permalink( $link );
				$link->api_url = $link->post_type . 's/' . $link->ID;
				$block->link = $link;
			}

			if( $date = get_field( 'date', $block ) ) {
				$block->date = $date;
			}

			$block->color = get_field( 'color', $block );
			$block->width = get_field( 'width', $block );
			$block->height = get_field( 'height', $block );
			$block->format = get_field( 'format', $block );
			$block->image = get_field( 'image', $block );
			$block->image_type = get_field( 'image_type', $block );

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

			// $categories = get_the_terms( $block, 'block_category' );
			$categories = get_the_terms( $block, 'category' );
			if( is_array( $categories ) && sizeof( $categories ) ) {
				$category = $categories[0];
				$block->category = $category;
			} else {
				$block->category = array('slug' => false);
			}

			switch( $block->category->slug) {
				case "timeline":
					$block->date = get_field( 'date', $block );
					break;
				case "quotes":
					$block->quote_by = get_field( 'quote_by', $block );
					break;
				default:
					break;
			}


		}
		return $blocks;
	} else {
		return false;
	}

}

add_action( 'rest_api_init', 'register_endpoints' );

function register_blocks() {
	$labels = array(
		'name'                  => _x( 'Blocks', 'Post type general name', 'textdomain' ),
		'singular_name'         => _x( 'Block', 'Post type singular name', 'textdomain' ),
		'menu_name'             => _x( 'Blocks', 'Admin Menu text', 'textdomain' ),
		'name_admin_bar'        => _x( 'Block', 'Add New on Toolbar', 'textdomain' ),
		'add_new'               => __( 'Add New', 'textdomain' ),
		'add_new_item'          => __( 'Add New Block', 'textdomain' ),
		'new_item'              => __( 'New Block', 'textdomain' ),
		'edit_item'             => __( 'Edit Block', 'textdomain' ),
		'view_item'             => __( 'View Block', 'textdomain' ),
		'all_items'             => __( 'All Blocks', 'textdomain' ),
		'search_items'          => __( 'Search Blocks', 'textdomain' ),
		'parent_item_colon'     => __( 'Parent Blocks:', 'textdomain' ),
		'not_found'             => __( 'No blocks found.', 'textdomain' ),
		'not_found_in_trash'    => __( 'No blocks found in Trash.', 'textdomain' )
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'menu_icon'					 => 'dashicons-screenoptions',
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array( 'slug' => 'block' ),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => 4,
		'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments' ),
		'show_in_rest' 			 => true
	);

	register_post_type( 'block', $args );
}
 
add_action( 'init', 'register_blocks' );

function register_block_categories() {
	$labels = array(
		'name'              => _x( 'Block Categories', 'taxonomy general name' ),
		'singular_name'     => _x( 'Block Category', 'taxonomy singular name' ),
		'search_items'      => __( 'Search Block Categories' ),
		'all_items'         => __( 'All Block Categories' ),
		'parent_item'       => __( 'Parent Block Category' ),
		'parent_item_colon' => __( 'Parent Block Category:' ),
		'edit_item'         => __( 'Edit Block Category' ), 
		'update_item'       => __( 'Update Block Category' ),
		'add_new_item'      => __( 'Add New Block Category' ),
		'new_item_name'     => __( 'New Block Category' ),
		'menu_name'         => __( 'Block Categories' ),
	);
	$args = array(
		'labels' => $labels,
		'hierarchical' => true,
		'show_in_rest' => true,
	);
	register_taxonomy( 'block_category', 'block', $args );
}
add_action( 'init', 'register_block_categories', 0 );

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
		'menu_position'      => 5,
		'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments' ),
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
		'menu_position'      => 6,
		'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments' ),
		'show_in_rest' 			 => true
	);

	register_post_type( 'event', $args );
}
add_action( 'init', 'register_events' );


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
 

?>