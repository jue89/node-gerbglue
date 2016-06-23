'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );

describe( "Class Gerber", () => {

	const Format = require( '../lib/format.js' );
	const PointTransformation = require( '../lib/point-transformation.js' );
	const ApertureStore = require( '../lib/aperture-store.js' );
	const GerberReader = require( '../lib/gerber.js' );

	const oFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

	it( "should complain about incomplete file", ( done ) => {

		let as = new ApertureStore( oFormat );

		let gf = new GerberReader(
			'incomplete',
			fs.readFileSync( './test/data/40-gerber-incomplete.gbr' ),
			as,
			oFormat
		);

		try {

			gf.toString();

		} catch( e ) { /*console.log(e);*/ done(); }

	} );

	it( "should read Altium Gerber files", ( done ) => {

		let gf = new GerberReader(
			'altium',
			fs.readFileSync( './test/data/40-gerber-altium-in.gbr' ),
			new ApertureStore( oFormat ),
			oFormat
		);

		assert.strictEqual( gf.toString(), fs.readFileSync( './test/data/40-gerber-altium-out.gbr' ).toString() );

		done();

	} );

	it( "should read KiCad Gerber files", ( done ) => {

		let as = new ApertureStore( oFormat );

		let gf = new GerberReader(
			'altium',
			fs.readFileSync( './test/data/40-gerber-kicad-in.gbr' ),
			as,
			oFormat
		);

		assert.strictEqual( gf.toString(), fs.readFileSync( './test/data/40-gerber-kicad-out.gbr' ).toString() );

		done();

	} );

	it( "should find metric boundaries of a given file", ( done ) => {

		let as = new ApertureStore( oFormat );

		let gf = new GerberReader(
			'altium',
			fs.readFileSync( './test/data/40-gerber-kicad-in.gbr' ),
			as,
			oFormat
		);

		assert.deepStrictEqual( gf.getBounds( 'metric' ), [ 'metric', -91.113, 148.901, -118.859, 91.155 ] );

		done();

	} );

	it( "should find imperial boundaries of a given file", ( done ) => {

		let as = new ApertureStore( oFormat );

		let gf = new GerberReader(
			'altium',
			fs.readFileSync( './test/data/40-gerber-kicad-in.gbr' ),
			as,
			oFormat
		);

		assert.deepStrictEqual( gf.getBounds( 'imperial' ), [ 'imperial', -3.5871259842519687, 5.862244094488189, -4.679488188976378, 3.5887795275590553 ] );

		done();

	} );

	it( "should reject files violating boundaries", ( done ) => {

		let as = new ApertureStore( oFormat );

		try {
			let gf = new GerberReader(
				'altium',
				fs.readFileSync( './test/data/40-gerber-kicad-in.gbr' ),
				as,
				oFormat,
				[ 'metric', -91.114, 148.901, -118.859, 91.155 ]
			);
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( "should read Gerber file and move all points", ( done ) => {

		let gf = new GerberReader(
			'altium',
			fs.readFileSync( './test/data/40-gerber-altium-in.gbr' ),
			new ApertureStore( oFormat ),
			oFormat
		);

		assert.strictEqual(
			gf.toString( new PointTransformation( 'metric', { 'x': [ '+', 1 ], 'y': [ '+', 1 ] } ) ),
			fs.readFileSync( './test/data/40-gerber-altium-out-moved.gbr' ).toString()
		);

		done();

	} );

} );
