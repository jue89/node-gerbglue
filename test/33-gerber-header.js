'use strict';

const assert = require( 'assert' );

describe( "Class GerberHeader", () => {

	const Format = require( '../lib/format.js' );
	const GerberHeaderReader = require( '../lib/gerber-header.js' );

	const dataFS = "%FSLAX46Y46*%";
	const dataMO = "%MOMM*%";
	const dataFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

	it( "should reject bullshit", ( done ) => {

		let gh = new GerberHeaderReader();

		assert.strictEqual( gh.fromLine( "BLA" ), null );

		done();

	} );

	it( "should read FS line and return true", ( done ) => {

		let gh = new GerberHeaderReader();

		assert.strictEqual( gh.fromLine( dataFS ), true );

		done();

	} );

	it( "should read MO line and return true", ( done ) => {

		let gh = new GerberHeaderReader();

		assert.strictEqual( gh.fromLine( dataMO ), true );

		done();

	} );

	it( "should read FS and MO line and return the format", ( done ) => {

		let gh = new GerberHeaderReader();

		assert.strictEqual( gh.fromLine( dataFS ), true );
		assert.deepStrictEqual( gh.fromLine( dataMO ), dataFormat );

		done();

	} );

} );

