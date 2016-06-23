'use strict';

const assert = require( 'assert' );

describe( "Class Point", () => {

	const Format = require( '../lib/format.js' ).Format;
	const Point = require( '../lib/point.js' );

	it( "should complain about missing value", ( done ) => {
		try {

			let point = new Point( );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing srcFormat", ( done ) => {
		try {

			let point = new Point( {} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing dstFormat", ( done ) => {
		try {

			let point = new Point( {}, new Format() );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	function testConvert( iFormat, oFormat, input, output ) {
		iFormat = new Format( iFormat );
		oFormat = new Format( oFormat );
		it( `should convert ${iFormat} to ${oFormat}`, ( done ) => {
			let point = new Point( input, iFormat, oFormat );
			assert.deepStrictEqual( point.get(), output );
			done();
		} );
	}

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 4, zeroSupression: 'leading' },
		{ x: '123456789', y:'-123456789' },
		{ x: '1234568',   y:'-1234568' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 4, zeroSupression: 'leading' },
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ x: '1234567',   y:'-1234567' },
		{ x: '123456700', y:'-123456700' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' },
		{ x: '25400000', y: '-25400000' },
		{ x: '1000',     y:'-1000' }
	);

	testConvert(
		{ type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' },
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ x: '1000',     y:'-1000' },
		{ x: '25400000', y: '-25400000' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' },
		{ type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 2, precisionPost: 4, zeroSupression: 'leading' },
		{ x: '95000', y: '-100000' },
		{ x: '37402', y:'-39370' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'floating', precisionPost: 3, zeroSupression: 'leading' },
		{ type: 'string', unit: 'imperial', point: 'floating', precisionPost: 3, zeroSupression: 'leading' },
		{ d: '0.300' },
		{ d: '0.012' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'trailing' },
		{ x: '1000000', y:'-1000000' },
		{ x: '0001',    y: '-0001' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'trailing' },
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ x: '0001',    y: '-0001' },
		{ x: '1000000', y:'-1000000' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'none' },
		{ x: '1000000',    y:'-1000000' },
		{ x: '0001000000', y: '-0001000000' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'none' },
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' },
		{ x: '0001000000',    y: '-0001000000' },
		{ x: '1000000', y:'-1000000' }
	);

	testConvert(
		{ type: 'string', unit: 'metric', point: 'floating', precisionPost: 6 },
		{ type: 'string', unit: 'imperial', point: 'floating', precisionPost: 6 },
		{ x: '1.27',    y: '-1.27' },
		{ x: '0.050000', y:'-0.050000' }
	);

	it( 'should move a point', ( done ) => {

		let point = new Point(
			{ x: '1000', y: '-1000' },
			new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } ),
			new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6, zeroSupression: 'leading' } )
		);

		point.move(
			{ x: -0.9, d: 1 },
			new Format( { type: 'number', unit: 'imperial', point: 'floating' } )
		);

		assert.deepStrictEqual( point.get(), { x: '2540000', y: '-25400000' } );
		done();

	} );

} );
