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
} from '@wordpress/block-editor';
import { withNotices } from '@wordpress/components';
import { createBlobURL, getBlobByURL, isBlobURL } from '@wordpress/blob';
import { useSelect } from '@wordpress/data';
import { fontUrl } from './index';

/**
 * Internal dependencies
 */
import { AudiogramIcon as icon } from './icon';
import AudiogramPreview from './AudiogramPreview';

/**
 * Edit function for Generate Audiogram Block.
 *
 * @return {WPElement} Element to render.
 */
function Edit( { noticeOperations, noticeUI, attributes, setAttributes } ) {
	// State
	const [ message, setMessage ] = useState(
		__( 'Add an image and captions, then click Create Audiogram.' )
	);
	const [ processing, setProcessing ] = useState( false );
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
	const ALLOWED_IMAGE_SIZES = [
		{ width: 1080, height: 1080 },
		{ width: 720, height: 720 },
		{ width: 1920, height: 1080 },
		{ width: 1280, height: 720 },
		{ width: 1080, height: 1920 },
		{ width: 720, height: 1280 },
	];
	const imageSizeMessage = __(
		'Image size must be: 1080x1080, 720x720, 1920x1080, 1280x720, 1080x1920, or 720x1280.'
	);

	const mediaUpload = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return getSettings().mediaUpload;
	}, [] );

	// Check for SharedArrayBuffer support.
	useEffect( () => {
		const isFeatureSupported = Boolean( window?.crossOriginIsolated );
		if ( ! isFeatureSupported ) {
			noticeOperations.createErrorNotice(
				__(
					"Sorry, your browser doesn't support generating an audiogram. Please try using a different one."
				)
			);
		}
	}, [] );

	// Upload the audio.
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

	// Upload the audiogram.
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

	// Load ffmpeg.
	const ffmpeg = createFFmpeg();

	// Create the audiogram
	const doTranscode = async () => {
		setMessage( __( 'Loading generator...' ) );
		setProcessing( true );
		await ffmpeg.load();
		setMessage( __( 'Creating audiogram. This may take a few minutes.' ) );
		ffmpeg.FS( 'writeFile', 'audio.mp3', await fetchFile( src ) );
		ffmpeg.FS(
			'writeFile',
			'captions.vtt',
			await fetchFile( captionsSrc )
		);
		ffmpeg.FS(
			'writeFile',
			'tmp/SourceSansPro-Bold',
			await fetchFile( fontSrc )
		);
		ffmpeg.FS( 'writeFile', 'bg.png', await fetchFile( imageSrc ) );
		await ffmpeg.run(
			'-i',
			'audio.mp3',
			'-loop',
			'1',
			'-i',
			'bg.png',
			'-filter_complex',
			`[0:a]showwaves=mode=line:colors=White:s=${ imageWidth }x200[sw];[1:v][sw]overlay=shortest=1:format=auto:y=H-h,format=yuv420p,subtitles=captions.vtt:fontsdir=/tmp:force_style='Fontname=Source Sans Pro,Fontsize=25,Alignment=8,Outline=0,Shadow=0'[out]`,
			'-map',
			'[out]',
			'-map',
			'0:a',
			'-c:v',
			'libx264',
			'-c:a',
			'aac',
			'audiogram.mp4'
		);
		setMessage( '' );
		setProcessing( false );
		const audiogram = ffmpeg.FS( 'readFile', 'audiogram.mp4' );
		setAttributes( {
			audiogramSrc: new Blob( [ audiogram.buffer ], {
				type: 'video/mp4',
			} ),
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
		noticeOperations.removeAllNotices();

		// If the image isn't one of the allowed sizes, throw an error.
		const imageSizeAllowed = ALLOWED_IMAGE_SIZES.some( ( size ) => {
			return size.width === image.width && size.height === image.height;
		} );
		if ( imageSizeAllowed ) {
			setAttributes( {
				imageID: image.id,
				imageSrc: image.url,
				imageHeight: image.height,
				imageWidth: image.width,
			} );
		} else {
			noticeOperations.createErrorNotice( imageSizeMessage );
		}
	}

	const onSelectFile = ( event ) => {
		setAttributes( {
			captionsSrc: event.target.files?.[ 0 ],
			fontSrc: fontUrl,
		} );
	};

	const childProps = {
		doTranscode,
		onUpdateImage,
		onSelectFile,
		onSelectAudio,
		onSelectURL,
		onUploadError,
		message,
		processing,
		ALLOWED_MEDIA_TYPES,
		imageSizeMessage,
		...attributes,
	};

	return (
		<div { ...useBlockProps() }>
			{ noticeUI }
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
						labels={ { title: 'Audiogram' } }
					/>
				</>
			) : (
				<AudiogramPreview { ...childProps } />
			) }
		</div>
	);
}

export default withNotices( Edit );
