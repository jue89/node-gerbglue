const Format = require( './format.js' );
const GerberHeaderReader = require( './gerber-header.js' );
const GerberOperationReader = require( './gerber-operation.js' );
const GerberModeReader = require( './gerber-mode.js' );
const GerberApertrueReader = require( './gerber-aperture.js' );
const GerberApertrueAddReader = require( './gerber-aperture-add.js' );

const CommentRE = /^G0*4/;
const EOFRE = /^M0*2\*$/;

class GerberReader {

	constructor( job, fileStream, apertureStore, dstFormat ) {

		this._job = job;

		this._readerHeader = new GerberHeaderReader();
		this._reader = {};

		this._apertureStore = apertureStore;
		this._dstFormat = dstFormat;

		this._eof = false;
		this._actions = [];

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

				return;

			} else if( tmp === true ) {

				return;

			}

		} else {

			let tmp;
			for( let r in this._reader ) {
				tmp = this._reader[r].fromLine();

				// The reader will return true if the line has been interpreted but does not generate any output
				if( tmp === true ) return;

				// If the reader hasn't returned null, there was a match!
				if( tmp !== null ) {

					// Add this action to stack
					this._action.push( tmp );

					return;

				}

			}

		}

		// Ignore comments
		if( CommentRE.test( line ) ) return;

		// End of file
		if( EOFRE.test( line ) ) {
			this._eof = true;
			return;
		}

		// No match!
		throw new Error( "This line cannot be interpreted:\n " + line );

	}

}

module.exports = GerberReader;
