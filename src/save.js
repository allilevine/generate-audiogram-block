/**
 * External dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Audiogram Generator Block save function.
 *
 * @return {WPElement} Element to render.
 */
export default function save( { attributes } ) {
	const { audiogramUrl } = attributes;
	return (
		<p { ...useBlockProps.save() }>
			{ audiogramUrl && <video src={ audiogramUrl } controls></video> }
		</p>
	);
}
