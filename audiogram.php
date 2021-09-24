<?php
/**
 * Plugin Name:       Audiogram Generator Block
 * Description:       Upload audio, a background image, and subtitles to generate an audiogram.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       audiogram-generator
 *
 * @package           audiogram-generator
 */

function audiogram_generator_add_cors_http_header(){
    header( "Cross-Origin-Opener-Policy: same-origin" );
	header( "Cross-Origin-Embedder-Policy: require-corp" );
}
add_action('init','audiogram_generator_add_cors_http_header');

function audiogram_generator_block_init() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'audiogram_generator_block_init' );

if ( ! function_exists( 'wp_handle_upload' ) ) {
    require_once( ABSPATH . 'wp-admin/includes/file.php' );
}

