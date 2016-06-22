'use strict';

const assert = require( 'assert' );

describe( "Class GerberAperture", () => {

	const GerberAperture = require( '../lib/gerber-aperture.js' ).GerberAperture;
	const GerberApertureRE = require( '../lib/gerber-aperture.js' ).GerberApertureRE;

	class ApertureStore {
		lookup( job, aperture ) { return ( parseInt( aperture ) + parseInt( job ) ).toString(); }
	}

	it( "should convert aperture selection", ( done ) => {

		const input  = [ "D10*", "D11*", "D12*" ];
		const output = [ "D12*", "D13*", "D14*" ];

		for( let i in input ) {
			let re = GerberApertureRE.exec( input[i] );
			let ap = new GerberAperture( re, new ApertureStore(), '2' );
			assert.strictEqual( ap.toString(), output[i] );
		}

		done();

	} );

} );

