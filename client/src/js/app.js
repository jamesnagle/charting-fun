import React from 'react';
import ReactDOM from 'react-dom';

import SimChart from './components/SimChart'

const App = (props) => {
    return (
        <>
            <h1>SPY Over Two Years</h1>
            <p>PUTs purchased weekly $1 below median price at time of purchase.</p>
            <SimChart
                symbol="SPY"
                range="LAST_2_YEARS" />
        </>
    )
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);