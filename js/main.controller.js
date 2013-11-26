
angular.module('example', ['angularCharts']);

function MainController($scope) {
	$scope.data = {
		series: ['Sales', 'Income', 'Expense'],
		data : [{
			x : "Jack",
			y: [100,210, 384],
			tooltip:"this is tooltip"
		},
		{
			x : "John",
			y: [300, 289, 456]
		},
		{
			x : "Stacy",
			y: [351, 170, 255]
		},
		{
			x : "Luke",
			y: [54, 341, 879]
		}]     
	}

	$scope.chartType = 'bar';

	$scope.sampledata = {
		x : "Computers",
		y: [54, 0, 879],
		tooltip : "This is a tooltip"
	}
	
	$scope.combinedsample = {
		series : ['Sales', 'Income', 'Expense'],
		data : [{
			x : "Computers",
			y: [54, 0, 879],
			tooltip : "This is a tooltip"
		}]
	}
	$scope.messages = [];

	$scope.syntaxHighlight = function(json) {
		if (typeof json != 'string') {
			json = JSON.stringify(json, undefined, 2);
		}
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	}

	$scope.config = {
		labels: false,
		title : "Products",
		legend : {
			display: true,
			position:'right'
		},
		click : function(d) {
			$scope.messages.push('clicked!');
		},
		mouseover : function(d) {
			$scope.messages.push('mouseover!');
		},
		mouseout : function(d) {
			$scope.messages.push('mouseout!');
		}
	}
}

