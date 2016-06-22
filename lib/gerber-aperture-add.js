'use strict';

const GerberApertureAddRE = /^%ADD([1-9][0-9])(C,.*|R,.*|O,.*|P,.*)\*%$/;

class GerberApertureAddReader {

	constructor( apertureStore, job, srcFormat ) {
		this._apertureStore = apertureStore;
		this._job = job;
		this._srcFormat = srcFormat;
	}

	fromLine( line ) {

		// Check given line against regular expression
		let re = GerberApertureAddRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Add aperture
		this._apertureStore.add( re, this._job, this._srcFormat );

		// Indicate that we successfully added the aperture
		return true;

	}

}

module.exports = GerberApertureAddReader;
