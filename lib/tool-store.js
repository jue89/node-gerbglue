'use strict';

const Format = require( './format.js' );
const Point = require( './point.js' );

class Tool extends Point {

	constructor( diameter, srcFormat, dstFormat ) {

		// Obtain parameters
		let values = {};
		values.c = diameter;

		super( values, srcFormat, dstFormat );

	}

	toString() {
		return `C${this.get().c}`;
	}

}


class ToolStore {

	constructor( dstFormat ) {

		// Convert format. We just need to unit.
		// Tools are always floating-point
		dstFormat = new Format( {
			type: 'string',
			unit: dstFormat.unit,
			point: 'floating',
			precisionPost: 3
		} );

		this._dstFormat = dstFormat;
		this._tools = [];
		this._dict = {};

	}

	add( localToolID, diameter, job, srcFormat ) {

		// Convert format. We just need to unit.
		// Tools are always floating-point
		srcFormat = new Format( {
			type: 'string',
			unit: srcFormat.unit,
			point: 'floating',
			precisionPost: 6
		} );

		// Create instance
		let obj = new Tool( diameter, srcFormat, this._dstFormat );
		let tmp = { obj: obj, str: obj.toString() };

		// Look in the list, maybe we have something matching
		let globalToolID;
		for( let a in this._tools ) {
			if( this._tools[a].str == tmp.str ) {
				globalToolID = parseInt( a ) + 1;
				break;
			}
		}

		// If we haven't found one, just create one
		if( ! globalToolID ) {
			globalToolID = this._tools.length + 1;
			this._tools.push( tmp );
		}

		// Create link
		if( this._dict[ job ] === undefined ) this._dict[ job ] = {};
		this._dict[ job ][ parseInt( localToolID ) ] = globalToolID.toString();

	}

	lookup( job, localToolID ) {

		// Just lookup the global tool id
		let a = this._dict[ job ][ parseInt( localToolID ) ];

		if( a === undefined ) {
			throw new Error( "Unknown tool: " + localToolID );
		}

		return a;

	}

	toString() {

		let tmp = [];

		for( let a in this._tools ) {
			let globalToolID = parseInt( a ) + 1;
			tmp.push( `T${globalToolID.toString()}${this._tools[a].str}` );
		}

		return tmp.join( "\n" );

	}

}

module.exports = ToolStore;
