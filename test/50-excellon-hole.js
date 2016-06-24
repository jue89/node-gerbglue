'use strict';

const assert = require( 'assert' );

describe( "Class ExcellonHole", () => {

	const Format = require( '../lib/format.js' );
	const ExcellonHoleReader = require( '../lib/excellon-hole.js' );

	const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } );
	const oFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 4, zeroSupression: 'leading' } );

	const inputSimple = [
		'X95000Y-100000',
		'X-95000Y100000',
		'X-95000',
		'Y100000'
	];

	const outputSimple = [
		'X950000Y-1000000',
		'X-950000Y1000000',
		'X-950000',
		'Y1000000'
	];

	const inputSlotted = [
		'X1000Y-1000G85X-1000Y1000'
	];

	const outputSlotted = [
		'X10000Y-10000G85X-10000Y10000'
	];

	it( `should convert simple hole from ${iFormat} to ${oFormat}`, ( done ) => {

		let go = new ExcellonHoleReader( iFormat, oFormat );

		for( let i in inputSimple ) {
			let op = go.fromLine( inputSimple[i] );
			assert.strictEqual( op.toString(), outputSimple[i] );
		}

		done();

	} );

	it( `should bypass simple hole if no boundaries are crossed`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 95, -100, -95 ]
		);

		for( let i in inputSimple ) {
			let op = go.fromLine( inputSimple[i] );
		}

		done();

	} );

	it( `should reject simple hole upon boundary crossing (yMax)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 99, 95, -100, -95 ]
		);

		try {
			for( let i in inputSimple ) {
				let op = go.fromLine( inputSimple[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject simple hole upon boundary crossing (xMax)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 94, -100, -95 ]
		);

		try {
			for( let i in inputSimple ) {
				let op = go.fromLine( inputSimple[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject simple hole upon boundary crossing (yMin)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 95, -99, -95 ]
		);

		try {
			for( let i in inputSimple ) {
				let op = go.fromLine( inputSimple[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject simple hole upon boundary crossing (xMin)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 100, 95, -100, -94 ]
		);

		try {
			for( let i in inputSimple ) {
				let op = go.fromLine( inputSimple[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should convert slotted hole from ${iFormat} to ${oFormat}`, ( done ) => {

		let go = new ExcellonHoleReader( iFormat, oFormat );

		for( let i in inputSlotted ) {
			let op = go.fromLine( inputSlotted[i] );
			assert.strictEqual( op.toString(), outputSlotted[i] );
		}

		done();

	} );

	it( `should bypass slotted hole if no boundaries are crossed`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 1, -1, -1 ]
		);

		for( let i in inputSlotted ) {
			let op = go.fromLine( inputSlotted[i] );
		}

		done();

	} );

	it( `should reject slotted hole upon boundary crossing (yMax)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 0.9, 1, -1, -1 ]
		);

		try {
			for( let i in inputSlotted ) {
				let op = go.fromLine( inputSlotted[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject slotted hole upon boundary crossing (xMax)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 0.9, -1, -1 ]
		);

		try {
			for( let i in inputSlotted ) {
				let op = go.fromLine( inputSlotted[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject slotted hole upon boundary crossing (yMin)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 1, -0.9, -1 ]
		);

		try {
			for( let i in inputSlotted ) {
				let op = go.fromLine( inputSlotted[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( `should reject slotted hole upon boundary crossing (xMin)`, ( done ) => {

		let go = new ExcellonHoleReader(
			iFormat,
			oFormat,
			[ 'metric', 1, 1, -1, -0.9 ]
		);

		try {
			for( let i in inputSlotted ) {
				let op = go.fromLine( inputSlotted[i] );
			}
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

} );
