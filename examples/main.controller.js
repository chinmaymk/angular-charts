
angular.module('example', ['angularCharts']);

function MainController($scope, $interval) {
	$scope.greeting = "Hello World";
	$scope.data = [123,43,234,140,456,170];

	// $interval(function(){
	// 	$scope.data.push(Math.random() * 1000);
	// },500)
}