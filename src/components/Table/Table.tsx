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
import en from '../../store/interfaces/En';

interface TableProps {
	tableData: DataElement[];
	setData: Function;
	height: number;
	width: number;
}

function Table(props: TableProps): JSX.Element {
	const [headerOffset, setHeaderOffset] = useState(0);
	const [size, setSize] = useState(0);
	const [length, setLength] = useState(0);
	const [enabledVirtualization, setVirtualizationStatus] = useState(true);
	const [enableCheckboxes, setEnableCheckboxesStatus] = useState(false);
	const [enabledCheckboxes, setEnabledCheckboxes] = useState(new Set<number>());
	const [enabledColumns, setEnabledColumns] = useState(new Set<number>());
	const [deletedColumns, setDeletedColumns] = useState(new Set<number>());

	const [onlyTrueFilter, setOnlyTrueFilter] = useState(false);
	const [sortingUpColumns, setsortingUpColumns] = useState(new Set<string>());
	const [sortingDownColumns, setsortingDownColumns] = useState(new Set<string>());

	const [filterField, setFilterField] = useState<string>('');
	const [filterEnum, setFilterEnum] = useState<string>('all');
	const [csv, setCsv] = useState<JSX.Element[]>([]);
	const [fnsData, setFnsData] = useState<DataElement[]>([]);

	let filteredSize = 0;
	let isShift = false;
	document.onkeydown = (e: any) => {
		if (e.key == 'Shift') isShift = true;
	};

	document.onkeyup = (e: any) => {
		if (e.key == 'Shift') isShift = false;
	};

	const loadFilters = () => {
		const virtInfo = localStorage.getItem('enableVirtualization');
		if (virtInfo != undefined) {
			//alert(virtInfo);
			if (virtInfo == 'false') setVirtualizationStatus(false);
			if (virtInfo == 'true') setVirtualizationStatus(true);

			const onlyTrueFilterInfo = localStorage.getItem('onlyTrueFilter');
			if (onlyTrueFilterInfo == 'false') setOnlyTrueFilter(false);
			if (onlyTrueFilterInfo == 'true') setOnlyTrueFilter(true);

			const enableCheckboxesInfo = localStorage.getItem('enableCheckboxes');
			if (enableCheckboxesInfo == 'false') setEnableCheckboxesStatus(false);
			if (enableCheckboxesInfo == 'true') setEnableCheckboxesStatus(true);

			let enabledCheckboxesInfo = '';
			enabledCheckboxesInfo = localStorage.getItem('enabledCheckboxes') || '';
			setEnabledCheckboxes(new Set(JSON.parse(enabledCheckboxesInfo)));

			let enabledColumnsInfo = '';
			if (localStorage.getItem('enabledColumns') != undefined) {
				enabledColumnsInfo = localStorage.getItem('enabledColumns') || '';
				console.log(enabledColumnsInfo);
				setEnabledColumns(new Set(JSON.parse(enabledColumnsInfo)));
			}

			let filterEnumInfo = '';
			if (localStorage.getItem('filterEnum') != undefined) {
				filterEnumInfo = localStorage.getItem('filterEnum') || '';
				setFilterEnum(filterEnumInfo);
			}

			let sortingUpColumnsInfo = '';
			sortingUpColumnsInfo = localStorage.getItem('sortingUpColumns') || '';
			setsortingUpColumns(new Set(JSON.parse(sortingUpColumnsInfo)));

			let sortingDownColumnsInfo = '';
			sortingDownColumnsInfo = localStorage.getItem('sortingDownColumns') || '';
			setsortingDownColumns(new Set(JSON.parse(sortingDownColumnsInfo)));
		}
	};

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem('sortingUpColumns', JSON.stringify(Array.from(sortingUpColumns)));
		}, 100);
	}, [sortingUpColumns]);

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem(
				'sortingDownColumns',
				JSON.stringify(Array.from(sortingDownColumns))
			);
		}, 100);
	}, [sortingDownColumns]);

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem('onlyTrueFilter', onlyTrueFilter + '');
		}, 100);
	}, [onlyTrueFilter]);

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem('enableVirtualization', enabledVirtualization + '');
		}, 100);
	}, [enabledVirtualization]);

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem('enableCheckboxes', enableCheckboxes + '');
		}, 100);
	}, [enableCheckboxes]);

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem(
				'enabledCheckboxes',
				JSON.stringify(Array.from(enabledCheckboxes))
			);
		}, 100);
	}, [enabledCheckboxes]);

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem('enabledColumns', JSON.stringify(Array.from(enabledColumns)));
		}, 100);
	}, [enabledColumns]);

	useEffect(() => {
		setTimeout(() => {
			localStorage.setItem('filterEnum', filterEnum);
		}, 100);
	}, [filterEnum]);

	useEffect(() => {
		loadFilters();
		const newData = generateMockData(1000);
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
		if (localStorage.getItem('enabledColumns') == undefined) setEnabledColumns(setc);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const filterData = (data: any): any => {
		const newData = data.filter((item: DataElement) => {
			let isMatch = false;
			if (item.status != filterEnum && filterEnum != 'all') return false;
			for (const key in item) {
				const value = item[key];
				//console.log(value, typeof value);
				if (typeof value == 'boolean' && onlyTrueFilter == true) {
					//console.log('!!!');
					if (value == false) {
						isMatch = false;

						return false;
					}
					//break;
					//return false;
				}
				if (typeof value != 'number' && typeof value != 'boolean') {
					if (filterField != '') {
						const is = value.toLowerCase().indexOf(filterField.toLowerCase());
						//console.log(is);
						//console.log(value, filterField, is);
						if (is >= 0) {
							isMatch = true;
							break;
						}
					}
				}
			}
			if (filterField == '') return true;
			if (isMatch) return true;
			else return false;
		});

		filteredSize = newData.length;
		return newData;
	};
	const getSortedData = (): DataElement[] => {
		const unsorted: DataElement[] = filterData(props.tableData);
		let sorted: DataElement[] = [];

		const colCount = sortingUpColumns.size + sortingDownColumns.size;
		if (colCount == 0) {
			return unsorted;
		}
		if (colCount == 1) {
			let col = '';
			if (sortingUpColumns.size > 0) {
				col = sortingUpColumns.values().next().value;
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
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const value = sUp.next();
				if (value.done == true) break;
				sortingsUp.push(value.value);
			}
			// eslint-disable-next-line no-constant-condition
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

	const getEnumFilt = () => {
		const m = [];
		for (let i = 0; i < en.length; i += 1) {
			m.push(
				<option key={i} value={en[i]}>
					{en[i]}
				</option>
			);
		}
		return m;
	};

	const getHeaders = (item: DataElement): any => {
		const tdata = props.tableData[0];
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
							<div className="filtell">
								{name == 'status' ? (
									<div>
										<select
											onChange={e => {
												console.log(e);
											}}
											value={filterEnum}
											onInput={e => {
												//console.log(e.currentTarget.value);
												setFilterEnum(e.currentTarget.value);
											}}>
											<option value="all">all</option>
											{getEnumFilt()}
										</select>
									</div>
								) : null}
								{columnType == 'boolean' ? (
									<div>
										Only true
										<input
											onChange={e => {
												console.log(e);
											}}
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
															setsortingUpColumns(
																new Set(sortingUpColumns)
															);
															setsortingDownColumns(
																new Set(sortingDownColumns)
															);
															//console.log('kek');
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
												<p>&#8593;</p>
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
												<p>&#8595;</p>
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
					<div key={i}>
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
		const ind = index == 0 ? 1 : index - 1;
		let isMatch = false;
		const item = data[ind];
		if (filterField == '') isMatch = true;
		for (const key in item) {
			const value = item[key];
			if (typeof value != 'number' && typeof value != 'boolean') {
				if (filterField != '') {
					const is = value.toLowerCase().indexOf(filterField.toLowerCase());
					if (is >= 0) {
						isMatch = true;
					}
				}
			}
		}
		if (isMatch == false) return null;

		const component = (
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
				item={data[ind]}
				allFilter={filterField}
				returnIsMatchFilter={(val: any) => {
					//console.log('');
					//console.log('AAAA');
					//console.log(val);
					//isDeletedByFilter = val;
				}}
			/>
		);

		// const item = data[index];
		// for (const key in item) {
		// 	const isMatchFilter = false;
		// 	const value = item[key];
		// 	if (typeof value == 'string') {
		// 		if (filterField != '') {
		// 			const is = value.toLowerCase().indexOf(filterField.toLowerCase());

		// 			if (is == 0) {
		// 				console.log(is);
		// 				isDeletedByFilter = true;
		// 			}
		// 		}
		// 	}
		// }

		// if (isDeletedByFilter) return null;
		if (props.tableData.length == 0)
			return (
				<div style={style} className="sortings">
					{getHeaders(props.tableData[0])}
				</div>
			);
		return index == headerOffset ? (
			<div style={style} className="sortings">
				{getHeaders(props.tableData[0])}
			</div>
		) : (
			<div style={style}>{data[index] ? component : null}</div>
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
					allFilter={filterField}
					returnIsMatchFilter={(val: any) => {
						console.log('');
						//isDeletedByFilter = val;
					}}
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
			//console.log(value);
			newDeletedColumns.add(value);
			setDeletedColumns(newDeletedColumns);
		});
		enabledCheckboxes.clear();
		setEnableCheckboxesStatus(false);
	};

	const exportToCsv = () => {
		const data = getSortedData();
		const mas = [];
		console.log(fnsData);
		for (let i = 0; i < data.length; i += 1) {
			let str = '';
			if (i == 20) break;
			const item = data[i];
			for (const key in item) {
				str += item[key] + ',';
			}
			str = str.substring(0, str.length - 1);
			mas.push(<p>{str}</p>);
		}
		setCsv(mas);
	};

	return (
		<React.Fragment>
			<div>
				<input
					style={{ margin: '10px' }}
					onInput={e => {
						setFilterField(e.currentTarget.value);
					}}
					placeholder="Filter"
					type="text"
				/>
			</div>
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
							itemCount={props.tableData.length == 0 ? 1 : props.tableData.length}
							itemSize={45}
							onScroll={e => {
								const topPos = Math.round(e.scrollOffset / 45);
								if (topPos != headerOffset) {
									//console.log(topPos);
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
				<button
					onClick={() => {
						exportToCsv();
					}}>
					export to csv
				</button>
				<div
					style={{
						height: '150px',
						overflow: 'scroll',
						width: '1000px',
						fontSize: '8px',
					}}>
					<p>{csv}</p>
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
