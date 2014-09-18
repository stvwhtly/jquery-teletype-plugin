/*
* Teletype jQuery Plugin
* @version 0.2-alpha
*
* @author Steve Whiteley
* @see http://teletype.rocks
* @see https://github.com/stvwhtly/jquery-teletype-plugin
*
* Copyright (c) 2014 Steve Whiteley
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/
( function ( $ ) {
	$.fn.teletype = function( options ) {
		var settings = $.extend( {}, $.fn.teletype.defaults, options );
		var self = $( this ),
			output = null,
			current = { 
				string: '',
				index: 0,
				position: 0,
				loop: 0,
				tag: []
			};
		var next = function() {
			current.tag = [];
			current.index++;
			if ( current.index >= settings.text.length ) {
				current.index = 0;
				current.loop++;
				if ( settings.loop !== false && ( settings.loop == current.loop ) ) {
					return false;
				}
			}
			current.position = 0;
			current.string = settings.text[current.index];
			return true;
		};
		var type = function() {
			if ( settings.prefix && current.position == 0 ) {
				if ( current.loop == 0 && current.index == 0 ) {
					$( '<span />' ).addClass( 'teletype-prefix' ).html( settings.prefix ).prependTo( self );
				}
			}
			var letters = current.string.split( '' ),
				letter = letters[current.position];
			if ( letter == '^' || letter == '~' ) {
				var end = current.string.substr( current.position + 1 ).indexOf( ' ' );
				var value = current.string.substr( current.position + 1, end );
				if ( $.isNumeric( value ) ) {
					current.string = current.string.replace( letter + value + ' ', '' );
					if ( letter == '^' ) {
						window.setTimeout( function() {
							window.setTimeout( type, delay( settings.typeDelay ) );
						}, value );
					} else {
						var index = current.position - value;
						current.string = current.string.substr( 0, index - 1 ) + current.string.substr( current.position - 1 );
						window.setTimeout( function() {
							backspace( Math.max( index, 0 ) );
						}, delay( settings.backDelay ) );
					}
					return;
				}
			} else if ( letter == '\\' ) {
				var nextChar = current.string.substr( current.position + 1, 1 );
				if ( nextChar  == 'n' ) {
					current.position++;
					letter = '<br />';
				}
			} else if ( settings.html === true ) {
				if ( letter == '<' ) {
					var matches = current.string
						.substr( current.position )
						.match( /^(<(?:\/)?(\w+)\s?(.*?)(\/)?>).*(?=<\/\2>)?/i );
					if ( matches && matches[2] ) {
						current.string = current.string.replace( matches[1], '' );
						if ( current.tag.length > 0 ) {
							$( matches[1] ).appendTo( $( current.tag[current.tag.length - 1], output ).not( '.teletype-cursor' ).last() );
						} else {
							$( matches[1] ).appendTo( output );
						}
						if ( !matches[2].match( /^(area|br|col|embed|hr|img|input|link|meta|param)$/ ) ) {
							if ( matches[1].substr( 1, 1 ) == '/' && current.tag[current.tag.length-1] == matches[2] ) {
								current.tag.pop();
							} else if ( !matches[4] ) {
								current.tag[current.tag.length] = matches[2];
							}
						}
						return type();
					}
				} else if ( letter == '&' ) {
					var matches = current.string
						.substr( current.position )
						.match( /^(&\w+;)/i );
					if ( matches ) {
						letter = matches[1];
						current.string = current.string.replace( matches[1], '' );
						current.position = current.position - 2;
					}
				}
			}
			if ( letter != undefined ) {
				if ( current.tag.length > 0 ) {
					cursor( $( current.tag[current.tag.length - 1], output ) );
					$( current.tag[current.tag.length - 1], output ).not( '.teletype-cursor' ).last().append( letter );
				} else if ( settings.html === true ) {
					output.append( letter );
					cursor( self );
				} else {
					output.text( output.text() + letter );
				}
				current.position++;
			}
			if ( current.position < current.string.length ) {
				window.setTimeout( type, delay( settings.typeDelay ) );
			} else if ( settings.preserve === false ) {
				window.setTimeout( function() {
					window.setTimeout( backspace, delay( settings.backDelay ) );
				}, settings.delay );
			} else {
				output.html( output.html() + '<br />' + '<span class="teletype-prefix">' + settings.prefix + '</span>' );
				if ( next() ) {
					window.setTimeout( function() {
						window.setTimeout( type, delay( settings.typeDelay ) );
					}, settings.delay );
				}
			}
		};
		var backspace = function( stop ) {
			if ( !stop ) {
				stop = 0;
			}
			if ( current.position > stop ) {
				var chars = -1;
				if ( settings.html === true ) {
					var content = $( '<div />' ).html( output.html() ).html();
					if ( current.tag.length > 0 ) {
						cursor( self );
						var tag = $( current.tag[current.tag.length-1], output ).last();
						content = tag.html();
						if ( content == '' ) {
							tag.remove();
							current.tag.pop();
							current.position++;
							return backspace( stop );
						}
					}
					if ( content.substr( content.length - 1 ) == '>' ) {
						var matches = content.match( /([\/])?(\w+)>$/i );
						if ( matches && matches[1] ) {
							current.tag[current.tag.length] = matches[2];
						}
					} else if ( content.substr( content.length - 1 ) == ';' ) {
						var matches = content.match( /(&\w+;)$/i );
						console.log( matches );
						if ( matches && matches[1] ) {
							chars = matches[1].length * -1;
						}
					}
				}
				if ( current.tag.length > 0 ) {
					$( current.tag[current.tag.length - 1], output )
						.not( '.teletype-cursor' )
						.last()
						.html( function( index, content ) {
							return content.slice( 0, chars );
						} );
					cursor( $( current.tag[current.tag.length - 1], output ) );
				} else {
					if ( settings.html === true ) {
						cursor( self );
					}
					output.html( output.html().slice( 0, chars ) );
				}
				current.position--;
				window.setTimeout( function() {
					backspace( stop );
				}, delay( settings.backDelay ) );
			} else {
				if ( stop == 0 ) {
					if ( next() === false ) {
						return;
					}
				}
				window.setTimeout( type, delay( settings.typeDelay ) );
			}
		};
		var cursor = function( parent ) {
			$( '.teletype-cursor', self ).detach().appendTo(
				parent.not( '.teletype-cursor' ).last()
			);
		}
		var delay = function( speed ) {
			var time = parseInt( speed );
			if ( settings.humanise ) {
				time += Math.floor( Math.random() * 200 );
			}
			return time;
		};
		return this.each( function() {
			// current.string = $.parseHTML( settings.text[current.index] );
			current.string = settings.text[current.index];
			self.addClass( 'teletype' ).empty();
			output = $( '<span />' ).addClass( 'teletype-text' ).appendTo( self );
			if ( settings.cursor ) {
				var cursor = $( '<span />' )
					.text( settings.cursor )
					.addClass( 'teletype-cursor' )
					.appendTo( self );
				setInterval ( function() {
					cursor.animate( { opacity: 0 } ).animate( { opacity: 1 } );
				}, settings.blinkSpeed );
			}
			type();
		} );
	};
	$.fn.teletype.defaults = {
		text: [ 'one', 'two', 'three' ],
		typeDelay: 100,
		backDelay: 50,
		blinkSpeed: 1000,
		delay: 2000,
		cursor: '|',
		preserve: false,
		prefix: '',
		loop: 0,
		humanise: true,
		html: false
	};
}( jQuery ) );