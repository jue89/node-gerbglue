'use strict';

const assert = require( 'assert' );

const data = [ "G01*", "G36*", "G37*" ];

describe( "Class GerberMode", () => {

	const GerberMode = require( '../lib/gerber-mode.js' ).GerberMode;
	const GerberModeRE = require( '../lib/gerber-mode.js' ).GerberModeRE;

	it( "should bypass mode selection", ( done ) => {

		for( let i in data ) {
			let re = GerberModeRE.exec( data[i] );
			let md = new GerberMode( re );
			assert.strictEqual( md.toString(), data[i] );
		}

		done();

	} );

} );
