require.config({
	
	paths:{
		angular:'../bower_components/angular/angular',
		d3:'../bower_components/d3/d3',
		'angularMocks':'../bower_components/angularmocks/angular-mocks',
		ngCharts:'../dist/amd/angular-charts'
	},
	shim:{
		angular:{exports:'angular'},
		d3:{exports:'d3'},
		'angularMocks':{deps:['angular'],exports:'angularMocks'}
		
	},
	
});

require(['angular','d3','angularMocks','ngCharts'],function(angular,d3,ngMock,ngCharts){
	
	
	var mod = angular.module('Main',['angularCharts']);
	
	mod.controller('ChartController',['$scope',function(scope){
		scope.chart = {
				data: {
						series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
						data : [
							{x : "Sales",y: [100,500, 0],tooltip:"this is tooltip"},
							{x : "Not Sales",y: [300, 100, 100]},
							{x : "Tax",y: [351]},
							{x : "Not Tax",y: [54, 0, 879]}
						]     
					},
					config : {
						title:'test',
						tooltips:true,
						colors:['#000000','#000000','#000000'],
						chartType:'bar'
				}
		};
		
	}]);
	
	
	
	angular.element(document).ready(function(){
		angular.bootstrap(document,['Main']);
	});
	
	
	
});