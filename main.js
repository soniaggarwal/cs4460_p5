$(document).ready(function () {
	$('#region').select2({
		closeOnSelect: false
	});

	$('#admission-rate').select2({
		closeOnSelect: false
	});

	$('#cost').select2({
		closeOnSelect: false
	});
});

var width = 500;
var height = 500;

var selected_colleges = [];

d3.csv("colleges.csv", function (csv) {
	for (var i = 0; i < csv.length; ++i) {
		csv[i].Name = String(csv[i]["Name"]);
		csv[i].Control = String(csv[i]["Control"]);
		csv[i].Region = String(csv[i]["Region"]);
		csv[i].AdmissionRate = Number(csv[i]["Admission Rate"]);
		csv[i].ACT = Number(csv[i]["ACT Median"]);
		csv[i].SAT = Number(csv[i]["SAT Average"]);
		csv[i].UndergradPopulation = Number(csv[i]["Undergrad Population"]);
		csv[i].AverageCost = Number(csv[i]["Average Cost"]);
		csv[i].MedianEarnings = Number(csv[i]["Median Earnings 8 years After Entry"]);
	}

	var actExtent = d3.extent(csv, function (row) { return row.ACT; });
	var satExtent = d3.extent(csv, function (row) { return row.SAT; });

	// need to change if including 0's
	// var xScale = d3.scaleLinear().domain(actExtent).range([50, 470]);
	// var yScale = d3.scaleLinear().domain(satExtent).range([470, 30]);
	var xScale = d3.scaleLinear().domain([12, 36]).range([50, 470]);
	var yScale = d3.scaleLinear().domain([600, 1600]).range([470, 30]);

	var xAxis = d3.axisBottom().scale(xScale);
	var yAxis = d3.axisLeft().scale(yScale);

	var chart = d3.select("#graph")
		.append("svg:svg")
		.attr("width", width)
		.attr("height", height);

	var gBrush = chart.append('g')
		.attr('class', 'brush');

	var temp = chart.selectAll("circle")
		.data(csv)
		.enter()
		.filter(function (d) {
			return d.ACT != 0 && d.SAT != 0; // can i just do this? 
		})
		.append("circle")
		.attr("id", function (d, i) { return i; })
		.attr("stroke", "black")
		.attr("cx", function (d) { return xScale(d.ACT); })
		.attr("cy", function (d) { return yScale(d.SAT); })
		.attr("r", 3);

	chart
		.append("g")
		.attr("transform", "translate(0," + (width - 30) + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width - 16)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("ACT"); // doesn't show up 

	chart
		.append("g")
		.attr("transform", "translate(50, 0)")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("SAT"); // doesn't show up 

	var button = d3.select("#button");
	button.on("click", function () {
		brush.move(gBrush, null);
		selected_colleges = [];
		d3.selectAll("circle").classed("selected-brush", false);
		var region = []
		var admission_rate = []
		var cost = []
		$("#region").select2("data").forEach(item => {
			region.push(item.text);
		});
		$("#admission-rate").select2("data").forEach(item => {
			admission_rate.push(item.text);
		});
		$("#cost").select2("data").forEach(item => {
			cost.push(item.text);
		});
		d3.selectAll("circle")
			.attr('r', function (d) {
				if (checkRegion(d, region) && checkAdmissionRate(d, admission_rate) && checkCost(d, cost)) {
					return 3;
				} else {
					return 0;
				}
			})
	});

	function checkRegion(d, region) {
		if (region.length == 0) {
			return true;
		}
		return region.includes(d["Region"]);
	}

	function checkAdmissionRate(d, admission_rate) {
		if (admission_rate.length == 0) {
			return true;
		}
		var actual_rate = d["AdmissionRate"] * 100;
		var rate_string = "";
		if (actual_rate <= 10) {
			rate_string = "0-10%";
		} else if (actual_rate <= 20) {
			rate_string = "10-20%";
		} else if (actual_rate <= 30) {
			rate_string = "20-30%";
		} else if (actual_rate <= 40) {
			rate_string = "30-40%";
		} else if (actual_rate <= 50) {
			rate_string = "40-50%";
		} else if (actual_rate <= 60) {
			rate_string = "50-60%";
		} else if (actual_rate <= 70) {
			rate_string = "60-70%";
		} else if (actual_rate <= 80) {
			rate_string = "70-80%";
		} else if (actual_rate <= 90) {
			rate_string = "80-90%";
		} else {
			rate_string = "90-100%";
		}
		return admission_rate.includes(rate_string);
	}

	function checkCost(d, cost) {
		if (cost.length == 0) {
			return true;
		}
		var actual_cost = d["AverageCost"];
		var cost_string = "";
		if (actual_cost <= 10000) {
			cost_string = "$0-$10,000";
		} else if (actual_cost <= 20000) {
			cost_string = "$10,000-$20,000";
		} else if (actual_cost <= 30000) {
			cost_string = "$20,000-$30,000";
		} else if (actual_cost <= 40000) {
			cost_string = "$30,000-$40,000";
		} else if (actual_cost <= 50000) {
			cost_string = "$40,000-$50,000";
		} else if (actual_cost <= 60000) {
			cost_string = "$50,000-$60,000";
		} else {
			cost_string = "$60,000-$70,000";
		}
		return cost.includes(cost_string);
	}

	var brush = d3.brush()
		.extent([[-10, -10], [width + 10, height + 10]])
		.on('start', handleBrushStart)
		.on('brush', handleBrushMove)
		.on('end', handleBrushEnd);

	gBrush.call(brush);

	function handleBrushStart() {
		brush.move(gBrush, null);
	}

	function handleBrushMove() {
		selected_colleges = [];
		var sel = d3.event.selection;
		if (!sel) return;
		var [[left, top], [right, bottom]] = sel;
		d3.selectAll("circle").classed("selected-brush", function (d) {
			var cx = xScale(d.ACT);
			var cy = yScale(d.SAT);
			if (left <= cx && cx <= right && top <= cy && cy <= bottom) {
				selected_colleges.push(d);
				return true;
			} else {
				return false;
			}
		});
		updateTable();
	}

	function handleBrushEnd() {
		var sel = d3.event.selection;
		if (!sel) {
			d3.selectAll("circle").classed("selected-brush", false);
		}
	}

	function updateTable() {
		d3.select("table").remove();
		var table = d3.select("#table")
			.append("table");
		var tbody = table.append("tbody");
		var rows = tbody.selectAll('tr')
			.data(selected_colleges)
			.enter()
			.append('tr')
			.text(function (d) { return d["Name"] });
	}
});