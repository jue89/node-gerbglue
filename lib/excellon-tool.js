'use strict';

const ExcellonToolRE = /^T([0-9]+)$/;

class ExcellonTool {

	constructor( reArr, toolStore, job ) {

		this._tool = toolStore.lookup( job, reArr[1] );

	}

	toString() { return "T" + this._tool; }

}

class ExcellonToolReader {

	constructor( toolStore, job ) {
		this._toolStore = toolStore;
		this._job = job;
	}

	fromLine( line ) {

		// Check given line against regular expression
		let re = ExcellonToolRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		return new ExcellonTool( re, this._toolStore, this._job );

	}

	checkInstance( test ) {
		return (test instanceof ExcellonTool);
	}

}

module.exports = ExcellonToolReader;
