'use strict';

const GerberModeRE = /^G0*(1|36|37)\*$/;

class GerberMode {

	constructor( reArr ) { this._mode = reArr[1]; }

	get() { return this._mode; }

	toString() {
		let ret = `G`;
		if( this._mode.length == 1 ) ret += `0`;
		ret += `${this._mode}*`;

		return ret;
	}

}

class GerberModeReader {

	fromLine( line ) {

		// Check given line against regular expression
		let re = GerberModeRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		return new GerberMode( re );

	}

}

module.exports = GerberModeReader;
