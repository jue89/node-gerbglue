'use strict';

const jsonGate = require( 'json-gate' );

const Format = require( './format.js' );
const GerberWriter = require( './gerber-out.js' );
const ExcellonWriter = require( './excellon-out.js' );
const ApertureStore = require( './aperture-store.js' );
const ToolStore = require( './tool-store.js' );
const PCB = require( './pcb.js' );

// Schema for panel definition
const schema = jsonGate.createSchema( {
	type: 'object',
	additionalProperties: false,
	properties: {
		'dir': {
			type: 'string',
			required: true,
		},
		'layers': {
			type: 'object',
			additionalProperties: false,
			required: true,
			patternProperties: {
				'^[0-9a-zA-Z_-]+$': {
					type: 'object',
					additionalProperties: false,
					properties: {
						'desc': {
							type: 'string',
							required: false
						},
						'file': {
							type: 'string',
							required: true
						},
						'type' : {
							enum: [ 'gerber', 'excellon' ],
							required: true
						},
						'mandatory' : {
							type: 'boolean',
							default: true
						},
						'format': {
							type: 'object',
							additionalProperties: false,
							required: true,
							properties: {
								'unit': {
									enum: [ 'metric', 'imperial' ],
									required: true
								},
								'zeroSupression': {
									enum: [ 'none', 'leading', 'trailing' ],
									required: true
								},
								'precisionPre': {
									type: 'number',
									required: false
								},
								'precisionPost': {
									type: 'number',
									required: false
								}
							}
						}
					}
				}
			}
		},
		'outlineLayer': {
			type: 'string',
			required: true
		},
		'configUnit': {
			enum: [ 'metric', 'imperial' ],
			required: true
		},
		'placing': {
			type: 'object',
			required: true,
			properties: {
				'seperation': {
					enum: [ 'scoring' ],
					default: 'scoring'
				}
			}
		}
	}
} );


class Panel {

	constructor( options ) {

		// Test against schema
		if( options === undefined ) options = {};
		schema.validate( options );

		// Process given layers
		this._layers = {};
		for( let name in options.layers ) {

			let l = options.layers[ name ];

			// Create internal layer instance
			let tmp = {};
			tmp.type = l.type;
			tmp.format = new Format( {
				type: 'string',
				point: 'fixed',
				unit: l.format.unit,
				precisionPre: l.format.precisionPre,
				precisionPost: l.format.precisionPost
			} );
			tmp.file = l.file;
			tmp.mandatory = l.mandatory;

			if( l.type == 'gerber' ) {

				tmp.apertureStore = new ApertureStore( tmp.format );
				tmp.writer = new GerberWriter( name, tmp.format, tmp.apertureStore, l.desc );

			} else {

				tmp.toolStore = new ToolStore( tmp.format );
				tmp.writer = new ExcellonWriter( name, tmp.format, tmp.toolStore, l.desc );

			}

			this._layers[ name ] = tmp;

		}

		// Check if outline layer is defined
		if( ! this._layers[ options.outlineLayer ] ) {
			throw new Error( "Specified outlineLayer has not been defined" );
		}
		if( this._layers[ options.outlineLayer ].type != 'gerber' ) {
			throw new Error( "Outline layer must be in Gerber format" );
		}

		this._unit = options.configUnit;
		this._outlineLayer = options.outlineLayer;

		// Store for all defined PCBs
		this._pcbs = {};

		//this._placer = new PlacerScoring( ... );

	}

	addPCB( name, options ) {

		// Make sure the PCB name is unique
		if( this._pcbs[ name ] ) {
			throw new Error( `A PCB named ${name} has already been defined` );
		}

		// Create a PCB instance
		this._pcbs[ name ] = new PCB( name, options, this._layers, this._outlineLayer, this._unit );

	}

	genPanel( placing ) {



	}

}

module.exports = Panel;
