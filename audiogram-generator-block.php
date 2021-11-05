<?php
/**
 * Plugin Name:       Audiogram Generator Block
 * Description:       Generate and customize audiograms in the block editor.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            firewatch
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       audiogram-generator
 *
 * @package           audiogram-generator
 */

// Required to allow SharedArrayBuffer in supported browsers.
function audiogram_generator_add_cors_http_header(){
	if ( get_current_screen()->is_block_editor()) {
		header( "Cross-Origin-Opener-Policy: same-origin" );
		header( "Cross-Origin-Embedder-Policy: require-corp" );
	}
}
add_action('load-post.php','audiogram_generator_add_cors_http_header');
add_action('load-post-new.php','audiogram_generator_add_cors_http_header');

// Initialize the block.
function audiogram_generator_block_init() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'audiogram_generator_block_init' );

// Ensure font file gets loaded.
if ( ! function_exists( 'wp_handle_upload' ) ) {
    require_once( ABSPATH . 'wp-admin/includes/file.php' );
}

// Retrieve font file URL.
function audiogram_generator_load_scripts() {
	$js_data = array(
		'font_url' => plugins_url( '/assets/SourceSansPro-Bold.ttf', __FILE__ ),
	);

	wp_add_inline_script(
		'audiogram-generator-audiogram-editor-script',
		'var jsData = ' . wp_json_encode( $js_data ),
		'before'
	);
}
add_action( 'admin_enqueue_scripts', 'audiogram_generator_load_scripts' );

