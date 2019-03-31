import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';

import Chart from './components/Chart'

const App = (props) => {
    return (
        <>
            <h1>Testing 3</h1>
            <Chart
                name="My First Chart"
                seriesName="Series Name"
                type="candlestick"
                symbol="TLT"
                range="LAST_2_YEARS" />
        </>
    )
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);