'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );

describe( "Class Gerber", () => {

	const Format = require( '../lib/format.js' );
	const ApertureStore = require( '../lib/aperture-store.js' );
	const GerberReader = require( '../lib/gerber.js' );

	const oFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

	it( "should read Atium Gerber files", ( done ) => {

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
console.log(as.toString());
		assert.strictEqual( gf.toString(), fs.readFileSync( './test/data/40-gerber-kicad-out.gbr' ).toString() );

		done();

	} );

} );
