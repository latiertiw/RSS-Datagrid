import React from 'react';
import { Provider } from 'react-redux';
import Table from './components/Table/Table';
import store from './store';

function Root(): JSX.Element {
	return (
		<React.Fragment>
			<Provider store={store}>
				<div className="app">
					<Table height={400} width={1000} />
				</div>
			</Provider>
		</React.Fragment>
	);
}

export default Root;
