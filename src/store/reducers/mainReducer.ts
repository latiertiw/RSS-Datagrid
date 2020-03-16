import * as actionTypes from '../actionTypes';
import MainReducerState from '../interfaces/MainReducerState';

const initialState = {
	data: [],
};

const mainReducer = (state: MainReducerState = initialState, action: any) => {
	switch (action.type) {
		case actionTypes.TEST:
			return {
				...state,
			};
		case actionTypes.SET_DATA:
			return {
				...state,
				data: action.data,
			};
		default:
			return { ...state };
	}
};

export default mainReducer;
