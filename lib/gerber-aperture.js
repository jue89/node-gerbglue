'use strict';

const GerberApertureRE = /^D([1-9][0-9])\*$/;

class GerberAperture {

	constructor( reArr, apertureStore, job ) {

		this._aperture = apertureStore.lookup( job, reArr[1] );

	}

	toString() { return "D" + this._aperture + "*"; }

}

class GerberApertureReader {

	constructor( apertureStore, job ) {
		this._apertureStore = apertureStore;
		this._job = job;
	}

	fromLine( line ) {

		// Check given line against regular expression
		let re = GerberApertureRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		return new GerberAperture( re, this._apertureStore, this._job );

	}

}

module.exports = GerberApertureReader;
