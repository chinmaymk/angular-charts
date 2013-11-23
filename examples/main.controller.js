
angular.module('example', ['angularCharts']);

function MainController($scope, $interval) {
	$scope.data = {
		series: ['Computers', 'Mobiles', 'Chairs', 'Laptops', 'Keyboards'],
		data :[{ y: [123], x: 'title', tooltip: 'One two three'},
		{ y: [43], x: 'title', tooltip: 'Four three'},
		{ y: [234], x: 'title'},
		{ y: [140], x: 'title', tooltip: '140'},
		{ y: [456], x: 'title', tooltip: '456'},
		{ y: [170], x: 'title', tooltip: '170'}]
	}

	$scope.config = {
		labels: true
	}
}