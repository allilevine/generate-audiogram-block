<?php
/**
 * Plugin Name:       Audiogram
 * Description:       Example block written with ESNext standard and JSX support – build step required.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       audiogram
 *
 * @package           audiogram-generator
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/writing-your-first-block-type/
 */
function audiogram_generator_add_cors_http_header(){
    header( "Cross-Origin-Opener-Policy: same-origin" );
	header( "Cross-Origin-Embedder-Policy: require-corp" );
}
add_action('init','audiogram_generator_add_cors_http_header');

function audiogram_generator_audiogram_block_init() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'audiogram_generator_audiogram_block_init' );

if ( ! function_exists( 'wp_handle_upload' ) ) {
    require_once( ABSPATH . 'wp-admin/includes/file.php' );
}

