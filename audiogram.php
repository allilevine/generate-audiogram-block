<?php
/**
 * Plugin Name:       Audiogram Generator Block
 * Description:       Upload audio, a background image, and subtitles to generate an audiogram.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Allison Levine
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       audiogram-generator
 *
 * @package           audiogram-generator
 */

// Required to allow SharedArrayBuffer in supported browsers.
function audiogram_generator_add_cors_http_header(){
    header( "Cross-Origin-Opener-Policy: same-origin" );
	header( "Cross-Origin-Embedder-Policy: require-corp" );
}
add_action('load-post.php','audiogram_generator_add_cors_http_header');
add_action('load-post-new.php','audiogram_generator_add_cors_http_header');

// Initialize the block.
function audiogram_generator_block_init() {
	register_block_type( __DIR__ );
}
add_action( 'init', 'audiogram_generator_block_init' );

