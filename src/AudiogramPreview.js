/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InspectorControls,
	MediaReplaceFlow,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody, Button, FormFileUpload } from '@wordpress/components';

const AudiogramPreview = ( props ) => {
	const {
		doTranscode,
		onUpdateImage,
		onSelectFile,
		onSelectAudio,
		onSelectURL,
		onUploadError,
		id,
		src,
		imageSrc,
		imageWidth,
		imageHeight,
		imageID,
		audiogramUrl,
		captionsSrc,
		message,
		processing,
		ALLOWED_MEDIA_TYPES,
	} = props;

	return (
		<>
			{ audiogramUrl ? (
				<video controls src={ audiogramUrl } />
			) : (
				<>
					<p>{ message }</p>
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
							<MediaUploadCheck>
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
							</MediaUploadCheck>
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
						className={ 'audiogram-preview' }
						style={ {
							backgroundImage: `url(${ imageSrc })`,
							width: `${ imageWidth }px`,
							height: `${ imageHeight }px`,
						} }
					>
						<p className="captions">
							{ captionsSrc ? 'Captions go here...' : '' }
						</p>
						<audio controls="controls" src={ src } />
					</div>
					<Button
						isPrimary
						onClick={ doTranscode }
						disabled={ ! imageSrc || processing }
					>
						Create Audiogram
					</Button>
				</>
			) }
		</>
	);
};

export default AudiogramPreview;
