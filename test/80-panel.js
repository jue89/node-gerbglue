'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );

describe( "Class Panel", () => {

	const Panel = require( '../lib/panel.js' );

	it( "should accept minimal option object", ( done ) => {

		let p = new Panel( {
			dir: '.',
			layers: {
				'testLayer': {
					file: 'test.gbr',
					type: 'gerber',
					format: {
						unit: 'metric',
						precisionPre: 4,
						precisionPost: 6,
						zeroSupression: 'leading'
					}
				}
			},
			outlineLayer: 'testLayer',
			configUnit: 'metric',
			placing: {
				seperation: 'scoring',
				scoringLayer: 'testLayer'
			}
		} );

		done();

	} );

	it( "should complain missing outlineLayer definition", ( done ) => {
		try {

			let p = new Panel( {
				dir: '.',
				layers: {
					'testLayer': {
						file: 'test.gbr',
						type: 'gerber',
						format: {
							unit: 'metric',
							precisionPre: 4,
							precisionPost: 6,
							zeroSupression: 'leading'
						}
					}
				},
				outlineLayer: 'bla',
				configUnit: 'metric',
				placing: {
					seperation: 'scoring',
					scoringLayer: 'l1'
				}
			} );

		} catch( e ) { /*console.log(e);*/ done(); }
	} );

	it( "should read PCB data and complain about missing mandatory layer", ( done ) => {

		let p = new Panel( {
			dir: '.',
			layers: {
				'l1': {
					file: 'l1.gbr',
					type: 'gerber',
					format: {
						unit: 'metric',
						precisionPre: 4,
						precisionPost: 6,
						zeroSupression: 'leading'
					}
				},
				'l2': {
					file: 'l2.drl',
					type: 'excellon',
					format: {
						unit: 'imperial',
						precisionPre: 2,
						precisionPost: 4,
						zeroSupression: 'leading'
					}
				}
			},
			outlineLayer: 'l1',
			configUnit: 'metric',
			placing: {
				seperation: 'scoring',
				scoringLayer: 'l1'
			}
		} );

		try {

			p.addPCB( 'pcb1', {
				dir: './test/data',
				layers: {
					'l1': { file: '80-panel-l1.gbr' }
				}
			} )

		} catch( e ) { /*console.log(e);*/ done(); }

	} );

	it( "should read PCBs and combine them to a panel", ( done ) => {

		let p = new Panel( {
			dir: '/tmp',
			layers: {
				'outline': {
					file: 'gerbglue-outline.gbr',
					type: 'gerber',
					format: {
						unit: 'metric',
						precisionPre: 4,
						precisionPost: 6,
						zeroSupression: 'leading'
					}
				},
				'scoring': {
					file: 'gerbglue-scoring.gbr',
					type: 'gerber',
					mandatory: false,
					format: {
						unit: 'metric',
						precisionPre: 4,
						precisionPost: 6,
						zeroSupression: 'leading'
					}
				},
				'top': {
					file: 'gerbglue-top.gbr',
					type: 'gerber',
					format: {
						unit: 'metric',
						precisionPre: 4,
						precisionPost: 6,
						zeroSupression: 'leading'
					}
				},
				'drill': {
					file: 'gerbglue-drill.drl',
					type: 'excellon',
					format: {
						unit: 'imperial',
						precisionPre: 2,
						precisionPost: 4,
						zeroSupression: 'leading'
					}
				}
			},
			outlineLayer: 'outline',
			configUnit: 'metric',
			placing: {
				seperation: 'scoring',
				scoringLayer: 'scoring',
				margin: [ 5, 5, 5, 5 ]
			}
		} );

		p.addPCB( 'pcb1', {
			dir: './test/data',
			padding: [ 0, 0, 0, 0 ],
			layers: {
				'outline': { file: '80-panel-l1.gbr' },
				'top': { file: '80-panel-l1.gbr' },
				'drill': { file: '80-panel-l2.drl', format: { unit: 'metric', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } }
			}
		} );

		p.addPCB( 'pcb2', {
			dir: './test/data',
			padding: [ 1, 1, 1, 1 ],
			layers: {
				'outline': { file: '80-panel-l1.gbr' },
				'top': { file: '80-panel-l1.gbr' },
				'drill': { file: '80-panel-l2.drl', format: { unit: 'metric', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } }
			}
		} );

		p.genPanel( [
			[ 'pcb1', 'pcb2' ],
			[ null, 'pcb1' ],
			[ 'pcb1', null ]
		] );

		done();

	} );

} );
