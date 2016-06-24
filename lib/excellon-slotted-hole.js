'use strict';

const Format = require( './format.js' );
const Point = require( './point.js' );

const ExcellonSlottedHoleRE = /^(X\-?[0-9]+)?(Y\-?[0-9]+)?G85(X\-?[0-9]+)?(Y\-?[0-9]+)?$/;

class ExcellonSlottedHole extends Point {

	constructor( reArr, srcFormat, dstFormat ) {

		// Interprete array
		let x1 = reArr[1];
		let y1 = reArr[2];
		let x2 = reArr[3];
		let y2 = reArr[4];

		let values = {};
		if( x1 !== undefined ) values.x1 = x1.slice( 1 );
		if( y1 !== undefined ) values.y1 = y1.slice( 1 );
		if( x2 !== undefined ) values.x2 = x2.slice( 1 );
		if( y2 !== undefined ) values.y2 = y2.slice( 1 );

		// Call super constructor
		super( values, srcFormat, dstFormat );

	}

	toString() {

		// Convert values back to operation string
		let values = this.get();
		let ret = "";
		if( values.x1 ) ret += `X${values.x1}`;
		if( values.y1 ) ret += `Y${values.y1}`;
		ret += "G85";
		if( values.x2 ) ret += `X${values.x2}`;
		if( values.y2 ) ret += `Y${values.y2}`;

		return ret;

	}

}

class ExcellonSlottedHoleReader {

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
		let re = ExcellonSlottedHoleRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		let op = new ExcellonSlottedHole( re, this._srcFormat, this._dstFormat );

		// If boundaries are given make sure
		if( this._boundaries ) {
			let b = this._boundaries;
			let v = op.get( this._boundariesFormat );
			if( v.y1 > b[1] || v.x1 > b[2] || v.y1 < b[3] || v.x1 < b[4] ) {
				throw new Error( `Point ${line} out of bounds` );
			}
			if( v.y2 > b[1] || v.x2 > b[2] || v.y2 < b[3] || v.x2 < b[4] ) {
				throw new Error( `Point ${line} out of bounds` );
			}
		}

		return op;
	}

	checkInstance( test ) {
		return (test instanceof ExcellonSlottedHole);
	}

}

module.exports = ExcellonSlottedHoleReader;
