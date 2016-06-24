'use strict';

const assert = require( 'assert' );

describe( "Class ExcellonToolAdd", () => {

	const Format = require( '../lib/format.js' );
	const ToolStore = require( '../lib/tool-store.js' );
	const ExcellonToolAddReader = require( '../lib/excellon-tool-add.js' );

	it( 'should read metric tool sizes and convert them to imperial system', ( done ) => {

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

		const input = [
			'T1C0.300',
			'T2C1.016',
			'T3C1.500',
			'T4C1.600',
			'T5C3.200'
		];

		const output = [
			'T1C0.012',
			'T2C0.040',
			'T3C0.059',
			'T4C0.063',
			'T5C0.126'
		].join( "\n" );

		let ts = new ToolStore( oFormat );

		let ad = new ExcellonToolAddReader( ts, '1', iFormat );

		for( let i in input ) {
			if( ! ad.fromLine( input[ i ] ) ) return done( new Error( "Does not match: " + input[i] ) );
		}

		assert.strictEqual( ts.toString(), output );

		done();

	} );

	it( 'should read metric tool sizes from one job and imperial tool sizes from another job and merge / convert them to imperial system', ( done ) => {

		const i1Format = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const i2Format = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

		const input1 = [
			'T1C0.300',
			'T2C1.016',
			'T3C1.500',
			'T4C1.600',
			'T5C3.200'
		];

		const input2 = [
			'T6C0.011811',
			'T7C0.040000',
			'T8C0.059055',
			'T9C0.062992',
			'T10C0.125984'
		];

		const output = [
			'T1C0.012',
			'T2C0.040',
			'T3C0.059',
			'T4C0.063',
			'T5C0.126'
		].join( "\n" );

		let ts = new ToolStore( oFormat );

		let ad1 = new ExcellonToolAddReader( ts, '1', i1Format );
		for( let i in input1 ) {
			if( ! ad1.fromLine( input1[ i ] ) ) return done( new Error( "Does not match: " + input1[i] ) );
		}

		let ad2 = new ExcellonToolAddReader( ts, '2', i2Format );
		for( let i in input2 ) {
			if( ! ad2.fromLine( input2[ i ] ) ) return done( new Error( "Does not match: " + input2[i] ) );
		}

		assert.strictEqual( ts.toString(), output );

		done();

	} );

	it( 'should read metric toll sizes from one job and imperial toll sizes from another job, cluster them and then give the right lookup', ( done ) => {

		const i1Format = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const i2Format = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

		const input1 = [
			'T01C0.300',
			'T02C1.016',
			'T03C1.500',
			'T04C1.600',
			'T05C3.200'
		];

		const input2 = [
			'T6C0.011811',
			'T7C0.040000',
			'T8C0.059055',
			'T9C0.062992',
			'T10C0.125984'
		];

		const input1lookup = {
			'1': '1',
			'2': '2',
			'3': '3',
			'4': '4',
			'5': '5'
		};

		const input2lookup = {
			'06': '1',
			'07': '2',
			'08': '3',
			'09': '4',
			'10': '5'
		};

		let ts = new ToolStore( oFormat );

		let ad1 = new ExcellonToolAddReader( ts, '1', i1Format );
		for( let i in input1 ) {
			if( ! ad1.fromLine( input1[ i ] ) ) return done( new Error( "Does not match: " + input1[i] ) );
		}

		let ad2 = new ExcellonToolAddReader( ts, '2', i2Format );
		for( let i in input2 ) {
			if( ! ad2.fromLine( input2[ i ] ) ) return done( new Error( "Does not match: " + input2[i] ) );
		}

		for( let i in input1lookup ) {
			assert.strictEqual( ts.lookup( '1', i ), input1lookup[ i ] );
		}

		for( let i in input2lookup ) {
			assert.strictEqual( ts.lookup( '2', i ), input2lookup[ i ] );
		}

		done();

	} );

} );
