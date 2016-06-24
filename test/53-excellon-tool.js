'use strict';

const assert = require( 'assert' );

describe( "Class ExcellonTool", () => {

	const ExcellonToolReader = require( '../lib/excellon-tool.js' );

	class ToolStore {
		lookup( job, tool ) { return ( parseInt( tool ) + parseInt( job ) ).toString(); }
	}

	it( "should convert tool selection", ( done ) => {

		const input  = [ "T1", "T2", "T03" ];
		const output = [ "T3", "T4", "T5" ];

		let tr = new ExcellonToolReader( new ToolStore(), '2' );

		for( let i in input ) {
			let tl = tr.fromLine( input[i] );
			assert.strictEqual( tl.toString(), output[i] );
		}

		done();

	} );

} );
