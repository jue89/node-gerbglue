'use strict';

const assert = require( 'assert' );

describe( "Class GerberAperture", () => {

	const GerberApertureReader = require( '../lib/gerber-aperture.js' );

	class ApertureStore {
		lookup( job, aperture ) { return ( parseInt( aperture ) + parseInt( job ) ).toString(); }
	}

	it( "should convert aperture selection", ( done ) => {

		const input  = [ "D10*", "D11*", "D12*" ];
		const output = [ "D12*", "D13*", "D14*" ];

		let ar = new GerberApertureReader( new ApertureStore(), '2' );

		for( let i in input ) {
			let ap = ar.fromLine( input[i] );
			assert.strictEqual( ap.toString(), output[i] );
		}

		done();

	} );

} );

