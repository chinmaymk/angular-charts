describe('angularCharts', function (){

	var chartsProvider, chartLogic;

	beforeEach(function () {

		angular.module('test-acChartsProvider', [])
			.config(function (acChartLogicProvider) {
				chartsProvider = acChartLogicProvider;
			});

		module('angularCharts', 'test-acChartsProvider');

		inject(function (){});		
	});

	beforeEach(inject(function(_acChartLogic_){
		chartLogic = _acChartLogic_;

	}));

	it('should return self when adding chart', function (){
		expect(chartsProvider.addChart('testChart', function(){})).toEqual(chartsProvider);
	});

	it('should return self when adding chart with legend', function (){
		expect(chartsProvider.addChart('testChart', function(){}, function(){})).toEqual(chartsProvider);
	});

	it('should get an exception for chart not being function', function (){
		expect(function(){chartsProvider.addChart('testChart', 1)}).toThrow(new Error('addChart expects parameter 2 to be function'));
	});

	it('should get an exception for legend not being function', function (){
		expect(function(){chartsProvider.addChart('testChart', function(){}, 1)}).toThrow(new Error('addChart expects parameter 3 if set to be function'));
	});

	it('should get an exception when callChartFunction is missing parameters', function(){
		expect(function(){chartLogic.callChartFunction('NotHere')}).toThrow(new Error('Missing Parameter(s) expects (string type, object config, object box, object domFunctions, array series, array points)'));
	});

	it('should get an exception when chart does not exist', function(){
		expect(function(){chartLogic.callChartFunction('NotHere', {}, {}, {}, [], [])}).toThrow(new Error('Chart type "NotHere" does not exist'));
	});

	it('should succeed when chart exists', function (){
		chartsProvider.addChart('testChart', function(){});
		expect(function(){chartLogic.callChartFunction('testChart', {}, {}, {}, [], [])}).not.toThrow();
	});

	it('should get an exception when chart has exception', function (){
		chartsProvider.addChart('testChart', function(){ throw new Error('Test Exception') });
		expect(function(){chartLogic.callChartFunction('testChart', {}, {}, {}, [], [])}).toThrow(new Error('Test Exception'));
	});

	it('should give access to chartsProvider inside chartFunction as this', function (){
		var innerProvider;
		chartsProvider.addChart('testChart', function(){
			innerProvider = this;
		});

		chartLogic.callChartFunction('testChart', {}, {}, {}, [], []);

		expect(innerProvider).toEqual(chartsProvider);
	});

	it('should passthrough paramaters from chartLogic.callChartFunction in order skipping type', function(){
		var outerConfig = {},
			outerBox = {}, 
			outerDomFunctions = {}, 
			outerSeries = [], 
			outerPoints = []
		;
		var innerConfig, innerBox, innerDomFunctions, innerSeries, innerPoints;
		chartsProvider.addChart('testChart', function(config, box, domFunctions, series, points){
			innerConfig = config;
			innerBox = box;
			innerDomFunctions = domFunctions;
			innerSeries = series;
			innerPoints = points;
		});

		chartLogic.callChartFunction('testChart', outerConfig, outerBox, outerDomFunctions, outerSeries, outerPoints);

		expect(innerConfig).toEqual(outerConfig);
		expect(innerBox).toEqual(outerBox);
		expect(innerDomFunctions).toEqual(outerDomFunctions);
		expect(innerSeries).toEqual(outerSeries);
		expect(innerPoints).toEqual(outerPoints);
	});

	it('should build defaultLegend when override not set', function (){
		var config = {colors: [1], legend:{htmlEnabled: false}}, series = ['Name'], box = {};

		chartsProvider.addChart('testChart', function(){});

		chartLogic.callChartFunction('testChart', config, box, {}, series, []);

		expect(box.legends.length).toBe(1);
	});

	it('should build override legend', function (){
		var config = {colors: [1], legend:{htmlEnabled: false}}, series = ['Name'], box = {};

		chartsProvider.addChart('testChart', function(){}, function(config, box, series, points){
			box.legends = true;
		});

		chartLogic.callChartFunction('testChart', config, box, {}, series, []);

		expect(box.legends).toEqual(true);
	});

	it('should give access to chartsProvider inside legendFunction as this', function (){
		var service;

		chartsProvider.addChart('testChart', function(){}, function(){
			service = this;
		});

		chartLogic.callChartFunction('testChart', {}, {}, {}, [], []);

		expect(service).toEqual(chartsProvider);
	});


});