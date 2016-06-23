'use strict';

const Format = require( './format.js' ).Format;
const convertFormat = require( './format.js' ).convertFormat;

class Point {

	constructor( values, srcFormat, dstFormat ) {

		// Test parameters
		if( typeof values != 'object' ) {
			throw new Error( "values must be an object" );
		}

		// Store destination format
		this._dstFormat = dstFormat;

		// Generate intermediate format
		this._interFormat = new Format( {
			type: 'number',
			unit: dstFormat.unit,
			point: 'floating'
		} );

		// Convert all values to intermediate format
		this._values = {};
		for( let v in values ) {
			this._values[ v ] = convertFormat( values[v], srcFormat, this._interFormat );
		}

	}

	move( values, format ) {

		// Test parameters
		if( typeof values != 'object' ) {
			throw new Error( "values must be an object" );
		}

		for( let v in values ) {

			// Skip non-existing dimensions
			if( this._values[v] === undefined ) continue;

			// Convert movement to intermediate format and then move the coordinate
			this._values[v] += convertFormat( values[v], format, this._interFormat );

		}

	}

	get() {

		let tmp = {};

		// Convert everything to destination format
		for( let v in this._values ) {
			tmp[ v ] = convertFormat( this._values[ v ], this._interFormat, this._dstFormat );
		}

		return tmp;

	}

}

module.exports = Point;
