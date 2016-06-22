'use strict';

const GerberApertureRE = /^D([1-9][0-9])\*$/;

class GerberAperture {

	constructor( reArr, apertureStore, job ) {

		this._aperture = apertureStore.lookup( job, reArr[1] );

	}

	toString() { return "D" + this._aperture + "*"; }

}

module.exports = {
	GerberApertureRE: GerberApertureRE,
	GerberAperture: GerberAperture
};
