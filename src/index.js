/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { ExternalLink } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';
import save from './save';
import { AudiogramIcon as icon } from './icon';

export const name = 'audiogram';
export const title = __( 'Audiogram', 'audiogram-generator' );
export const blockName = 'audiogram-generator/audiogram';
export const fontUrl = jsData.font_url;

registerBlockType( blockName, {
	title,
	description: (
		<Fragment>
			<p>{ __( 'Audiogram', 'audiogram-generator' ) }</p>
			<ExternalLink href="#">
				{ __( 'Learn more about Audiogram', 'audiogram-generator' ) }
			</ExternalLink>
		</Fragment>
	),
	icon,
	category: 'media',
	keywords: [],
	supports: {
		align: true,
	},
	edit,
	save,
	attributes: {
		src: {
			type: 'string',
		},
		id: {
			type: 'string',
		},
		imageID: {
			type: 'string',
		},
		imageSrc: {
			type: 'string',
		},
		imageHeight: {
			type: 'number',
		},
		imageWidth: {
			type: 'number',
		},
		captionsSrc: {
			type: 'string',
		},
		audiogramSrc: {
			type: 'string',
		},
		audiogramUrl: {
			type: 'string',
		},
		audiogramId: {
			type: 'string',
		},
		fontSrc: {
			type: 'string',
		},
	},
	example: {
		attributes: {
			// @TODO: Add default values for block attributes, for generating the block preview.
		},
	},
} );
