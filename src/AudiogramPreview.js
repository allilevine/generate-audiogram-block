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
import {
	PanelBody,
	Button,
	FormFileUpload,
	Spinner,
} from '@wordpress/components';

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
		audiogramId,
		captionsSrc,
		message,
		processing,
		ALLOWED_MEDIA_TYPES,
		imageSizeMessage,
	} = props;

	return (
		<>
			{ audiogramUrl && audiogramId ? (
				<video controls src={ audiogramUrl } />
			) : (
				<>
					<p>
						{ processing && <Spinner /> } { message }
					</p>
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
							<p>{ imageSizeMessage }</p>
							<MediaUploadCheck>
								<MediaUpload
									title={ 'audiogram-bg' }
									onSelect={ onUpdateImage }
									allowedTypes={ [ 'image' ] }
									render={ ( { open } ) => (
										<div>
											<Button isPrimary onClick={ open }>
												{ __( 'Select image' ) }
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
						className={ `audiogram-preview ${
							processing ? 'processing' : ''
						}` }
						style={ {
							backgroundImage: `url(${ imageSrc })`,
							width: `${ imageWidth }px`,
							height: `${ imageHeight }px`,
						} }
					>
						<p className="captions">
							{ captionsSrc ? __( 'Captions go here...' ) : '' }
						</p>
						<audio controls="controls" src={ src } />
					</div>
					{ ! processing && (
						<Button
							isPrimary
							onClick={ doTranscode }
							disabled={ ! imageSrc }
						>
							{ __( 'Create Audiogram' ) }
						</Button>
					) }
				</>
			) }
		</>
	);
};

export default AudiogramPreview;
