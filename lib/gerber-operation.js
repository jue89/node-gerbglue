'use strict';

const Format = require( './format.js' );
const Point = require( './point.js' );

const GerberOperationRE = /^(X\-?[0-9]+)?(Y\-?[0-9]+)?(I\-?[0-9]+)?(J\-?[0-9]+)?(D0*([123]))?\*$/;

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

	constructor( srcFormat, dstFormat, boundaries ) {
		this._srcFormat = srcFormat;
		this._dstFormat = dstFormat;

		if( boundaries ) {

			// Check boundaries format
			if( ! (boundaries instanceof Array) ) {
				throw new Error( "boundaries must be an array" );
			}
			if( boundaries.length != 5 ) {
				throw new Error( "boundaries must have 5 items" );
			}
			if( boundaries[0] != 'metric' && boundaries[0] != 'imperial' ) {
				throw new Error( "boundaries item 0 must be 'metric' or 'imperial'" );
			}
			for( let b = 1; b < 5; b++ ) {
				if( typeof boundaries[b] != 'number' ) {
					throw new Error( "boundaries items 1-4 must be numbers" );
				}
			}

			this._boundaries = boundaries;
			this._boundariesFormat = new Format( { type: 'number', point:'floating', unit: boundaries[0] } );

		}
	}

	fromLine( line ) {

		// Check given line against regular expression
		let re = GerberOperationRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		let op = new GerberOperation( re, this._srcFormat, this._dstFormat );

		// If boundaries are given make sure
		if( this._boundaries ) {
			let b = this._boundaries;
			let v = op.get( this._boundariesFormat );
			if( v.y > b[1] || v.x > b[2] || v.y < b[3] || v.x < b[4] ) {
				throw new Error( `Point ${line} out of bounds` );
			}
		}

		return op;
	}

	checkInstance( test ) {
		return (test instanceof GerberOperation);
	}

}

module.exports = GerberOperationReader;
