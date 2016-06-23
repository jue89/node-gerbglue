'use strict';

const Point = require( './point.js' );

const GerberOperationRE = /(^X[0-9]+)?(Y[0-9]+)?(I[0-9]+)?(J[0-9]+)?(D0*([123]))?\*$/;

class GerberOperation extends Point {

	constructor( reArr, srcFormat, dstFormat ) {

		// Interprete array
		let x = reArr[1];
		let y = reArr[2];
		let i = reArr[3];
		let j = reArr[4];

		let values = {};
		if( x !== undefined ) values.x = x.slice( 1 );
		if( y !== undefined ) values.y = y.slice( 1 );
		if( i !== undefined ) values.i = i.slice( 1 );
		if( j !== undefined ) values.j = j.slice( 1 );

		// Call super constructor
		super( values, srcFormat, dstFormat );

		// Store Opcode
		if( reArr[5] ) this._opCode = reArr[6];

	}

	toString() {

		// Convert values back to operation string
		let values = this.get();
		let ret = "";
		for( let v in values ) {
			ret += v.toUpperCase() + values[ v ];
		}
		if( this._opCode ) ret += "D0" + this._opCode;
		ret += "*";

		return ret;

	}

}

class GerberOperationReader {

	constructor( srcFormat, dstFormat ) {
		this._srcFormat = srcFormat;
		this._dstFormat = dstFormat;
	}

	fromLine( line ) {

		// Check given line against regular expression
		let re = GerberOperationRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		return new GerberOperation( re, this._srcFormat, this._dstFormat );

	}

}

module.exports = GerberOperationReader;
