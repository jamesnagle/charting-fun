import React, { Component } from 'react';
import echarts from 'echarts';
import axios from 'axios';

const appPrefix = '/api/';
const appVersion = 'v1';

function log(data) {
    console.log(data);
}

class SimChart extends Component {
    constructor(props) {
        super(props);

        this.chartRequest = this.chartRequest.bind(this);

        this.state = {
            isLoading: true,
            status: 'none',
            chartSymbol: this.props.symbol,
            chartRange: this.props.range,
            wins: 0,
            losses: 0,
            totalContracts: 0,
            winPercent: 0,
            lossPercent: 0,
            winRevenue: 0.00,
            lossRevenue: 0.00,
            totalRevenue: 0.00,
            winsSVG: 'path://M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm20.1 198.1c4-25.2 34.2-42.1 59.9-42.1s55.9 16.9 59.9 42.1c1.7 11.1-11.4 18.3-19.8 10.8l-9.5-8.5c-14.8-13.2-46.2-13.2-61 0L288 217c-8.4 7.4-21.6.3-19.9-10.9zM168 160c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm230.9 146C390 377 329.4 432 256 432h-16c-73.4 0-134-55-142.9-126-1.2-9.5 6.3-18 15.9-18h270c9.6 0 17.1 8.4 15.9 18z',
            lossesSVG: 'path://M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm80 168c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zM152 416c-26.5 0-48-21-48-47 0-20 28.5-60.4 41.6-77.8 3.2-4.3 9.6-4.3 12.8 0C171.5 308.6 200 349 200 369c0 26-21.5 47-48 47zm16-176c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm170.2 154.2C315.8 367.4 282.9 352 248 352c-21.2 0-21.2-32 0-32 44.4 0 86.3 19.6 114.7 53.8 13.8 16.4-11.2 36.5-24.5 20.4z',
        }
    }
    componentDidMount() {
        const chart = echarts.init(this.el);
        chart.setOption(this.chartOptions());

        this.chartRequest((resp) => {
            let wins = 0;
            let losses = 0;

            const totalContracts = resp.chart.length;

            resp.chart.forEach((row) => {
                if (row.isWinner) {
                    wins++;
                } else {
                    losses++;
                }
            });

            const winPercent = (wins / totalContracts) * 100;
            const lossPercent = (losses / totalContracts) * 100;
            const winRevenue = 28 * wins;
            const lossRevenue = 72 * losses;
            const totalRevenue = winRevenue - lossRevenue;

            this.setState({
                isLoading: false,
                status: resp.status,
                totalContracts,
                wins,
                losses,
                winPercent,
                lossPercent,
                winRevenue,
                lossRevenue,
                totalRevenue
            });
            chart.setOption(this.chartOptions(), true);
        });
    }
    chartOptions() {
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'none'
                },
                formatter: function (params) {
                    return params[0].name + ': ' + params[0].value;
                }
            },
            xAxis: {
                data: ['WINS', 'LOSSES' ],
                axisTick: {show: false},
                axisLine: {show: false},
                axisLabel: {
                    textStyle: {
                        color: '#fc6821'
                    }
                }
            },
            yAxis: {
                splitLine: {show: false},
                axisTick: {show: false},
                axisLine: {show: false},
                axisLabel: {show: false}
            },
            color: ['#00a6d5', '#fc6821'],
            series: [{
                name: 'hill',
                type: 'pictorialBar',
                barCategoryGap: '-130%',
                symbol: 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z',
                itemStyle: {
                    normal: {
                        opacity: 0.5
                    },
                    emphasis: {
                        opacity: 1
                    }
                },
                data: [this.state.wins, this.state.losses],
                z: 10
            }, {
                name: 'glyph',
                type: 'pictorialBar',
                barGap: '-100%',
                symbolPosition: 'end',
                symbolSize: 50,
                symbolOffset: [0, '-120%'],
                data: [{
                    value: this.state.wins,
                    symbol: this.state.winsSVG,
                    symbolSize: [50, 50]
                }, {
                    value: this.state.losses,
                    symbol: this.state.lossesSVG,
                    symbolSize: [50, 50]
                }]
            }]
        }
    }
    chartRequest(callback) {
        axios.post(`${appPrefix}${appVersion}/chart/`, {
            chart: {
                type: 'basicSimulation',
                strategy: 'PUT',
                security: this.state.chartSymbol,
                dateRange: this.state.chartRange,
                amountAbove: null,
                amountBelow: 1.00,
                strikeDistance: 0.50,
                purchaseInterval: 'weekly',   // daily, weekly, monthly,
                avgDaysOut: 7
            }
        })
        .then((resp) => {
            callback(resp.data)
        })
        .catch(log)
    }
    render() {
        return (
            <>
                <div id="chart" style={{height: '400px'}} ref={el => this.el = el}></div>
                <table style={{width: '100%'}}>
                    <thead>
                        <th>Total Revenue</th>
                        <th>Win Amount</th>
                        <th>Loss Amount</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.state.totalRevenue.toFixed(2)}</td>
                            <td>{this.state.winRevenue.toFixed(2)}</td>
                            <td>{this.state.lossRevenue.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <table style={{width: '100%'}}>
                    <thead>
                        <th>Total Contracts</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Win Percentage</th>
                        <th>Loss Percentage</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.state.totalContracts}</td>
                            <td>{this.state.wins}</td>
                            <td>{this.state.losses}</td>
                            <td>{this.state.winPercent.toFixed(2)}%</td>
                            <td>{this.state.lossPercent.toFixed(2)}%</td>
                        </tr>
                    </tbody>
                </table>
            </>
        )
    }
}

export default SimChart;