
angular.module('example', ['angularCharts']);

function MainController($scope) {
	$scope.data = {
		series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
		data : [{
			x : "Sales",
			y: [100,500, 0],
			tooltip:"this is tooltip"
		},
		{
			x : "Not Sales",
			y: [300, 100, 100]
		},
		{
			x : "Tax",
			y: [351]
		},
		{
			x : "Not Tax",
			y: [54, 0, 879]
		}]     
	}

	$scope.data1 = {
		series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
		data : [{
			x : "Sales",
			y: [100,500, 0],
			tooltip:"this is tooltip"
		},
		{
			x : "Not Sales",
			y: [300, 100, 100]
		},
		{
			x : "Tax",
			y: [351]
		},
		{
			x : "Not Tax",
			y: [54, 0, 879]
		}]     
	}

	$scope.chartType = 'bar';

	$scope.config = {
		labels: false,
		title : "Not Products",
		legend : {
			display:true,
			position:'left'
		}
	}

	$scope.config1 = {
		labels: false,
		title : "Products",
		legend : {
			display:true,
			position:'right'
		}
	}
}