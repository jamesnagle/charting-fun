import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const appPrefix = '/api/';
const appVersion = 'v1';

function log(data) {
    console.log(data);
}

class Ajaxer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'none',
            data: []
        }
    }
    componentDidMount() {
        this.chartRequest('TLT', 'LAST_60_DAYS', (resp) => {
            this.setState({
                status: resp.status,
                data: resp.chart
            });
            console.log(resp.chart);
        });
    }
    chartRequest(security, range, callback) {
        axios.post(`${appPrefix}${appVersion}/chart/`, {
            chart: {
                security,
                range
            }
        })
        .then((resp) => {
            callback(resp.data)
        })
        .catch(log)
    }
    render() {
        return (
            <p>Response: {this.state.status}</p>
        )
    }
}

ReactDOM.render(
    <>
        <h1>Testing 3</h1>
        <Ajaxer />
    </>,
    document.getElementById('root')
);