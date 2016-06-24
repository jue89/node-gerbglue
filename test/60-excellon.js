'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );

describe( "Class Excellon", () => {

	const Format = require( '../lib/format.js' );
	const PointTransformation = require( '../lib/point-transformation.js' );
	const ToolStore = require( '../lib/tool-store.js' );
	const ExcellonReader = require( '../lib/excellon.js' );

	const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 2, precisionPost: 4 } );

	it( "should complain about incomplete file", ( done ) => {

		let ts = new ToolStore( oFormat );

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3 } );

		let ef = new ExcellonReader(
			'incomplete',
			fs.readFileSync( './test/data/60-excellon-incomplete.drl' ),
			ts,
			iFormat,
			oFormat
		);

		try {

			ef.toString();

		} catch( e ) { /*console.log(e);*/ done(); }

	} );

	it( "should read Altium Excellon files", ( done ) => {

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 4 } );

		let ef = new ExcellonReader(
			'altium',
			fs.readFileSync( './test/data/60-excellon-altium-in.drl' ),
			new ToolStore( oFormat ),
			iFormat,
			oFormat
		);

		assert.strictEqual( ef.toString(), fs.readFileSync( './test/data/60-excellon-altium-out.drl' ).toString() );

		done();

	} );

	it( "should read KiCad Excellon files", ( done ) => {

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 4 } );

		let ef = new ExcellonReader(
			'altium',
			fs.readFileSync( './test/data/60-excellon-kicad-in.drl' ),
			new ToolStore( oFormat ),
			iFormat,
			oFormat
		);

		assert.strictEqual( ef.toString(), fs.readFileSync( './test/data/60-excellon-kicad-out.drl' ).toString() );

		done();

	} );

	it( "should reject files violating boundaries", ( done ) => {

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3 } );

		try {
			let ef = new ExcellonReader(
				'altium',
				fs.readFileSync( './test/data/60-excellon-kicad-in.drl' ),
				new ToolStore( oFormat ),
				iFormat,
				oFormat,
				[ 'metric', -100.00, 146.19, -116.19, 93.81 ]
			);
		} catch( e ) { /*console.log( e );*/ done(); }

	} );

	it( "should read Excellon file and move all points", ( done ) => {

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 3, precisionPost: 3 } );

		let ef = new ExcellonReader(
			'altium',
			fs.readFileSync( './test/data/60-excellon-move-in.drl' ),
			new ToolStore( oFormat ),
			iFormat,
			oFormat
		);

		assert.strictEqual(
			ef.toString( new PointTransformation( 'imperial', { 'x': [ '+', 1 ], 'y': [ '+', 1 ] } ) ),
			fs.readFileSync( './test/data/60-excellon-move-out.drl' ).toString()
		);

		done();

	} );

} );
