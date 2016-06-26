'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );

describe( "Class ExcellonWriter", () => {

	const Format = require( '../lib/format.js' );
	const ToolStore = require( '../lib/tool-store.js' );
	const ExcellonReader = require( '../lib/excellon-in.js' );
	const ExcellonWriter = require( '../lib/excellon-out.js' );

	const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 2, precisionPost: 4 } );

	it( "should read and then write file back", ( done ) => {

		let ts = new ToolStore( oFormat );

		let iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3 } );
		let kicad = new ExcellonReader( 'kicad', fs.readFileSync( './test/data/71-excellon-in-kicad.drl' ), ts, iFormat, oFormat );

		let ew = new ExcellonWriter( 'kicad-out', oFormat, ts, 'Kicad Test File' );
		ew.addExcellon( kicad.toString() );

		assert.strictEqual( ew.toString(), fs.readFileSync( './test/data/71-excellon-out-kicad.drl' ).toString() );

		done();

	} );

	it( "should read two files and then write them combined back", ( done ) => {

		let ts = new ToolStore( oFormat );

		let i1Format = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3 } );
		let i2Format = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 4 } );
		let kicad = new ExcellonReader( 'kicad', fs.readFileSync( './test/data/71-excellon-in-kicad.drl' ), ts, i1Format, oFormat );
		let altium = new ExcellonReader( 'altium', fs.readFileSync( './test/data/71-excellon-in-altium.drl' ), ts, i2Format, oFormat );

		let ew = new ExcellonWriter( 'combined-out', oFormat, ts, 'Kicad Test File' );
		ew.addExcellon( kicad.toString() );
		ew.addExcellon( altium.toString() );

		assert.strictEqual( ew.toString(), fs.readFileSync( './test/data/71-excellon-out-combined.drl' ).toString() );

		done();

	} );

} );
