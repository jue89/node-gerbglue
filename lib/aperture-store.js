'use strict';

const Format = require( './format.js' );
const Point = require( './point.js' );


// Aperture geometrics
const ADCircleRE = /^C,([0-9.]+)(X[0-9.]+)?$/;
class ADCircle extends Point {

	constructor( reArr, srcFormat, dstFormat ) {

		// Obtain parameters
		let values = {};
		values.d = reArr[1];
		if( reArr[2] !== undefined ) values.h = reArr[2].slice(1);

		super( values, srcFormat, dstFormat );

	}

	toString() {

		let values = this.get();
		let ret = `C,${values.d}`;
		if( values.h !== undefined ) ret += `X${values.h}`;

		return ret;

	}

}

const ADRectRE = /^R,([0-9.]+)X([0-9.]+)(X[0-9.]+)?$/;
class ADRect extends Point {

	constructor( reArr, srcFormat, dstFormat ) {

		// Obtain parameters
		let values = {};
		values.x = reArr[1];
		values.y = reArr[2];
		if( reArr[3] !== undefined ) values.h = reArr[3].slice(1);

		super( values, srcFormat, dstFormat );

	}

	toString() {

		let values = this.get();
		let ret = `R,${values.x}X${values.y}`;
		if( values.h !== undefined ) ret += `X${values.h}`;

		return ret;

	}

}

const ADObroundRE = /^O,([0-9.]+)X([0-9.]+)(X[0-9.]+)?$/;
class ADObround extends Point {

	constructor( reArr, srcFormat, dstFormat ) {

		// Obtain parameters
		let values = {};
		values.x = reArr[1];
		values.y = reArr[2];
		if( reArr[3] !== undefined ) values.h = reArr[3].slice(1);

		super( values, srcFormat, dstFormat );

	}

	toString() {

		let values = this.get();
		let ret = `O,${values.x}X${values.y}`;
		if( values.h !== undefined ) ret += `X${values.h}`;

		return ret;

	}

}


class ApertureStore {

	constructor( dstFormat ) {

		// Convert format. We just need to unit.
		// Apertures are always floating-point
		dstFormat = new Format( {
			type: 'string',
			unit: dstFormat.unit,
			point: 'floating',
			precisionPost: 6
		} );

		this._dstFormat = dstFormat;
		this._apertures = [];
		this._dict = {};

	}

	add( localApertureID, apertureDef, job, srcFormat ) {

		// Convert format. We just need to unit.
		// Apertures are always floating-point
		srcFormat = new Format( {
			type: 'string',
			unit: srcFormat.unit,
			point: 'floating',
			precisionPost: 6
		} );

		// Create an aperture definition object
		function instanceByRE( testArr, line, srcFormat, dstFormat ) {

			// We tested everything
			if( testArr.length === 0 ) return;

			// Get test item
			let testItem = testArr.shift();

			// Execute regular expression
			let tmp = testItem[0].exec( line );

			// It did not match? -> Try next one
			if( ! tmp ) return instanceByRE( testArr, line, srcFormat, dstFormat );

			// Create instance
			let obj = new testItem[1]( tmp, srcFormat, dstFormat );

			// Return new instance
			return { obj: obj, str: obj.toString() };

		}

		let tmp = instanceByRE(
			[
				[ ADCircleRE,    ADCircle ],
				[ ADRectRE,      ADRect ],
				[ ADObroundRE,   ADObround ]
			],
			apertureDef,
			srcFormat,
			this._dstFormat
		);
		if( ! tmp ) throw new Error( "Unknown aperture definition: " + apertureDef );

		// Look in the list, maybe we have something matching
		let globalApertureID;
		for( let a in this._apertures ) {
			if( this._apertures[a].str == tmp.str ) {
				globalApertureID = 10 + parseInt( a );
				break;
			}
		}

		// If we haven't found one, just create one
		if( ! globalApertureID ) {
			globalApertureID = this._apertures.length + 10;
			this._apertures.push( tmp );
		}

		// Create link
		if( this._dict[ job ] === undefined ) this._dict[ job ] = {};
		this._dict[ job ][ parseInt( localApertureID ) ] = globalApertureID.toString();

	}

	lookup( job, localApertureID ) {

		// Just lookup the global aperture id
		return this._dict[ job ][ parseInt( localApertureID ) ];

	}

	toString() {

		let tmp = [];

		for( let a in this._apertures ) {
			let globalApertureID = parseInt( a ) + 10;
			tmp.push( `%ADD${globalApertureID.toString()}${this._apertures[a].str}*%` );
		}

		return tmp.join( "\n" );

	}

}

module.exports = ApertureStore;
