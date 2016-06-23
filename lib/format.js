'use strict';

const jsonGate = require('json-gate');


// Basic schema for format definition
const schema = jsonGate.createSchema( {
	type: 'object',
	additionalProperties: false,
	properties: {
		'type': {
			enum: [ 'string', 'number' ],
			required: true
		},
		'unit': {
			enum: [ 'imperial', 'metric' ],
			required: true
		},
		'point': {
			enum: [ 'fixed', 'floating' ],
			required: true
		},
		'precisionPre': {
			type: 'number',
			required: false
		},
		'precisionPost': {
			type: 'number',
			required: false
		},
		'zeroSupression': {
			enum: [ 'none', 'leading', 'trailing' ],
			default: 'leading'
		}
	}
} );


class Format {

	constructor( f ) {

		// Test against basic schema
		if( f === undefined ) f= {};
		schema.validate( f );

		// Further tests
		// - precisionPre
		if( f.type == 'string' && f.point == 'fixed' && f.precisionPre === undefined ) {
			throw new Error( "precisionPre is missing" );
		}
		// - precisionPost
		if( ( f.type == 'string' || f.point == 'fixed' ) && f.precisionPost === undefined ) {
			throw new Error( "precisionPost is missing" );
		}
		// - zeroSupression
		if( f.type == 'string' && f.zeroSupression === undefined ) {
			throw new Error( "zeroSupression is missing" );
		}

		// At this point, everything is okay -> store data in this object
		for( let i in f ) {
			this[i] = f[i];
		}

	}

	toString() {

		let ret = "[";
		ret += ( this.point == 'fixed' ) ? "FIXED " + this.precisionPre + ":" + this.precisionPost : "FLOATING *:" + this.precisionPost;
		ret += ( this.unit == 'metric' ) ? " MM" : " INCH";
		ret += ( this.point == 'fixed' ) ? " " + this.zeroSupression.toUpperCase() : "";
		ret += "]";

		return ret;

	}

}

const ONE_INCH = 25.4; //mm
function convertFormat( number, srcFormat, dstFormat ) {

	// Check formats
	if( ! ( srcFormat instanceof Format ) ) {
		throw new Error( "srcFormat must be an instance of Format" );
	}
	if( ! ( dstFormat instanceof Format ) ) {
		throw new Error( "dstFormat must be an instance of Format" );
	}

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

module.exports = {
	Format: Format,
	convertFormat: convertFormat
};
