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
				seperation: 'scoring'
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
					seperation: 'scoring'
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
				seperation: 'scoring'
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

	it( "should read PCBs", ( done ) => {

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
				seperation: 'scoring'
			}
		} );

		p.addPCB( 'pcb1', {
			dir: './test/data',
			padding: [ 0, 0, 0, 0 ],
			layers: {
				'l1': { file: '80-panel-l1.gbr' },
				'l2': { file: '80-panel-l2.drl', format: { unit: 'metric', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } }
			}
		} );

		p.addPCB( 'pcb2', {
			dir: './test/data',
			padding: [ 0, 0, 0, 0 ],
			layers: {
				'l1': { file: '80-panel-l1.gbr' },
				'l2': { file: '80-panel-l2.drl', format: { unit: 'metric', precisionPre: 3, precisionPost: 3, zeroSupression: 'leading' } }
			}
		} );

		p._pcbs['pcb1'].place( {x:0,y:0} );

		p._pcbs['pcb1'].place( {x:0,y:30} );

		fs.writeFileSync( './test/data/80-panel-out-l2.drl', p._layers.l2.writer.toString() );

		done();

	} );

} );
