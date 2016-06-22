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

module.exports = {
	GerberModeRE: GerberModeRE,
	GerberMode: GerberMode
};
