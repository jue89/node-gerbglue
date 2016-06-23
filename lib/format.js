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

module.exports = Format;
