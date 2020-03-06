import { composeWithDevTools } from 'redux-devtools-extension';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import mainReducer from './reducers/mainReducer';

const rootReducer = combineReducers({
	main: mainReducer,
});

export default createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
