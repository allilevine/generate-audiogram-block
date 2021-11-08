<?php
/**
 * Plugin Name:       Generate Audiogram Block
 * Description:       Generate and customize audiograms in the block editor.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            firewatch
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       generate-audiogram-block
 *
 * @package           generate-audiogram-block
 */

// Required to allow SharedArrayBuffer in supported browsers.
function generate_audiogram_block_add_cors_http_header(){
	if ( get_current_screen()->is_block_editor()) {
		header( "Cross-Origin-Opener-Policy: same-origin" );
		header( "Cross-Origin-Embedder-Policy: require-corp" );
	}
}
add_action('load-post.php','generate_audiogram_block_add_cors_http_header');
add_action('load-post-new.php','generate_audiogram_block_add_cors_http_header');

// Initialize the block.
function generate_audiogram_block_init() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'generate_audiogram_block_init' );

// Ensure font file gets loaded.
if ( ! function_exists( 'wp_handle_upload' ) ) {
    require_once( ABSPATH . 'wp-admin/includes/file.php' );
}

// Retrieve font file URL.
function generate_audiogram_block_load_scripts() {
	$js_data = array(
		'font_url' => plugins_url( '/assets/SourceSansPro-Bold.ttf', __FILE__ ),
	);

	wp_add_inline_script(
		'generate-audiogram-block-audiogram-editor-script',
		'var jsData = ' . wp_json_encode( $js_data ),
		'before'
	);
}
add_action( 'admin_enqueue_scripts', 'generate_audiogram_block_load_scripts' );

