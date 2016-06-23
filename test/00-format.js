'use strict';

const assert = require( 'assert' );

describe( "Class Format", () => {

	let Format = require( '../lib/format.js' );

	it( "should complain about bullshit parameter", ( done ) => {
		try {

			let format = new Format( true );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing type", ( done ) => {
		try {

			let format = new Format( {} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing unit", ( done ) => {
		try {

			let format = new Format( {
				type: 'string'
			} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing point", ( done ) => {
		try {

			let format = new Format( {
				type: 'string',
				unit: 'metric'
			} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing precisionPost", ( done ) => {
		try {

			let format = new Format( {
				type: 'string',
				unit: 'metric',
				point: 'fixed'
			} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should not complain about missing precisionPost if point is 'floating' and type is 'number'", ( done ) => {

		let format = new Format( {
			type: 'number',
			unit: 'metric',
			point: 'floating'
		} );

		done();

	} );

	it( "should complain about missing precisionPre if type is 'string' and point is 'fixed'", ( done ) => {
		try {

			let format = new Format( {
				type: 'string',
				unit: 'metric',
				point: 'fixed',
				precisionPost: 3
			} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about unknown properties", ( done ) => {
		try {

			let format = new Format( {
				type: 'string',
				unit: 'metric',
				point: 'floating',
				precisionPost: 3,
				unknown: true
			} );

		} catch( e ) { /*console.log(e);*/ done(); }

	} );

	it( "should bypass everything if the schema test passed", ( done ) => {

		let f = {
			type: 'number',
			unit: 'metric',
			point: 'floating',
			precisionPost: 3
		};

		let format = new Format( f );

		assert.strictEqual( format.type, f.type );
		assert.strictEqual( format.unit, f.unit );
		assert.strictEqual( format.point, f.point );
		assert.strictEqual( format.precisionPost, f.precisionPost );
		done();

	} );


} );
