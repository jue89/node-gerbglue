'use strict';

const assert = require( 'assert' );

describe( "Class GerberOperation", () => {

	const Format = require( '../lib/format.js' );
	const GerberOperationReader = require( '../lib/gerber-operation.js' );

	const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 2, precisionPost: 4, zeroSupression: 'leading' } );
	const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 2, precisionPost: 3, zeroSupression: 'leading' } );

	const input = [
		'X0Y50000D02*',
		'Y100000D01*',
		'X100000D01*',
		'Y0D01*',
		'X0D01*',
		'Y50000D01*',
		'D02*',
		'X-50000Y10000D01*',
		'X-90000Y50000D01*',
		'X-50000Y90000D01*',
		'X0Y50000D01*',
		'X50000Y60000I30000J0D01*'
	];

	const output = [
		'X0Y197D02*',
		'Y394D01*',
		'X394D01*',
		'Y0D01*',
		'X0D01*',
		'Y197D01*',
		'D02*',
		'X-197Y39D01*',
		'X-354Y197D01*',
		'X-197Y354D01*',
		'X0Y197D01*',
		'X197Y236I118J0D01*'
	];

	it( `should convert ${iFormat} to ${oFormat}`, ( done ) => {

		let go = new GerberOperationReader( iFormat, oFormat );

		for( let i in input ) {
			let op = go.fromLine( input[i] );
			assert.strictEqual( op.toString(), output[i] );
		}

		done();

	} );

	it( `should bypass operation if no boundaries are crossed`, ( done ) => {

		let go = new GerberOperationReader(
			iFormat,
			oFormat,
			[ 'metric', 10, 10, 0, -9 ]
		);

		for( let i in input ) {
			let op = go.fromLine( input[i] );
		}

		done();

	} );

	it( `should reject operation upon boundary crossing (yMax)`, ( done ) => {

		let go = new GerberOperationReader(
			iFormat,
			oFormat,
			[ 'metric', 9.9, 10, 0, -9 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (xMax)`, ( done ) => {

		let go = new GerberOperationReader(
			iFormat,
			oFormat,
			[ 'metric', 10, 9.9, 0, -9 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (yMin)`, ( done ) => {

		let go = new GerberOperationReader(
			iFormat,
			oFormat,
			[ 'metric', 10, 10, 0.1, -9 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject operation upon boundary crossing (xMin)`, ( done ) => {

		let go = new GerberOperationReader(
			iFormat,
			oFormat,
			[ 'metric', 10, 10, 0, -8.9 ]
		);

		try {
			for( let i in input ) {
				let op = go.fromLine( input[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

} );
