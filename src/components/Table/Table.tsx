import faker from 'faker';
import React, { Dispatch, useEffect, useState } from 'react';
import { connect } from 'react-redux';
//import logo from './logo.svg';
import actions from '../../store/actions/index';
import DataElement from '../../store/interfaces/DataElement';
import StoreState from '../../store/interfaces/StoreState';
import SingleDataElement from '../SingleDataElement';
import './table.sass';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, VariableSizeList } from 'react-window';

interface TableProps {
	tableData: DataElement[];
	setData: Function;
	height: number;
	width: number;
}

function Table(props: TableProps): JSX.Element {
	const [enabledVirtualization, setVirtualizationStatus] = useState(true);
	const generateMockData = (count: number): DataElement[] => {
		const data: DataElement[] = [];

		for (let i = 0; i < count; i += 1) {
			data.push({
				firstName: faker.name.findName(),
				lastName: faker.name.lastName(),
				age: faker.random.number(80),
				d1: false,
				d2: false,
				d3: false,
				d4: false,
			});
		}

		return data;
	};

	useEffect(() => {
		props.setData(generateMockData(1000));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.setData]);

	const listItemRenderer = ({ index, style }: any) => (
		<div style={style}>
			{props.tableData[index] ? <SingleDataElement item={props.tableData[index]} /> : null}
		</div>
	);

	return (
		<React.Fragment>
			<div className="virtualization">
				{enabledVirtualization ? (
					<button
						onClick={() => {
							setVirtualizationStatus(false);
						}}>
						Disable virtualization
					</button>
				) : (
					<button
						onClick={() => {
							setVirtualizationStatus(true);
						}}>
						Enable virtualization
					</button>
				)}
			</div>
			<div
				className="table"
				style={{
					maxHeight: props.height + 'px',
					maxWidth: props.width + 'px',
				}}>
				{enabledVirtualization ? (
					<FixedSizeList
						className="List"
						itemCount={props.tableData.length}
						itemSize={45}
						width={props.width}
						height={props.height}>
						{listItemRenderer}
					</FixedSizeList>
				) : (
					<>{}</>
				)}
			</div>
		</React.Fragment>
	);
}

const mapStateToProps = (state: StoreState) => {
	return {
		tableData: state.main.data,
	};
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
	return {
		setData: (newData: DataElement[]) => dispatch(actions.mainActions.setData(newData)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Table);
