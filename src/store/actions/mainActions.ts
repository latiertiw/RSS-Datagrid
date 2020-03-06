import * as actionTypes from '../actionTypes';
import DataElement from '../interfaces/DataElement';

export function setData(newData: DataElement[]) {
	return (dispatch: Function) => {
		dispatch({
			type: actionTypes.SET_DATA,
			data: newData,
		});
	};
}
