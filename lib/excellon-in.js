'use strict';

const Format = require( './format.js' );
const ExcellonHoleReader = require( './excellon-hole.js' );
const ExcellonToolReader = require( './excellon-tool.js' );
const ExcellonToolAddReader = require( './excellon-tool-add.js' );

const IgnoreRE = [
	/^;/,                     // Comments
	/^(INCH|METRIC),(T|L)Z$/, // Number format -> Must be specified by user
	/^FMAT,2$/,               // Format definition
	/^G90$/,                  // Only absolute format is allowed
	/^G05$/,                  // Only drill mode is allowed
	/^M(71|72)$/,             // Ignore metric / imperial number format definition
	/^T0$/                    // Tool 0 is unload tool
];
const HeaderStartRE = /^M48$/;
const HeaderEndRE = /^(%|M95)$/;
const EOFRE = /^M30$/;

const M_START  = 0;
const M_HEADER = 1;
const M_BODY   = 2;
const M_EOF    = 3;

class ExcellonReader {

	constructor( job, fileBuffer, toolStore, srcFormat, dstFormat, boundaries ) {

		this._job = job;
		this._toolStore = toolStore;
		this._srcFormat = srcFormat;
		this._dstFormat = dstFormat;
		this._boundaries = boundaries;

		this._mode = M_START;
		this._actions = [];
		this._reader = {};

		// Parse given buffer
		fileBuffer.toString().replace( /\r/g, '' ).split( '\n' ).forEach( (line) => this._interpreteLine( line ) );

	}

	_interpreteLine( line ) {

		// Skip if end of file has been reached
		if( this._mode === M_EOF ) return;

		// Check for mode change
		if( this._mode === M_START && HeaderStartRE.test( line ) ) {
			this._mode = M_HEADER;
			this._reader = {
				toolAdd: new ExcellonToolAddReader( this._toolStore, this._job, this._srcFormat )
			};
			return;
		}
		if( this._mode === M_HEADER && HeaderEndRE.test( line ) ) {
			this._mode = M_BODY;
			this._reader = {
				hole: new ExcellonHoleReader( this._srcFormat, this._dstFormat, this._boundaries ),
				tool: new ExcellonToolReader( this._toolStore, this._job )
			};
			return;
		}
		if( this._mode === M_BODY && EOFRE.test( line ) ) {
			this._mode = M_EOF;
			return;
		}

		// Ignore comments and deprecated commands
		for( let re of IgnoreRE ) {
			if( re.test( line ) ) return;
		}

		// Go through reader object and try to interprete the given line
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

		// No match!
		throw new Error( "This line cannot be interpreted:\n " + line );

	}

	_checkEOF() {
		if( this._mode !== M_EOF ) {
			throw new Error( "EOF indicator is missing" );
		}
	}

	toString( transformation ) {

		// Just output if complete file has been read
		this._checkEOF();

		let ret = "";
		for( let a of this._actions ) {

			// Set point transformation for holes
			if( typeof a.setPointTransformation == 'function' ) {
				a.setPointTransformation( transformation );
			}

			ret += `${a.toString()}\n`;

		}

		return ret;

	}

}

module.exports = ExcellonReader;
