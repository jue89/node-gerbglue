'use strict';

const Format = require( './format.js' ).Format;
const convertFormat = require( './format.js' ).convertFormat;
const PointTransformation = require( './point-transformation.js' );

class Point {

	constructor( values, srcFormat, dstFormat ) {

		// Test parameters
		if( typeof values != 'object' ) {
			throw new Error( "values must be an object" );
		}

		// Default transformation object
		this._transformation = {};

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

	setPointTransformation( transformation ) {

		// Unset transformation
		if( ! transformation ) {
			this._transformation = {};
			return;
		}

		// Set new transformation
		if( ! ( transformation instanceof PointTransformation ) ) {
			throw new Error( "transformation must be an instnace of PointTransformation" );
		}

		this._transformation = transformation;

	}

	get( dstFormat ) {

		// Check parameter
		if( dstFormat === undefined ) {
			// Destination format has not been overwritten
			dstFormat = this._dstFormat;
		} else if( ! ( dstFormat instanceof Format ) ) {
			// The user screwed everything up
			throw new Error( "dstFormat must be an instance of Format" );
		}

		let tmp = {};

		// Convert everything to destination format
		for( let v in this._values ) {

			let value = this._values[ v ];

			// If transformation is given transform the point
			if( this._transformation[ v ] ) {
				value = this._transformation[ v ][ this._interFormat.unit ]( value );
			}

			tmp[ v ] = convertFormat( value, this._interFormat, dstFormat );

		}

		return tmp;

	}

}

module.exports = Point;
