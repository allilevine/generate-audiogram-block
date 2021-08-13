/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
const { createFFmpeg, fetchFile } = require( '@ffmpeg/ffmpeg' );
import { useState, useEffect } from '@wordpress/element';
import {
	useBlockProps,
	MediaPlaceholder,
	BlockIcon,
	store as blockEditorStore,
	BlockControls,
	InspectorControls,
	MediaReplaceFlow,
	MediaUpload,
} from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { FormFileUpload } from '@wordpress/components';
import {
	PanelBody,
	Button,
} from '@wordpress/components';
import { createBlobURL, getBlobByURL, isBlobURL } from '@wordpress/blob';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './editor.scss';
import { AudiogramIcon as icon } from './icon';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit( { noticeOperations, noticeUI, attributes, setAttributes }) {
	// State
	const [ message, setMessage ] = useState( 'Click Start to transcode' );
	const {
		id,
		src,
		imageID,
		imageSrc,
		imageHeight,
		imageWidth,
		captionsSrc,
		audiogramSrc,
		audiogramId,
		audiogramUrl,
		fontSrc,
	} = attributes;

	const ALLOWED_MEDIA_TYPES = [ 'audio' ];

	const siteUrl = useSelect( ( select ) => {
		const { getEntityRecord } = select( coreStore );
		const siteData = getEntityRecord( 'root', '__unstableBase' );
		return siteData?.url;
	}, [] );

	const mediaUpload = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return getSettings().mediaUpload;
	}, [] );

	useEffect( () => {
		if ( ! id && isBlobURL( src ) ) {
			const file = getBlobByURL( src );

			if ( file ) {
				mediaUpload( {
					filesList: [ file ],
					onFileChange: ( [ { id: mediaId, url } ] ) => {
						setAttributes( { id: mediaId, src: url } );
					},
					onError: ( e ) => {
						setAttributes( { src: undefined, id: undefined } );
						noticeOperations.createErrorNotice( e );
					},
					allowedTypes: ALLOWED_MEDIA_TYPES,
				} );
			}
		}
	}, [] );

	useEffect( () => {
		if ( audiogramSrc ) {
			const blobURL = createBlobURL( audiogramSrc );
			const file = getBlobByURL( blobURL );

			if ( file ) {
				mediaUpload( {
					filesList: [ file ],
					onFileChange: ( [ { id, url } ] ) => {
						setAttributes( { audiogramId: id, audiogramUrl: url } );
					},
					onError: ( e ) => {
						setAttributes( { audiogramUrl: undefined } );
						noticeOperations.createErrorNotice( e );
					},
					allowedTypes: [ 'video' ],
				} );
			}
		}
	}, [ audiogramSrc ] );

	// ffmpeg;
	const ffmpeg = createFFmpeg( {
		corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
		log: true,
	} );

	// Create the audiogram
	const doTranscode = async () => {
		setMessage( 'Loading ffmpeg-core.js' );
		await ffmpeg.load();
		setMessage( 'Start transcoding' );
		ffmpeg.FS( 'writeFile', 'audio.mp3', await fetchFile( src ) );
		ffmpeg.FS( 'writeFile', 'captions.vtt', await fetchFile( captionsSrc ) );
		ffmpeg.FS( 'writeFile', 'tmp/arial', await fetchFile( fontSrc ) );
		ffmpeg.FS( 'writeFile', 'bg.png', await fetchFile( imageSrc ) );
		await ffmpeg.run(
			'-loop',
			'1',
			'-i',
			'bg.png',
			'-i',
			'audio.mp3',
			'-filter_complex',
			'subtitles=captions.vtt:fontsdir=/tmp:force_style="Fontname=Arial"',
			'-shortest',
			'audiogram.mp4'
		);
		setMessage( 'Complete transcoding' );
		const audiogram = ffmpeg.FS( 'readFile', 'audiogram.mp4' );
		setAttributes( {
			audiogramSrc:
				new Blob( [ audiogram.buffer ], { type: 'video/mp4' } )
		} );
	};

	function onUploadError( message ) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	function onSelectURL( newSrc ) {
		if ( newSrc !== src ) {
			setAttributes( { src: newSrc, id: undefined } );
		}
	}

	function onSelectAudio( media ) {
		if ( ! media || ! media.url ) {
			// in this case there was an error and we should continue in the editing state
			// previous attributes should be removed because they may be temporary blob urls
			setAttributes( { src: undefined, id: undefined } );
			return;
		}
		// sets the block's attribute and updates the edit component from the
		// selected media, then switches off the editing UI
		setAttributes( { src: media.url, id: media.id } );
	}

	function onUpdateImage( image ) {
		setAttributes( {
			imageID: image.id,
			imageSrc: image.url,
			imageHeight: image.height,
			imageWidth: image.width,
		} );
	}

	const onSelectFile = ( event ) =>
		setAttributes( {
			captionsSrc: event.target.files?.[ 0 ],
			fontSrc:
			`${ siteUrl }/wp-content/plugins/audiogram/Arial.ttf`,
		} );

	return (
		<div { ...useBlockProps() }>
			{ ! src ? (
				<>
					<MediaPlaceholder
						icon={ <BlockIcon icon={ icon } /> }
						onSelect={ onSelectAudio }
						onSelectURL={ onSelectURL }
						accept="audio/*"
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						value={ attributes }
						notices={ noticeUI }
						onError={ onUploadError }
					/>
				</>
			) : (
				<>
					<BlockControls group="other">
						<MediaReplaceFlow
							mediaId={ id }
							mediaURL={ src }
							allowedTypes={ ALLOWED_MEDIA_TYPES }
							accept="audio/*"
							onSelect={ onSelectAudio }
							onSelectURL={ onSelectURL }
							onError={ onUploadError }
							name={ __( 'Replace Audio' ) }
						/>
					</BlockControls>
					<InspectorControls>
						<PanelBody title={ __( 'Audiogram Background Image' ) }>
							<MediaUpload
								title={ 'audiogram-bg' }
								onSelect={ onUpdateImage }
								allowedTypes={ [ 'image' ] }
								render={ ( { open } ) => (
									<div>
										<Button isPrimary onClick={ open }>
											Select image
										</Button>
									</div>
								) }
								value={ imageID }
							/>
						</PanelBody>
						<PanelBody title={ __( 'Audiogram Captions' ) }>
							<FormFileUpload
								multiple={ false }
								onChange={ onSelectFile }
								accept={ '.vtt' }
								isPrimary
								title={ `${ __(
									'Accepted file formats: vtt',
									'media-manager'
								) }` }
							>
								{ __( 'Upload subtitles', 'media-manager' ) }
							</FormFileUpload>
						</PanelBody>
					</InspectorControls>
					<div
						style={ {
							backgroundImage: `url(${ imageSrc })`,
							width: `${ imageWidth }px`,
							height: `${ imageHeight }px`,
						} }
					>
						<audio controls="controls" src={ src } />
						<p className="captions">
							{ captionsSrc ? 'Captions go here...' : '' }
						</p>
					</div>
					<Button isPrimary onClick={ doTranscode }>
						Start
					</Button>
					<p>{ message }</p>
					{ audiogramUrl && <video controls src={ audiogramUrl } /> }
				</>
			) }
		</div>
	);
}
