'use strict';

const assert = require( 'assert' );

const data = [ "%LPC*%", "%LPD*%" ];

describe( "Class GerberPolarity", () => {

	const GerberPolarityReader = require( '../lib/gerber-polarity.js' );

	it( "should bypass polarity selection", ( done ) => {

		let gm = new GerberPolarityReader();

		for( let i in data ) {
			let po = gm.fromLine( data[i] );
			assert.strictEqual( po.toString(), data[i] );
		}

		done();

	} );

} );
