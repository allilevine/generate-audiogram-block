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
import { store as coreStore } from '@wordpress/core-data';
import { withNotices } from '@wordpress/components';
import { createBlobURL, getBlobByURL, isBlobURL } from '@wordpress/blob';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './editor.scss';
import { AudiogramIcon as icon } from './icon';
import AudiogramPreview from './AudiogramPreview';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
function Edit( { noticeOperations, noticeUI, attributes, setAttributes } ) {
	// State
	const [ message, setMessage ] = useState(
		'Add an image and captions, then click Create Audiogram.'
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
						console.log( url );
						setAttributes( { audiogramId: id, audiogramUrl: url } );
					},
					onError: ( e ) => {
						console.log( e );
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
		setMessage( 'Loading generator...' );
		setProcessing( true );
		await ffmpeg.load();
		setMessage( 'Creating audiogram. This may take a few minutes.' );
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
			"[0:a]showwaves=mode=line:colors=White[sw];[1:v][sw]overlay=shortest=1:format=auto,format=yuv420p,subtitles=captions.vtt:fontsdir=/tmp:force_style='Fontname=Source Sans Pro,Fontsize=30,Alignment=1,Outline=0,Shadow=0'[out]",
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
		setAttributes( {
			imageID: image.id,
			imageSrc: image.url,
			imageHeight: image.height,
			imageWidth: image.width,
		} );
	}

	const onSelectFile = ( event ) => {
		setAttributes( {
			captionsSrc: event.target.files?.[ 0 ],
			fontSrc: `${ siteUrl }/wp-content/plugins/audiogram/SourceSansPro-Bold.ttf`,
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
