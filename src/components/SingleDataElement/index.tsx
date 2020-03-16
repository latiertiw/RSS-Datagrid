import React, { useState, useEffect } from 'react';
import DataElement from '../../store/interfaces/DataElement';
import './index.sass';
import { Hash } from 'crypto';
interface ComponentProps {
	item: DataElement;
	leftProperty: string;
	selected: Set<number>;
	onSelect: Function;
	enabledColumns: Set<number>;
	deletedColumns: Set<number>;
}

function SingleDataElement(props: ComponentProps): JSX.Element {
	const getColumns = () => {
		const columns: JSX.Element[] = [];
		const item: DataElement = props.item;
		//console.log(item);
		//console.log(columns);
		let index = 0;
		for (const key in item) {
			const selected = props.selected.has(index);
			let value = item[key];
			if (value === true) {
				value = 'true';
			}
			if (value === false) {
				value = 'false';
			}
			const currindex = index;
			if (props.enabledColumns.has(currindex) && !props.deletedColumns.has(currindex))
				columns.push(
					<div
						onClick={() => {
							props.selected.size == 0 &&
								currindex !== 0 &&
								props.onSelect(currindex);
						}}
						key={Math.random() + item.lastName + item.firstName + item.age}
						className={
							selected
								? 'data-element__column data-element__column_selected'
								: 'data-element__column'
						}>
						{value}
					</div>
				);
			index++;
		}

		return columns;
	};

	return <div className="data-element">{getColumns()}</div>;
}

export default SingleDataElement;
