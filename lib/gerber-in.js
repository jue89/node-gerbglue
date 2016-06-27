'use strict';

const Format = require( './format.js' );
const GerberHeaderReader = require( './gerber-header.js' );
const GerberOperationReader = require( './gerber-operation.js' );
const GerberModeReader = require( './gerber-mode.js' );
const GerberPolarityReader = require( './gerber-polarity.js' );
const GerberApertureReader = require( './gerber-aperture.js' );
const GerberApertureAddReader = require( './gerber-aperture-add.js' );

const IgnoreRE = [
	/^G0*4/,             // Comments
	/^%SFA1B1\*%$/,      // Scale Factor (deprecated) -> Must be 1 and 1!
	/^%IPPOS\*%$/,       // Image Polarity (deprecated) -> Must be positive!
	/^G0*(70|71)\*$/     // Unit selection (deprecated)
];
const EOFRE = /^M0*2\*$/;

class GerberReader {

	constructor( job, fileBuffer, apertureStore, dstFormat, boundaries ) {

		this._job = job;
		this._apertureStore = apertureStore;
		this._dstFormat = dstFormat;
		this._boundaries = boundaries;

		this._readerHeader = new GerberHeaderReader();
		this._reader = {};

		this._eof = false;
		this._actions = [];

		// Parse over given buffer
		let c = 0;
		let len = fileBuffer.length;
		let start = null;
		let x = false;
		let deprecatedModeBlock = false;
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

				// Depercated Mode change?
				deprecatedModeBlock = ( char == 71 );

				continue;
			}

			// Gerber mode change and operation can be found in one line. This is deprecated
			// but some CAM processors still use this format. So we habe to take this one into
			// account. If first character is 'G' and 'X' or 'Y' occures, we split them apart.
			if( deprecatedModeBlock && char == 32 ) {

				// If we found a space character, its a comment which may contains 'X' or 'Y's
				deprecatedModeBlock = false;

			} else if( deprecatedModeBlock && ( char == 88 || char == 89 ) ) {

				// If we haven't detected a comment yet and found a 'X' or 'Y', it's a depercated
				// mode change
				let line = fileBuffer.slice( start, c ).toString() + '*';
				this._interpreteLine( line );
				deprecatedModeBlock = false;
				start = c;
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

		// Skip if end of file has been reached
		if( this._eof ) return;

		// No format available -> try to read header
		if( ! this._srcFormat ) {

			// Try to interprete header lines
			let tmp = this._readerHeader.fromLine( line );
			if( tmp instanceof Format ) {

				// Generate instances of body reader
				this._reader.operation = new GerberOperationReader( tmp, this._dstFormat, this._boundaries );
				this._reader.mode = new GerberModeReader();
				this._reader.aperture = new GerberApertureReader( this._apertureStore, this._job );
				this._reader.polarity = new GerberPolarityReader();
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

		// Ignore comments and deprecated commands
		for( let re of IgnoreRE ) {
			if( re.test( line ) ) return;
		}

		// End of file
		if( EOFRE.test( line ) ) {
			this._eof = true;
			return;
		}

		// No match!
		throw new Error( "This line cannot be interpreted:\n " + line );

	}

	_checkEOF() {
		if( ! this._eof ) {
			throw new Error( "EOF indicator is missing" );
		}
	}

	getBounds( unit ) {

		// Make sure the file is complete
		this._checkEOF();

		// Create format
		let format = new Format( {
			type: 'number',
			point: 'floating',
			unit: unit
		} );

		let xMin, xMax;
		let yMin, yMax;
		for( let a of this._actions ) {

			// We just need all Gerber operations
			if( ! this._reader.operation.checkInstance( a ) ) continue;

			let point = a.get( format );

			if( xMin === undefined || point.x < xMin ) xMin = point.x;
			if( xMax === undefined || point.x > xMax ) xMax = point.x;
			if( yMin === undefined || point.y < yMin ) yMin = point.y;
			if( yMax === undefined || point.y > yMax ) yMax = point.y;

		}

		return [ unit, yMax, xMax, yMin, xMin ];

	}

	toString( transformation ) {

		// Just output if complete file has been read
		this._checkEOF();

		let ret = "";
		for( let a of this._actions ) {

			// Transformation of Gerber operations
			if( this._reader.operation.checkInstance( a ) ) {
				a.setPointTransformation( transformation );
			}

			ret += `${a.toString()}\n`;

		}

		return ret;

	}

}

module.exports = GerberReader;
