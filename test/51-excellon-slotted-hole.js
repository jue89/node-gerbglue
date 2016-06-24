'use strict';

const assert = require( 'assert' );

describe( "Class ExcellonSlottedHole", () => {

	const Format = require( '../lib/format.js' );
	const ExcellonSlottedHoleReader = require( '../lib/excellon-slotted-hole.js' );

	const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } );
	const oFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 4, zeroSupression: 'leading' } );

	const input = [
		'X1000Y-1000G85X-1000Y1000'
	];

	const output = [
		'X10000Y-10000G85X-10000Y10000'
	];

	it( `should convert ${iFormat} to ${oFormat}`, ( done ) => {

		let go = new ExcellonSlottedHoleReader( iFormat, oFormat );

		for( let i in input ) {
			let op = go.fromLine( input[i] );
			assert.strictEqual( op.toString(), output[i] );
		}

		done();

	} );

	it( `should bypass operation if no boundaries are crossed`, ( done ) => {

		let go = new ExcellonSlottedHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 1, -1, -1 ]
		);

		for( let i in input ) {
			let op = go.fromLine( input[i] );
		}

		done();

	} );

	it( `should reject operation upon boundary crossing (yMax)`, ( done ) => {

		let go = new ExcellonSlottedHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 0.9, 1, -1, -1 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (xMax)`, ( done ) => {

		let go = new ExcellonSlottedHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 0.9, -1, -1 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (yMin)`, ( done ) => {

		let go = new ExcellonSlottedHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 1, -0.9, -1 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (xMin)`, ( done ) => {

		let go = new ExcellonSlottedHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 1, -1, -0.9 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

} );
