'use strict';

const Format = require( './format.js' );
const GerberHeaderReader = require( './gerber-header.js' );
const GerberOperationReader = require( './gerber-operation.js' );
const GerberModeReader = require( './gerber-mode.js' );
const GerberApertureReader = require( './gerber-aperture.js' );
const GerberApertureAddReader = require( './gerber-aperture-add.js' );

const CommentRE = /^G0*4/;
const SFRE = /^%SFA([0-9.]*)B([0-9.]*)\*%$/;
const IPRE = /^%IP(POS|NEG)\*%$/;
const EOFRE = /^M0*2\*$/;

class GerberReader {

	constructor( job, fileBuffer, apertureStore, dstFormat ) {

		this._job = job;
		this._apertureStore = apertureStore;
		this._dstFormat = dstFormat;

		this._readerHeader = new GerberHeaderReader();
		this._reader = {};

		this._eof = false;
		this._actions = [];

		// Parse over given buffer
		let c = 0;
		let len = fileBuffer.length;
		let start = null;
		let x = false;
		do {

			// Read current char
			let char = fileBuffer[c];

			// Skip \n and \r
			if( char == 10 || char == 13 ) {
				start = null;
				continue;
			}

			if( start === null ) {
				// Found start of line
				start = c;

				// RS-274X format?
				x = ( char == 37 );

				continue;
			}

			// Search end of line. Depending on Gerber version it is * (42) or % (37)
			if( x && char == 37 || !x && char == 42 ) {
				let line = fileBuffer.slice( start, c + 1 ).toString();
				this._interpreteLine( line );
				start = null;
			}

		} while( c++ < len );

	}

	_interpreteLine( line ) {

		// No format available -> try to read header
		if( ! this._srcFormat ) {

			// Try to interprete header lines
			let tmp = this._readerHeader.fromLine( line );
			if( tmp instanceof Format ) {

				// Generate instances of body reader
				this._reader.operation = new GerberOperationReader( tmp, this._dstFormat );
				this._reader.mode = new GerberModeReader();
				this._reader.aperture = new GerberApertureReader( this._apertureStore, this._job );
				this._reader.apertureAdd = new GerberApertureAddReader( this._apertureStore, this._job, tmp );

				this._srcFormat = tmp;

				return;

			} else if( tmp === true ) {

				return;

			}

		} else {

			let tmp;
			for( let r in this._reader ) {
				tmp = this._reader[r].fromLine( line );

				// The reader will return true if the line has been interpreted but does not generate any output
				if( tmp === true ) return;

				// If the reader hasn't returned null, there was a match!
				if( tmp !== null ) {

					// Add this action to stack
					this._actions.push( tmp );

					return;

				}

			}

		}

		// Ignore comments and deprecated scale factor and image polarity
		if( CommentRE.test( line ) || SFRE.test( line ) || IPRE.test( line ) ) return;

		// End of file
		if( EOFRE.test( line ) ) {
			this._eof = true;
			return;
		}

		// No match!
		throw new Error( "This line cannot be interpreted:\n " + line );

	}

	toString() {

		let ret = "";
		for( let a of this._actions ) {
			ret += `${a.toString()}\n`;
		}

		return ret;

	}

}

module.exports = GerberReader;
