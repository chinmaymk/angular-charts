// chart config
config = {
	title : 'Chart',
	tooltips: true,
	labels : true,
	mouseover: function() {},
	mouseout: function() {},
	click: function() {},
	legend: {
		display: true,
		position: 'left, right, top, bottom'
	}
}

//all charts data format
//pie, bar, line, scatter, area

data = {
	series: [{
		title: 'Computers'
	},
	{
		title: 'Mobiles'
	}
	{
		title: 'Chairs'
	}
	{
		title: 'Laptops'
	}
	{
		title: 'Keyboards'
	}],
	data :[{
		y: [123],
		x: 'title',
		tooltip: '123'
	},
	{
		y: [43],
		x: 'title',
		tooltip: '43'
	},
	{
		y: [234],
		x: 'title',
		tooltip: '234'	
	},
	{
		y: [140],
		x: 'title',
		tooltip: '140'
	},
	{
		y: [456],
		x: 'title',
		tooltip: '456'
	},
	{
		y: [170],
		x: 'title',
		tooltip: '170'
	}]
}