'use strict';

const assert = require( 'assert' );

describe( "Class ExcellonHole", () => {

	const Format = require( '../lib/format.js' );
	const ExcellonHoleReader = require( '../lib/excellon-hole.js' );

	const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } );
	const oFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 4, zeroSupression: 'leading' } );

	const input = [
		'X95000Y-100000',
		'X-95000Y100000',
		'X-95000',
		'Y100000'
	];

	const output = [
		'X950000Y-1000000',
		'X-950000Y1000000',
		'X-950000',
		'Y1000000'
	];

	it( `should convert ${iFormat} to ${oFormat}`, ( done ) => {

		let go = new ExcellonHoleReader( iFormat, oFormat );

		for( let i in input ) {
			let op = go.fromLine( input[i] );
			assert.strictEqual( op.toString(), output[i] );
		}

		done();

	} );

	it( `should bypass operation if no boundaries are crossed`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 95, -100, -95 ]
		);

		for( let i in input ) {
			let op = go.fromLine( input[i] );
		}

		done();

	} );

	it( `should reject operation upon boundary crossing (yMax)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 99, 95, -100, -95 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (xMax)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 94, -100, -95 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (yMin)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 95, -99, -95 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (xMin)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 95, -100, -94 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

} );
