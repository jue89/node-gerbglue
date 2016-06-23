'use strict';

const assert = require( 'assert' );

describe( "Class PointTransformation", () => {

	const PointTransformation = require( '../lib/point-transformation.js' );

	it( "should complain about missing unit", ( done ) => {
		try {

			let t = new PointTransformation( );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong unit", ( done ) => {
		try {

			let t = new PointTransformation( 'bla' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about missing operations", ( done ) => {
		try {

			let t = new PointTransformation( 'metric' );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong type of operations", ( done ) => {
		try {

			let t = new PointTransformation( 'metric', true );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about wrong operation items", ( done ) => {
		try {

			let t = new PointTransformation( 'metric', { 'a': true } );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about odd number of operation items", ( done ) => {
		try {

			let t = new PointTransformation( 'metric', { 'a': [ '+' ] } );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about unknown operation char", ( done ) => {
		try {

			let t = new PointTransformation( 'metric', { 'a': [ '?', 12 ] } );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should complain about non-interpretable number", ( done ) => {
		try {

			let t = new PointTransformation( 'metric', { 'a': [ '+', true ] } );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should generate metric transformation functions", ( done ) => {

		let t = new PointTransformation( 'metric', {
			'a': [ '+', 2.54, '*', 2 ],
			'b': [ '-', 2.54, '/', -2 ],
		} );

		assert.strictEqual( t.a.imperial( 0.1 ), 0.4 );
		assert.strictEqual( t.b.imperial( 0.2 ), -0.05 );

		assert.strictEqual( t.a.metric( 1 ), 7.08 );
		assert.strictEqual( t.b.metric( 2 ), 0.27 );

		done();

	} );

	it( "should generate imperial transformation functions", ( done ) => {

		let t = new PointTransformation( 'imperial', {
			'a': [ '+', 0.1, '*', 2 ],
			'b': [ '-', 0.1, '/', -2 ],
		} );

		assert.strictEqual( t.a.metric( 2.54 ), 10.16 );
		assert.strictEqual( t.b.metric( 2.54 ), 0 );

		assert.strictEqual( t.a.imperial( 0.1 ), 0.4 );
		assert.strictEqual( t.b.imperial( 0.2 ), -0.05 );

		done();

	} );

} );
