'use strict';

const Format = require( './format.js' );
const PointTransformation = require( './point-transformation.js' );


const ONE_INCH = 25.4; //mm
function convertFormat( number, srcFormat, dstFormat ) {

	// Check input format
	if( typeof number != srcFormat.type ) throw new Error( "Wrong input type" );

	// Revert trailing zero supression
	if( srcFormat.zeroSupression == 'trailing' ) {
		number = number.toString();
		let fullLength = srcFormat.precisionPre + srcFormat.precisionPost;
		if( number[0] == '-' ) fullLength++;
		while( number.length < fullLength ) {
			number = number + '0';
		}
	}

	// Always convert to a floating point number
	number = parseFloat( number );
	if( isNaN( number ) ) throw new Error( "Given number cannot be converted to float" );
	if( srcFormat.point == 'fixed' ) number /= Math.pow( 10, srcFormat.precisionPost );

	// Make unit conversion if necessary
	if( srcFormat.unit != dstFormat.unit ) {
		number = ( dstFormat.unit == 'metric' ) ? number * ONE_INCH : number / ONE_INCH;
	}

	// Bring the number to the right precision if it has been stated
	if( dstFormat.precisionPost !== undefined ) {
		number *= Math.pow( 10, dstFormat.precisionPost );
		number = Math.round( number );

		// If we wan't a floating point number bring to point back
		if( dstFormat.point == 'floating' ) {
			number /= Math.pow( 10, dstFormat.precisionPost );
		}
	}

	// If we want a number, return the result. Leading or trailing zeros cannot be added.
	if( dstFormat.type == 'number' ) return number;

	// Convert the number to string
	number = number.toString();

	// If the number is negative, remove the minus sign
	let neg = (number[0] == '-');
	if( neg ) number = number.slice( 1 );

	if( dstFormat.point == 'fixed' ) {

		// We wan't to remove leading zeros: Well, we alread did that.
		if( dstFormat.zeroSupression == 'leading' ) {
			return neg ? '-' + number : number;
		}

		// When we wan't no or trailing zero supression, we have to add some leading zeros.
		while( number.length < dstFormat.precisionPre + dstFormat.precisionPost ) {
			number = '0' + number;
		}

		// We wan't no zero supression -> here we go!
		if( dstFormat.zeroSupression == 'none' ) {
			return neg ? '-' + number : number;
		}

		// Remove trailing zeros and then return the number
		while( number[ number.length - 1 ] == '0' ) {
			number = number.slice( 0, number.length - 1 );
		}

		return neg ? '-' + number : number;

	} else {

		// Split the number apart
		let tmp = number.split( '.' );

		// If the number haven't had a decimal point, we add an array for the decimal places
		if( tmp.length == 1 ) tmp.push( '' );

		// Add zeros to the decimal places
		while( tmp[1].length < dstFormat.precisionPost ) {
			tmp[1] = tmp[1] + '0';
		}

		return ( neg ? '-' : '' ) + tmp[0] + '.' + tmp[1];

	}

}


class Point {

	constructor( values, srcFormat, dstFormat ) {

		// Test parameters
		if( typeof values != 'object' ) {
			throw new Error( "values must be an object" );
		}
		if( ! ( srcFormat instanceof Format ) ) {
			throw new Error( "srcFormat must be an instance of Format" );
		}
		if( ! ( dstFormat instanceof Format ) ) {
			throw new Error( "dstFormat must be an instance of Format" );
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
