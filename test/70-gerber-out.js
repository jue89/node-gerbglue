'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );

describe( "Class GerberWriter", () => {

	const Format = require( '../lib/format.js' );
	const ApertureStore = require( '../lib/aperture-store.js' );
	const GerberReader = require( '../lib/gerber-in.js' );
	const GerberWriter = require( '../lib/gerber-out.js' );

	const oFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

	it( "should read and then write file back", ( done ) => {

		let as = new ApertureStore( oFormat );

		let kicad = new GerberReader( 'kicad', fs.readFileSync( './test/data/70-gerber-in-kicad.gbr' ), as, oFormat );

		let gw = new GerberWriter( 'kicad-out', oFormat, as, 'Kicad Test File' );
		gw.addGerber( kicad.toString() );

		assert.strictEqual( gw.toString(), fs.readFileSync( './test/data/70-gerber-out-kicad.gbr' ).toString() );

		done();

	} );

	it( "should read two files and then write them combined back", ( done ) => {

		let as = new ApertureStore( oFormat );

		let kicad = new GerberReader( 'kicad', fs.readFileSync( './test/data/70-gerber-in-kicad.gbr' ), as, oFormat );
		let altium = new GerberReader( 'altium', fs.readFileSync( './test/data/70-gerber-in-altium.gbr' ), as, oFormat );

		let gw = new GerberWriter( 'combined-out', oFormat, as, 'Kicad Test File' );
		gw.addGerber( kicad.toString() );
		gw.addGerber( altium.toString() );

		assert.strictEqual( gw.toString(), fs.readFileSync( './test/data/70-gerber-out-combined.gbr' ).toString() );

		done();

	} );

	it( "should create a new file with some lines", ( done ) => {

		let as = new ApertureStore( oFormat );

		let gw = new GerberWriter( 'line', oFormat, as, 'Kicad Test File' );

		gw.addPolygon( 'imperial', [
			{ x: 0, y: 0 },
			{ x: 1, y: 1 }
		] );
		gw.addPolygon( 'imperial', [
			{ x: 1, y: 0 },
			{ x: 2, y: 1 }
		] );

		fs.writeFileSync( './test/data/70-gerber-out-line.gbr', gw.toString() );
		assert.strictEqual( gw.toString(), fs.readFileSync( './test/data/70-gerber-out-line.gbr' ).toString() );

		done();

	} );

	it( "should create a new file with a rectangle", ( done ) => {

		let as = new ApertureStore( oFormat );

		let gw = new GerberWriter( 'line', oFormat, as, 'Kicad Test File' );

		gw.addPolygon( 'imperial', [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 }
		] );

		assert.strictEqual( gw.toString(), fs.readFileSync( './test/data/70-gerber-out-poly.gbr' ).toString() );

		done();

	} );

} );
