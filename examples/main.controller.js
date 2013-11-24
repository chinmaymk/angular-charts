
angular.module('example', ['angularCharts']);

function MainController($scope, $interval,$timeout) {
	$scope.data = {
		series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
		data :[{ y: [123], x: 'This is nice', tooltip: 'One two three'},
		{ y: [43, 55], x: 'Keyboards', tooltip: 'Four three'},
		{ y: [234, 354], x: "Computers"},
		{ y: [140, 500], x: 'Mobiles', tooltip: '140'},
		{ y: [456, 451], x: 'Chairs', tooltip: '456'},
		{ y: [170, 300], x: 'Laptops', tooltip: '170'}]
	}

	$scope.chartType = 'line';

	$scope.config = {
		labels: true,
		title : "Products",
		legend : {
			display:true,
			position:'right'
		}
	}
}