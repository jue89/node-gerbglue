'use strict';

const ExcellonToolAddRE = /^T([0-9]+)(.+)$/;
const NumberRE = /^[.0-9]$/;
const OptionRE = /^[CSF]$/;

class ExcellonToolAddReader {

	constructor( toolStore, job, srcFormat ) {
		this._toolStore = toolStore;
		this._job = job;
		this._srcFormat = srcFormat;
	}

	fromLine( line ) {

		// Check given line against regular expression
		let re = ExcellonToolAddRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Split data
		let localToolID = re[1];
		let opts = {};
		let optStr = re[2];
		let curOpt;
		let i = 0;
		do {
			let char = optStr[i];

			if( NumberRE.test( char ) && curOpt ) {
				opts[ curOpt ] += char;
				continue;
			}

			if( OptionRE.test( char ) ) {
				curOpt = char;
				opts[ curOpt ] = '';
				continue;
			}

			throw new Error( "Unknown tool option: " + char );

		} while( ++i < optStr.length );

		if( ! opts.C ) {
			throw new Error( "No drill diameter given" );
		}

		// Add tool
		this._toolStore.add( localToolID, opts.C, this._job, this._srcFormat );

		// Indicate that we successfully added the tool
		return true;

	}

}

module.exports = ExcellonToolAddReader;
