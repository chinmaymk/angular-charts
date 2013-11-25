
angular.module('example', ['angularCharts']);

function MainController($scope, $interval,$timeout) {
	$scope.data = {
		series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
		     
	}

	$scope.chartType = 'line';

	$scope.config = {
		labels: false,
		title : "Products",
		legend : {
			display:true,
			position:'right'
		}
	}
}