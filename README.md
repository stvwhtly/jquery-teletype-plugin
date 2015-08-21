jQuery Teletype Plugin
======================

Teletype is a jQuery plugin that types out text, and then optionally deletes it, replicating human interaction.

Additional options provide the ability to preserve the typed text, in a console / terminal format, pause during typing and delete characters.

An online demo can be found at <http://teletype.rocks>.

Installation
---

    <script src="jquery.js"></script>
	<script src="jquery.teletype.js"></script>
	<script>
		$( function() {
			$( '.type-text' ).teletype( {
				text: [ 'one', 'two', 'three' ],
				typeDelay: 0,
				backDelay: 20
			} );
		} );
	</script>
	...
	<div class="type-text"></div>

Options
-------

 Option       | Default                             | Description
--------------|-------------------------------------|------------
 text         | `['one','two','three']` (array)     | List of strings to output.     
 typeDelay    | `100` (integer)                     | Minimum delay, in ms, between typing characters.    
 backDelay    | `50` (integer)                      | Minimum delay, in ms, between deleting characters.
 blinkSpeed   | `1000` (integer)                    | Interval, in ms, that the cursor will flash.
 cursor       | <code>"&#124;"</code> (string)      | Character used to represent the cursor.
 delay        | `2000` (int)                        | Time in ms to pause before deleting the current text.
 preserve     | `false` (boolean)                   | Prevent auto delete of the current string and begin outputting the next string.
 prefix       | `""` (string)                       | Begin each string with this prefix value.
 loop         | `0` (int)                           | Number of times to loop through the output strings, for unlimited use `0`.
 humanise     | `true` (boolean)                    | Add a random delay before each character to represent human interaction.
 callbackNext | `null` (function)                   | Callback function called every text item. See `Callback functions` below.
 callbackType | `null` (function)                   | Callback function called every 'letter'. See `Callback functions` below.

Methods
-------

**teletype.setCursor(string cursor)**

Change the cursor value. Can be used at any time although particularly useful
when combined with callback functions.


Deleting characters `~`
---

It is possible to delete a defined number of characters then proceed with the rest of the text output. 

Use `~x` within the text string, where x is an integer value defining the characters to backspace.

Example, type "auti", delete 1 character and continue to type "o", resulting in the word "auto":

```
auti~1o^`
```

Pause / Delay `^`
---

Delay typing the next character using `^x` where x in an integer value of milliseconds to pause.

To pause for 2 seconds after typing the word "pause" before continuing to type: 

```
pause^2000 more
```

Line Breaks `\n`
---

Line breaks can be added using `\n`, which are converted to `<br />` during output.

Generated Markup
---

The following markup is used to output the teletype text.

```
<span class="teletype-prefix">[prefix]</span>
<span class="teletype-text">[string]</span>
<span class="teletype-cursor">[cursor]</span>
```
    
This provides the ability to customise the style of the output text in your CSS.

Callback functions
---

There are two callback functions available, `callbackNext` and `callbackType`.

**Using the `callbackNext` callback**

Called every time a new text item begins. Two parameters are passed back here,
`current` and `teletype`.

The `current` object holds details of the current text and position pointers.

```
current = { 
	string: '', 	// The full text line being written.
	index: 0, 		// Array index of the text array.
	position: 0, 	// Character index position within the current text string.
	loop: 0 		// Current loop number, increments if settings.loop is enabled.
};
```

The second parameter `teletype` returns the teletype object itself, allowing
you to easily interact with the teletyper.

Example, change the cursor when moving to the 3rd text item (index 2).

```
callbackNext: function( current, teletype ) {
	if ( current.index == 2 ) {
		teletype.setCursor( '▋' );
	}
}
```

**Using the `callbackType` callback**

Callback function called every 'letter', when either typing or deleting output.

There are three parameters used here, `letter`, `current` and `teletype`.

The value of `letter` is the text that will be written, usually a single
character but can be HTML markup for special characters.

The other two parameters are the same as those used by `callbackNext` (see above).

```
callbackType: function( letter, current, teletype ) {
	if ( current.index == 2 && current.position == 13 ) {
		teletype.setCursor( '_' );
	}
}
```

**Using the `callbackFinished` callback**

Callback function called immediately once the teletype process is entirely finished.

There are no parameters.

```
callbackFinished: function() {
	alert('Nothing left to type!');
}
```

Minification
---

The Minified version of this script was provided by UglifyJS 2 - an online version can be found at <http://gpbmike.github.io/refresh-sf/>.

