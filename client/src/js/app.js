import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const appPrefix = '/api/';
const appVersion = 'v1';

function log(data) {
    console.log(data);
}

class Ajaxer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: 'none'
        }
    }
    componentDidMount() {
        axios.post(`${appPrefix}${appVersion}/chart/`, {
            chart: {
                security: 'SPY'
            }
        })
        .then((resp) => {
            this.setState({data: resp.data.status})
        })
        .catch(log)
    }
    render() {
        return (
            <p>Response: {this.state.data}</p>
        )
    }
}

ReactDOM.render(
    <>
        <h1>Testing 2</h1>
        <Ajaxer />
    </>,
    document.getElementById('root')
);