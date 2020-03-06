import React, { useState, useEffect } from 'react';
import DataElement from '../../store/interfaces/DataElement';
import './index.sass';
interface componentProps {
	item: DataElement;
}

function SingleDataElement(props: componentProps): JSX.Element {
	const getColumns = () => {
		let columns: JSX.Element[] = [];
		const item: DataElement = props.item;

		for (let key in item) {
			let value = item[key];
			columns.push(<div className="data-element__column">{value}</div>);
		}

		return columns;
	};

	return <div className="data-element">{getColumns()}</div>;
}

export default SingleDataElement;
