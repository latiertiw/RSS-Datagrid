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
import { generateMockData } from '../utils';
import { render } from '@testing-library/react';
import * as lodash from 'lodash';
import { strict } from 'assert';

interface TableProps {
	tableData: DataElement[];
	setData: Function;
	height: number;
	width: number;
}

function Table(props: TableProps): JSX.Element {
	const [headerOffset, setHeaderOffset] = useState(0);
	const [size, setSize] = useState(0);
	const [enabledVirtualization, setVirtualizationStatus] = useState(true);
	const [enableCheckboxes, setEnableCheckboxesStatus] = useState(false);
	const [enabledCheckboxes, setEnabledCheckboxes] = useState(new Set<number>());
	const [enabledColumns, setEnabledColumns] = useState(new Set<number>());
	const [deletedColumns, setDeletedColumns] = useState(new Set<number>());

	const [onlyTrueFilter, setOnlyTrueFilter] = useState(false);
	const [sortingUpColumns, setsortingUpColumns] = useState(new Set<string>());
	const [sortingDownColumns, setsortingDownColumns] = useState(new Set<string>());

	let isShift = false;
	document.onkeydown = (e: any) => {
		if (e.key == 'Shift') isShift = true;
	};

	document.onkeyup = (e: any) => {
		if (e.key == 'Shift') isShift = false;
	};

	useEffect(() => {
		const newData = generateMockData(10);
		props.setData(newData);

		const columnsNames: string[] = [];
		for (const key in newData[0]) {
			columnsNames.push(key);
		}

		setSize(columnsNames.length);

		const setc = new Set<number>();
		for (let i = 0; i < columnsNames.length; i += 1) {
			setc.add(i);
		}
		setEnabledColumns(setc);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getSortedData = (): DataElement[] => {
		const unsorted: DataElement[] = props.tableData;
		let sorted: DataElement[] = [];

		const colCount = sortingUpColumns.size + sortingDownColumns.size;
		if (colCount == 0) {
			return unsorted;
		}
		if (colCount == 1) {
			let col = '';
			if (sortingUpColumns.size > 0) {
				col = sortingUpColumns.values().next().value;
				console.log(col);
				sorted = lodash.sortBy(unsorted, item => {
					return item[col];
				});
			}
			if (sortingDownColumns.size > 0) {
				col = sortingDownColumns.values().next().value;
				//console.log(col);
				sorted = lodash.sortBy(unsorted, item => {
					return item[col];
				});
				sorted = lodash.reverse(sorted);
			}
			return sorted;
		}
		if (colCount >= 2) {
			const sortingsUp: any = [];
			const sortingsDown: any = [];

			const sUp = sortingUpColumns.values();
			const sDown = sortingDownColumns.values();
			while (true) {
				const value = sUp.next();
				if (value.done == true) break;
				sortingsUp.push(value.value);
			}
			while (true) {
				const value = sDown.next();
				if (value.done == true) break;
				sortingsDown.push(value.value);
			}

			return unsorted.sort((a, b) => {
				try {
					for (let i = 0; i < sortingsUp.length; i += 1) {
						const colname = sortingsUp[i];
						let res;
						if (typeof a[colname] == 'string')
							res = a[colname].localeCompare(b[colname]);
						else res = a[colname] - b[colname];
						if (res != 0) return res;
					}

					for (let i = 0; i < sortingsDown.length; i += 1) {
						const colname = sortingsDown[i];
						let res;
						if (typeof a[colname] == 'string')
							res = a[colname].localeCompare(b[colname]);
						else res = a[colname] - b[colname];
						if (res != 0) return res;
					}
				} catch (e) {
					console.log('err');
					return 0;
				}

				return 0;
			});
		}
		return sorted;
	};

	const getHeaders = (item: DataElement): any => {
		const tdata = props.tableData[0];
		console.log(typeof tdata['work']);
		const columnsNames: string[] = [];
		const columns: JSX.Element[] = [];
		for (const key in item) {
			columnsNames.push(key);
		}

		for (let i = 0; i < columnsNames.length; i += 1) {
			const columnType = typeof tdata[columnsNames[i]];
			const name = columnsNames[i];
			enabledColumns.has(i) &&
				!deletedColumns.has(i) &&
				columns.push(
					<div
						key={Math.random() + item.lastName + item.firstName + item.age}
						className={'sortings__element'}>
						{
							<div>
								{columnType == 'boolean' ? (
									<div>
										Only true
										<input
											type="checkbox"
											onClick={() => {
												onlyTrueFilter
													? setOnlyTrueFilter(false)
													: setOnlyTrueFilter(true);
											}}
											checked={onlyTrueFilter}
										/>
									</div>
								) : (
									''
								)}
								{(columnType == 'string' || columnType == 'number') && (
									<div>
										{!sortingUpColumns.has(name) &&
											!sortingDownColumns.has(name) && (
												<div
													className="sort"
													onClick={() => {
														const size =
															sortingUpColumns.size +
															sortingDownColumns.size;
														if (size == 0 || (isShift && size < 2)) {
															sortingUpColumns.add(name);
															setsortingUpColumns(
																new Set(sortingUpColumns)
															);
														} else {
															console.log('kek');
														}
													}}>
													-
												</div>
											)}
										{sortingUpColumns.has(name) && (
											<div
												className="sort"
												onClick={() => {
													sortingUpColumns.delete(name);
													sortingDownColumns.add(name);
													setsortingUpColumns(new Set(sortingUpColumns));
												}}>
												Up
											</div>
										)}
										{sortingDownColumns.has(name) && (
											<div
												className="sort"
												onClick={() => {
													sortingDownColumns.delete(name);
													setsortingDownColumns(
														new Set(sortingDownColumns)
													);
												}}>
												Down
											</div>
										)}
									</div>
								)}
							</div>
						}

						<span style={{ margin: '5px' }}>{columnsNames[i]}</span>
						{enableCheckboxes && i !== 0 && (
							<span>
								<input
									onChange={e => {
										console.log(e);
									}}
									onClick={() => {
										if (enabledCheckboxes.has(i)) {
											enabledCheckboxes.delete(i);
										} else {
											enabledCheckboxes.add(i);
										}
										if (enabledCheckboxes.size == 0) disableCheckboxes();
										setEnabledCheckboxes(new Set(enabledCheckboxes));
									}}
									type="checkbox"
									checked={enabledCheckboxes.has(i) ? true : false}
								/>
							</span>
						)}
					</div>
				);
		}
		return columns;
	};

	const getSwitchers = (item: DataElement): any => {
		const columnsNames: string[] = [];
		for (const key in item) {
			columnsNames.push(key);
		}

		return columnsNames.map((item, i) => {
			return (
				i != 0 &&
				!deletedColumns.has(i) && (
					<div>
						{item}:{' '}
						<input
							onChange={e => {
								console.log(e);
							}}
							onClick={() => {
								if (enabledColumns.has(i)) {
									enabledColumns.delete(i);
								} else {
									enabledColumns.add(i);
								}
								//if (enabledColumns.size == 0) disableCheckboxes();
								setSize(enabledColumns.size);
								setEnabledColumns(new Set(enabledColumns));
							}}
							type="checkbox"
							checked={enabledColumns.has(i) ? true : false}
						/>
					</div>
				)
			);
		});
	};

	const disableCheckboxes = () => {
		setEnableCheckboxesStatus(false);
		setEnabledCheckboxes(new Set());
	};

	const listItemRenderer = ({ index, style }: any) => {
		const data = getSortedData();
		return index == headerOffset ? (
			<div style={style} className="sortings">
				{getHeaders(props.tableData[0])}
			</div>
		) : (
			<div style={style}>
				{data[index] ? (
					<SingleDataElement
						onSelect={(i: number) => {
							if (enabledCheckboxes.has(i)) {
								enabledCheckboxes.delete(i);
							} else {
								enabledCheckboxes.add(i);
							}
							setEnableCheckboxesStatus(true);
							if (enabledCheckboxes.size == 0) disableCheckboxes();
							setEnabledCheckboxes(new Set(enabledCheckboxes));
						}}
						enabledColumns={enabledColumns}
						deletedColumns={deletedColumns}
						selected={enabledCheckboxes}
						leftProperty="phone"
						item={data[index]}
					/>
				) : null}
			</div>
		);
	};

	const getNonVirtualizedList = (): JSX.Element[] => {
		const mas = props.tableData.map((item: DataElement): any => {
			return (
				<SingleDataElement
					onSelect={(i: number) => {
						if (enabledCheckboxes.has(i)) {
							enabledCheckboxes.delete(i);
						} else {
							enabledCheckboxes.add(i);
						}
						setEnableCheckboxesStatus(true);
						if (enabledCheckboxes.size == 0) disableCheckboxes();
						setEnabledCheckboxes(new Set(enabledCheckboxes));
					}}
					enabledColumns={enabledColumns}
					selected={enabledCheckboxes}
					leftProperty="phone"
					deletedColumns={deletedColumns}
					key={item.firstName + item.lastName}
					item={item}
				/>
			);
		});

		mas.unshift(
			<div key="0" className="sortings">
				{getHeaders(props.tableData[0])}
			</div>
		);
		return mas;
	};

	const getNonVirtualizeButton = (): JSX.Element => {
		return (
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
		);
	};

	const getCheckboxesButton = (): JSX.Element => {
		return (
			<div className="checkboxes">
				{enableCheckboxes ? (
					<button
						onClick={() => {
							disableCheckboxes();
						}}>
						Disable checkboxes
					</button>
				) : (
					<button
						onClick={() => {
							setEnableCheckboxesStatus(true);
						}}>
						Enable checkboxes
					</button>
				)}
			</div>
		);
	};

	const deleteColumns = () => {
		const newDeletedColumns = new Set<number>();

		deletedColumns.forEach(value => {
			newDeletedColumns.add(value);
		});
		enabledCheckboxes.forEach(value => {
			console.log(value);
			newDeletedColumns.add(value);
			setDeletedColumns(newDeletedColumns);
		});
		enabledCheckboxes.clear();
		setEnableCheckboxesStatus(false);
	};

	return (
		<React.Fragment>
			{getNonVirtualizeButton()}
			{getCheckboxesButton()}
			{enableCheckboxes && (
				<div>
					<div>
						<button onClick={deleteColumns}>delete</button>
					</div>
				</div>
			)}
			<div>{getSwitchers(props.tableData[0])}</div>

			<div>
				<div
					className="table"
					style={{
						height: props.height + 'px',
						maxWidth: props.width + 'px',
					}}>
					{enabledVirtualization ? (
						<FixedSizeList
							className="List"
							itemCount={props.tableData.length}
							itemSize={45}
							onScroll={e => {
								const topPos = Math.round(e.scrollOffset / 45);
								if (topPos != headerOffset) {
									console.log(topPos);
									setHeaderOffset(topPos);
								}
							}}
							width={300 + (size - 1 - deletedColumns.size) * 300}
							style={{ maxWidth: props.width + 'px' }}
							height={props.height}>
							{listItemRenderer}
						</FixedSizeList>
					) : (
						<>{getNonVirtualizedList()}</>
					)}
				</div>
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
