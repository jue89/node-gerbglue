'use strict';

const Format = require( './format.js' );
const Point = require( './point.js' );

const ExcellonHoleRE = /^(X\-?[0-9]+)?(Y\-?[0-9]+)?(G85)?(X\-?[0-9]+)?(Y\-?[0-9]+)?$/;

class ExcellonHole extends Point {

	constructor( reArr, srcFormat, dstFormat, boundaries ) {

		// Interprete array
		let x = reArr[1];
		let y = reArr[2];

		let values = {};
		if( x !== undefined ) values.x = x.slice( 1 );
		if( y !== undefined ) values.y = y.slice( 1 );

		// Call super constructor
		super( values, srcFormat, dstFormat );

		// If boundaries are given make sure this point does not cross them
		if( boundaries ) {
			let v = this.get( boundaries[0] );
			if( v.y > boundaries[1] || v.x > boundaries[2] || v.y < boundaries[3] || v.x < boundaries[4] ) {
				throw new Error( `Point ${reArr[0]} out of bounds` );
			}
		}

	}

	toString() {

		// Convert values back to operation string
		let values = this.get();
		let ret = "";
		for( let v in values ) {
			ret += v.toUpperCase() + values[ v ];
		}

		return ret;

	}

}

class ExcellonSlottedHole {

	constructor( reArr, srcFormat, dstFormat, boundaries ) {

		// Create two points
		this._start = new ExcellonHole(
			[ reArr[0], reArr[1], reArr[2] ],
			srcFormat,
			dstFormat,
			boundaries
		);
		this._end = new ExcellonHole(
			[ reArr[0], reArr[4], reArr[5] ],
			srcFormat,
			dstFormat,
			boundaries
		);

	}

	setPointTransformation( transformation ) {

		// Bypass point transformation to both points
		this._start.setPointTransformation( transformation );
		this._end.setPointTransformation( transformation );

	}

	toString() {

		return `${this._start}G85${this._end}`;

	}

}


class ExcellonHoleReader {

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

			// Convert format
			boundaries[0] = new Format( { type: 'number', point:'floating', unit: boundaries[0] } );
			this._boundaries = boundaries;

		}
	}

	fromLine( line ) {

		// Check given line against regular expression
		// This might be a normal or a slotted hole
		let re = ExcellonHoleRE.exec( line );

		// No match -> stop here
		if( ! re ) return null;

		// Create instance from line
		let op;
		if( re[3] == 'G85' ) {
			// Its a slotted hole
			op = new ExcellonSlottedHole( re, this._srcFormat, this._dstFormat, this._boundaries );
		} else {
			// Its a simple hole
			op = new ExcellonHole( re, this._srcFormat, this._dstFormat, this._boundaries );
		}

		return op;
	}

	checkInstance( test ) {
		return (test instanceof ExcellonHole);
	}

}

module.exports = ExcellonHoleReader;
