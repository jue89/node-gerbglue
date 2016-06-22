'use strict';

const Format = require( './format.js' );

const GerberHeaderFSRE = /^%FS(L|T)AX([0-9])([0-9])Y([0-9])([0-9]+)\*%$/;
const GerberHeaderMORE = /^%MO(MM|IN)\*%$/;

class GerberHeader {

	constructor() {
		this._format = {
			type: 'string',
			point: 'fixed'
		};
		this._fsGiven = false;
		this._moGiven = false;
	}

	setFS( reArr ) {

		// Check whether FS command has been called in the past
		if( this._fsGiven ) {
			throw new Error("FS command has been called in the past");
		}

		// Check whether X and Y format is equal
		if( reArr[2] !== reArr[4] || reArr[3] !== reArr[5] ) {
			throw new Error("X and Y format must be equal");
		}

		// Set format options
		this._format.zeroSupression = ( reArr[1] == 'L' ) ? 'leading' : 'trailing';
		this._format.precisionPre = parseInt( reArr[2] );
		this._format.precisionPost = parseInt( reArr[3] );

		this._fsGiven = true;

	}

	setMO( reArr ) {

		// Check whether MO command has been called in the past
		if( this._moGiven ) {
			throw new Error("MO command has been called in the past");
		}

		// Set format options
		this._format.unit = ( reArr[1] == 'MM' ) ? 'metric' : 'imperial';

		this._moGiven = true;

	}

	get() {
		if( ! this._fsGiven || ! this._moGiven ) return null;
		return new Format( this._format );
	}

	toString() {
		this.get().toString();
	}

}

class GerberHeaderReader {

	constructor() {
		this._header = new GerberHeader();
	}

	fromLine( line ) {

		// Check given line against regular expression
		let FSre = GerberHeaderFSRE.exec( line );
		if( FSre ) {

			// Interprete FS line
			this._header.setFS( FSre );

			// If all information is available return format
			let tmp = this._header.get();
			if( tmp ) return tmp;

			// Otherwise return true in order to indicate that the line has been read successfully but not all data is available
			return true;

		}
			
		let MOre = GerberHeaderMORE.exec( line );
		if( MOre ) {

			// Interprete MO line
			this._header.setMO( MOre );

			// If all information is available return format
			let tmp = this._header.get();
			if( tmp ) return tmp;

			// Otherwise return true in order to indicate that the line has been read successfully but not all data is available
			return true;

		}

		// Nothing matched
		return null;

	}

}

module.exports = GerberHeaderReader;
