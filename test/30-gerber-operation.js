'use strict';

const assert = require( 'assert' );

const inData = `X0Y50000D02*
Y100000D01*
X100000D01*
Y0D01*
X0D01*
Y50000D01*
D02*
X-50000Y10000D01*
X-90000Y50000D01*
X-50000Y90000D01*
X0Y50000D01*
X50000Y60000I30000J0D01*`;

const outData = `X0Y197D02*
Y394D01*
X394D01*
Y0D01*
X0D01*
Y197D01*
D02*
Y39D01*
Y197D01*
Y354D01*
X0Y197D01*
X197Y236I118J0D01*`;

describe( "Class GerberOperation", () => {

	const Format = require( '../lib/format.js' );
	const GerberOperationReader = require( '../lib/gerber-operation.js' );

	function testConvert( iFormat, oFormat, input, output ) {

		iFormat = new Format( iFormat );
		oFormat = new Format( oFormat );

		let go = new GerberOperationReader( iFormat, oFormat );

		input = input.split( '\n' );
		output = output.split( '\n' );

		it( `should convert ${iFormat} to ${oFormat}`, ( done ) => {

			for( let i in input ) {
				let op = go.fromLine( input[i] );
				assert.strictEqual( op.toString(), output[i] );
			}

			done();

		} );
	}

	testConvert(
		{ type: 'string', unit: 'metric', point: 'fixed', precisionPre: 2, precisionPost: 4, zeroSupression: 'leading' },
		{ type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 2, precisionPost: 3, zeroSupression: 'leading' },
		inData,
		outData
	);

} );
