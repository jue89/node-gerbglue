'use strict';

const assert = require( 'assert' );

const data = [ "G01*", "G36*", "G37*" ];

describe( "Class GerberMode", () => {

	const GerberModeReader = require( '../lib/gerber-mode.js' );

	it( "should bypass mode selection", ( done ) => {

		let gm = new GerberModeReader();

		for( let i in data ) {
			let md = gm.instanceFromLine( data[i] );
			assert.strictEqual( md.toString(), data[i] );
		}

		done();

	} );

} );
