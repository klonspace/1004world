/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */



CKEDITOR.editorConfig = function( config ) {
	config.toolbarGroups = [
		{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
		{ name: 'forms', groups: [ 'forms' ] },
		'/',
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
		{ name: 'links', groups: [ 'links' ] },
		{ name: 'insert', groups: [ 'insert' ] },
		'/',
		{ name: 'styles', groups: [ 'styles' ] },
		{ name: 'colors', groups: [ 'colors' ] },
		{ name: 'tools', groups: [ 'tools' ] },
		{ name: 'others', groups: [ 'others' ] },
		{ name: 'about', groups: [ 'about' ] }
	];

	config.removeButtons = 'HiddenField,Form,Source,Save,Undo,Cut,Templates,Preview,NewPage,PasteText,Print,PasteFromWord,Paste,Copy,Redo,Replace,Find,SelectAll,Scayt,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,TextColor,Maximize,About,ShowBlocks,BGColor,Format,Font,FontSize,Italic,Bold,Underline,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,NumberedList,BulletedList,Outdent,Indent,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,Iframe,PageBreak';
};

CKEDITOR.stylesSet.add('my_styles', [
	// Block-level styles.
	{ name: 'Blue Title', element: 'h2', styles: { color: 'Blue' } },
	{ name: 'Red Title', element: 'h3', styles: { color: 'Red' } },

	// Inline styles.
	{ name: 'CSS Style', element: 'span', attributes: { 'class': 'my_style' } },
	{ name: 'Marker: Yellow', element: 'span', styles: { 'background-color': 'Yellow' } }
]);
