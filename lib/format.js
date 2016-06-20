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
			required: true
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
			throw new Error( "precsionPre is missing" );
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

}

module.exports = Format;
