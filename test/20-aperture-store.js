'use strict';

const assert = require( 'assert' );

describe( "Class ApertureStore", () => {

	const Format = require( '../lib/format.js' );
	const ApertureStore = require( '../lib/aperture-store.js' );
	const GerberApertureAddReader = require( '../lib/gerber-aperture-add.js' );

	it( 'should read metric apertures and convert them to imperial system', ( done ) => {

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

		const input = [
			'%ADD10C,0.100000*%',
			'%ADD11C,0.150000X0.100000*%',
			'%ADD12R,2.286000X2.286000*%',
			'%ADD13O,2.286000X2.286000*%',
			'%ADD14O,2.286000X2.286000X0.100000*%',
			'%ADD15C,6.654000*%',
			'%ADD16C,2.654000*%',
			'%ADD17C,2.554000*%',
			'%ADD18R,1.504000X1.254000*%',
			'%ADD19R,1.154000X1.954000X0.100000*%',
			'%ADD20R,2.082800X1.270000*%',
			'%ADD21R,1.270000X2.082800*%'
		];

		const output = [
			'%ADD10C,0.003937*%',
			'%ADD11C,0.005906X0.003937*%',
			'%ADD12R,0.090000X0.090000*%',
			'%ADD13O,0.090000X0.090000*%',
			'%ADD14O,0.090000X0.090000X0.003937*%',
			'%ADD15C,0.261969*%',
			'%ADD16C,0.104488*%',
			'%ADD17C,0.100551*%',
			'%ADD18R,0.059213X0.049370*%',
			'%ADD19R,0.045433X0.076929X0.003937*%',
			'%ADD20R,0.082000X0.050000*%',
			'%ADD21R,0.050000X0.082000*%'
		].join( "\n" );

		let as = new ApertureStore( oFormat );

		let ad = new GerberApertureAddReader( as, '1', iFormat );

		for( let i in input ) {
			if( ! ad.fromLine( input[ i ] ) ) return done( new Error( "Does not match: " + input[i] ) );
		}

		assert.strictEqual( as.toString(), output );

		done();

	} );

	it( 'should read metric apertures from one job and imperial apertures from another job and merge / convert them to imperial system', ( done ) => {

		const i1Format = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const i2Format = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

		const input1 = [
			'%ADD10C,0.100000*%',
			'%ADD11C,0.150000X0.100000*%',
			'%ADD12R,2.286000X2.286000*%',
			'%ADD13O,2.286000X2.286000*%',
			'%ADD14O,2.286000X2.286000X0.100000*%',
			'%ADD15C,6.654000*%',
			'%ADD16C,2.654000*%',
			'%ADD17C,2.554000*%',
			'%ADD18R,1.504000X1.254000*%',
			'%ADD19R,1.154000X1.954000X0.100000*%',
			'%ADD20R,2.082800X1.270000*%',
			'%ADD21R,1.270000X2.082800*%'
		];

		const input2 = [
			'%ADD20C,0.003937*%',
			'%ADD21C,0.005906X0.003937*%',
			'%ADD22R,0.090000X0.090000*%',
			'%ADD23O,0.090000X0.090000*%',
			'%ADD24O,0.090000X0.090000X0.003937*%',
			'%ADD25C,0.261969*%',
			'%ADD26C,0.104488*%',
			'%ADD27C,0.100551*%',
			'%ADD28R,0.059213X0.049370*%',
			'%ADD29R,0.045433X0.076929X0.003937*%',
			'%ADD30R,0.082000X0.050000*%',
			'%ADD31R,0.050000X0.082000*%'
		];

		const output = [
			'%ADD10C,0.003937*%',
			'%ADD11C,0.005906X0.003937*%',
			'%ADD12R,0.090000X0.090000*%',
			'%ADD13O,0.090000X0.090000*%',
			'%ADD14O,0.090000X0.090000X0.003937*%',
			'%ADD15C,0.261969*%',
			'%ADD16C,0.104488*%',
			'%ADD17C,0.100551*%',
			'%ADD18R,0.059213X0.049370*%',
			'%ADD19R,0.045433X0.076929X0.003937*%',
			'%ADD20R,0.082000X0.050000*%',
			'%ADD21R,0.050000X0.082000*%'
		].join( "\n" );

		let as = new ApertureStore( oFormat );

		let ad1 = new GerberApertureAddReader( as, '1', i1Format );
		for( let i in input1 ) {
			if( ! ad1.fromLine( input1[ i ] ) ) return done( new Error( "Does not match: " + input1[i] ) );
		}

		let ad2 = new GerberApertureAddReader( as, '2', i2Format );
		for( let i in input2 ) {
			if( ! ad2.fromLine( input2[ i ] ) ) return done( new Error( "Does not match: " + input2[i] ) );
		}

		assert.strictEqual( as.toString(), output );

		done();

	} );

	it( 'should complain about unknown aperture id at lookup', ( done ) => {

		const iFormat = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

		const input = [
			'%ADD10C,0.100000*%',
			'%ADD11C,0.150000X0.100000*%',
			'%ADD12R,2.286000X2.286000*%',
			'%ADD13O,2.286000X2.286000*%',
			'%ADD14O,2.286000X2.286000X0.100000*%',
			'%ADD15C,6.654000*%',
			'%ADD16C,2.654000*%',
			'%ADD17C,2.554000*%',
			'%ADD18R,1.504000X1.254000*%',
			'%ADD19R,1.154000X1.954000X0.100000*%',
			'%ADD20R,2.082800X1.270000*%',
			'%ADD21R,1.270000X2.082800*%'
		];

		let as = new ApertureStore( oFormat );

		let ad = new GerberApertureAddReader( as, '1', iFormat );

		for( let i in input ) {
			if( ! ad.fromLine( input[ i ] ) ) return done( new Error( "Does not match: " + input[i] ) );
		}

		try {

			as.lookup( '1', '22' );

		} catch( e ) { /*console.log(e);*/ done(); }

	} );

	it( 'should read metric apertures from one job and imperial apertures from another job, cluster them and then give the right lookup', ( done ) => {

		const i1Format = new Format( { type: 'string', unit: 'metric', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const i2Format = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );
		const oFormat = new Format( { type: 'string', unit: 'imperial', point: 'fixed', precisionPre: 4, precisionPost: 6 } );

		const input1 = [
			'%ADD10C,0.100000*%',
			'%ADD11C,0.150000X0.100000*%',
			'%ADD12R,2.286000X2.286000*%',
			'%ADD13O,2.286000X2.286000*%',
			'%ADD14O,2.286000X2.286000X0.100000*%',
			'%ADD15C,6.654000*%',
			'%ADD16C,2.654000*%',
			'%ADD17C,2.554000*%',
			'%ADD18R,1.504000X1.254000*%',
			'%ADD19R,1.154000X1.954000X0.100000*%',
			'%ADD20R,2.082800X1.270000*%',
			'%ADD21R,1.270000X2.082800*%'
		];

		const input2 = [
			'%ADD20C,0.003937*%',
			'%ADD21C,0.005906X0.003937*%',
			'%ADD22R,0.090000X0.090000*%',
			'%ADD23O,0.090000X0.090000*%',
			'%ADD24O,0.090000X0.090000X0.003937*%',
			'%ADD25C,0.261969*%',
			'%ADD26C,0.104488*%',
			'%ADD27C,0.100551*%',
			'%ADD28R,0.059213X0.049370*%',
			'%ADD29R,0.045433X0.076929X0.003937*%',
			'%ADD30R,0.082000X0.050000*%',
			'%ADD31R,0.050000X0.082000*%'
		];

		const input1lookup = {
			'10': '10',
			'11': '11',
			'12': '12',
			'13': '13',
			'14': '14',
			'15': '15',
			'16': '16',
			'17': '17',
			'18': '18',
			'19': '19',
			'20': '20',
			'21': '21'
		};

		const input2lookup = {
			'20': '10',
			'21': '11',
			'22': '12',
			'23': '13',
			'24': '14',
			'25': '15',
			'26': '16',
			'27': '17',
			'28': '18',
			'29': '19',
			'30': '20',
			'31': '21'
		};

		let as = new ApertureStore( oFormat );

		let ad1 = new GerberApertureAddReader( as, '1', i1Format );
		for( let i in input1 ) {
			if( ! ad1.fromLine( input1[ i ] ) ) return done( new Error( "Does not match: " + input1[i] ) );
		}

		let ad2 = new GerberApertureAddReader( as, '2', i2Format );
		for( let i in input2 ) {
			if( ! ad2.fromLine( input2[ i ] ) ) return done( new Error( "Does not match: " + input2[i] ) );
		}

		for( let i in input1lookup ) {
			assert.strictEqual( as.lookup( '1', i ), input1lookup[ i ] );
		}

		for( let i in input2lookup ) {
			assert.strictEqual( as.lookup( '2', i ), input2lookup[ i ] );
		}

		done();


	} );

} );
