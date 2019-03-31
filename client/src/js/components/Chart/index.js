import React, { Component } from 'react';
import echarts from 'echarts';
import axios from 'axios';

const appPrefix = '/api/';
const appVersion = 'v1';

function log(data) {
    console.log(data);
}

class Chart extends Component {
    constructor(props) {
        super(props);

        this.getCategoryData = this.getCategoryData.bind(this);
        this.chartRequest = this.chartRequest.bind(this);
        this.getValues = this.getValues.bind(this);
        this.calculateMA = this.calculateMA.bind(this);
        this.splitData = this.splitData.bind(this);
        this.chartOptions = this.chartOptions.bind(this);
        this.buildSeries = this.buildSeries.bind(this);
        this.medianDate = this.medianDate.bind(this);
        this.medianValue = this.medianValue.bind(this);


        this.state = {
            isLoading: true,
            status: 'none',
            //chart: echarts.init(document.getElementById("chart")),
            chartName: this.props.name,
            chartType: this.props.type,
            chartSymbol: this.props.symbol,
            chartSeriesName: this.props.seriesName,
            chartValues: [],
            chartCategories: []
        }
    }
    componentDidMount() {
        const chart = echarts.init(this.el);
        chart.setOption(this.chartOptions());

        this.chartRequest((resp) => {
            const data = this.splitData(resp.chart);

            this.setState({
                isLoading: false,
                status: resp.status,
                chartValues: data.values,
                chartCategories: data.categoryData
            });
            chart.setOption(this.chartOptions(), true);
        });
    }
    chartOptions() {
        return {
            title: {
                text: this.state.chartName,
                left: 0
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: [this.state.chartSymbol, 'MA5', 'MA10', 'MA20', 'MA30']
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: this.state.chartCategories,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: false},
                splitLine: {show: false},
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            },
            yAxis: {
                scale: true,
                splitArea: {
                    show: true
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 50,
                    end: 100
                },
                {
                    show: true,
                    type: 'slider',
                    y: '90%',
                    start: 50,
                    end: 100
                }
            ],
            series: this.buildSeries()
        }
    }
    buildSeries() {
        return [
            {
                name: this.state.chartSeriesName,
                type: this.state.chartType,
                data: this.state.chartValues,
                itemStyle: {
                    normal: {
                        color: '#ec0000',
                        color0: '#00da3c',
                        borderColor: '#8A0000',
                        borderColor0: '#008F28'
                    }
                },
                markPoint: {
                    label: {
                        normal: {
                            formatter: function (param) {
                                return param != null ? Math.round(param.value) : '';
                            }
                        }
                    },
                    data: [
                        {
                            name: this.state.chartName,
                            coord: [this.medianDate(), this.medianValue()],
                            value: this.medianValue(),
                            itemStyle: {
                                normal: {color: 'rgb(41,60,85)'}
                            }
                        },
                        {
                            name: 'highest value',
                            type: 'max',
                            valueDim: 'highest'
                        },
                        {
                            name: 'lowest value',
                            type: 'min',
                            valueDim: 'lowest'
                        },
                        {
                            name: 'average value on close',
                            type: 'average',
                            valueDim: 'close'
                        }
                    ],
                    tooltip: {
                        formatter: function (param) {
                            return param.name + '<br>' + (param.data.coord || '');
                        }
                    }
                },
                markLine: {
                    symbol: ['none', 'none'],
                    data: [
                        [
                            {
                                name: 'from lowest to highest',
                                type: 'min',
                                valueDim: 'lowest',
                                symbol: 'circle',
                                symbolSize: 10,
                                label: {
                                    normal: {show: false},
                                    emphasis: {show: false}
                                }
                            },
                            {
                                type: 'max',
                                valueDim: 'highest',
                                symbol: 'circle',
                                symbolSize: 10,
                                label: {
                                    normal: {show: false},
                                    emphasis: {show: false}
                                }
                            }
                        ],
                        {
                            name: 'min line on close',
                            type: 'min',
                            valueDim: 'close'
                        },
                        {
                            name: 'max line on close',
                            type: 'max',
                            valueDim: 'close'
                        }
                    ]
                }
            },
            {
                name: 'MA5',
                type: 'line',
                data: this.calculateMA(5),
                smooth: true,
                lineStyle: {
                    normal: {opacity: 0.5}
                }
            },
            {
                name: 'MA10',
                type: 'line',
                data: this.calculateMA(10),
                smooth: true,
                lineStyle: {
                    normal: {opacity: 0.5}
                }
            },
            {
                name: 'MA20',
                type: 'line',
                data: this.calculateMA(20),
                smooth: true,
                lineStyle: {
                    normal: {opacity: 0.5}
                }
            },
            {
                name: 'MA30',
                type: 'line',
                data: this.calculateMA(30),
                smooth: true,
                lineStyle: {
                    normal: {opacity: 0.5}
                }
            }                 
        ]
    }
    chartRequest(callback) {
        axios.post(`${appPrefix}${appVersion}/chart/`, {
            chart: {
                security: this.props.symbol,
                range: this.props.range
            }
        })
        .then((resp) => {
            callback(resp.data)
        })
        .catch(log)
    }
    medianDate() {
        const median = this.medianOfArray(this.state.chartCategories);
        if (!median) {
            return '';
        }
        return median;
    }
    medianValue(array = null) {
        const median = this.medianOfArray(this.state.chartValues);
        if (!median) {
            return false;
        }
        return median[0];
    }
    medianOfArray(arr) {
        if (arr.length === 0) {
            return false;
        }
        const medianKey = Math.round(arr.length / 2);
        return arr[medianKey];
    }
    getCategoryData() {
        return this.state.data.categoryData;
    }
    getValues() {
        return this.state.data.values;
    }
    calculateMA(dayCount) {
        var result = [];
        for (var i = 0, len = this.state.chartValues.length; i < len; i++) {
            if (i < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0; j < dayCount; j++) {
                sum += this.state.chartValues[i - j][1];
            }
            result.push(sum / dayCount);
        }
        return result;
    }
    // 数据意义：开盘(open)，收盘(close)，最低(lowest)，最高(highest)
    splitData(rawData) {
        let categoryData = [];
        let values = []
        for (let i = 0; i < rawData.length; i++) {
            categoryData.push(rawData[i].Date);
            values.push([rawData[i].Open, rawData[i].Close, rawData[i].Low, rawData[i].High])
        }
        return {
            categoryData: categoryData,
            values: values
        };
    }
    render() {
        return (
            <div id="chart" style={{height: '400px'}} ref={el => this.el = el}></div>
        )
    }
}

export default Chart;