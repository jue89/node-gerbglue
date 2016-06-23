'use strict';

const GerberPolarityRE = /^%LP(C|D)\*%$/;

class GerberPolarity {

	constructor( reArr ) { this._polarity = reArr[1]; }

	get() { return this._polarity; }

	toString() {
		return `%LP${this._polarity}*%`;
	}

}

class GerberPolarityReader {

	fromLine( line ) {

		// Check given line against regular expression
		let re = GerberPolarityRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		return new GerberPolarity( re );

	}

	checkInstance( test ) {
		return (test instanceof GerberPolarity);
	}

}

module.exports = GerberPolarityReader;
