=== Generate Audiogram Block ===
Contributors: firewatch
Tags: audiogram, media, captions, podcast, block
Requires at least: 5.8
Tested up to: 5.8
Stable tag: 0.1.0
Requires PHP: 7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generate and customize audiograms in the editor.

== Description ==

Add the audiogram block and customize the audio, background image, and captions.

To get started:
1. Install this plugin.
2. Create a new post or edit a post, and add the Audiogram block (found in the "Media" category).
3. Upload or select an audio file.
4. Upload or select a background image.
5. Upload a captions file.
6. Click "Create Audiogram."

The process may take a few minutes or longer depending on the length of your audiogram. Once it completes, you should see the generated video. It will also be uploaded to your Media Library.

You can contribute to the plugin's development here: https://github.com/allilevine/generate-audiogram-block

== Frequently Asked Questions ==

= Why am I getting a browser support error? =

The generator depends on `SharedArrayBuffer`, which is only supported in certain browsers, like the latest versions of Firefox and Chrome.

= Why am I getting an error that the file exceeds the maximum upload size for this site? =

This happens when the maximum upload size set by your web hosting provider isn't large enough for the audiogram you're trying to generate. Try contacting your web host or using a smaller audio file.

= Why aren't my captions in the generated audiogram? =

Try creating your audiogram again, making sure to re-upload the captions file.

= Why is the audiogram taking so long to generate in Firefox? =

This can happen when you have Firefox DevTools open. Close them and refresh to try again.

= How do I get a captions file? =

You can either manually transcribe the audio as a .vtt text file, or use a service such as YouTube or a podcast transcription service to auto-transcribe it.

= Why are some images and scripts not loading in the editor with this plugin activated? =

The generator depends on `SharedArrayBuffer`, which is only supported in an environment that is cross-origin isolated. That restriction can prevent other resources from loading. You can use the plugin to generate the audiogram and add it to your Media Library, then deactivate it.
