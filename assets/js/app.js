// Almost all code is inside this function which updates screen size to resize chart
function makeResponsive() {

    var svgArea = d3.select("#scatter").select("svg");

    if(!svgArea.empty()) {
        svgArea.remove();
    };

    var svgHeight = window.innerHeight**.9;
    var svgWidth = window.innerWidth**.98;
    
    var margin = {
        top: 20,
        right: 0,
        bottom: 130,
        left: 120
      };
      
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("class", "chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    
    // Append an SVG group
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Creating axis variables and asigning initial value
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";
    
    // Function used for updating x-scale var upon click on axis label
    function xScale(healthData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([
                d3.min(healthData, d => d[chosenXAxis]) * 0.8,
                d3.max(healthData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0,width]);
        return xLinearScale;
    };
    
    // Function used for updating y-scale var upon click on axis label
    function yScale(healthData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([
                d3.min(healthData, d => d[chosenYAxis]) * 0.8,
                d3.max(healthData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height,0]);
        return yLinearScale;
    };
    
    // Function used to render x-axis with transition
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
      
        xAxis.transition()
          .duration(1000)
          .call(bottomAxis);
      
        return xAxis;
    };

    // Function used to render y-axis with transition
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        
        return yAxis;
    };

    // Function used to render circles with transition
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        var circleClass = "";
        if (chosenXAxis === "poverty") {
            circleClass = "stateCirclePoverty";
        } else if (chosenXAxis === "age") {
            circleClass = "stateCircleAge";
        } else {
            circleClass = "stateCircleIncome";
        };
        circlesGroup.transition()
          .duration(1000)
          .attr("cx", d => newXScale(d[chosenXAxis]))
          .attr("cy", d => newYScale(d[chosenYAxis])-3)
          .attr("class", circleClass);
      
        return circlesGroup;
    };      

    // Function used to render state text with transition
    function renderStates(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        var textClass = "";
        if (chosenYAxis === "healthcare"){
            textClass = "stateTextHealthcare";
        } else if (chosenYAxis === "smokes"){
            textClass = "stateTextSmokes";
        } else {
            textClass = "ctext stateTextObesity";
        };
        textGroup.transition()
          .duration(1000)
          .attr("x", d => newXScale(d[chosenXAxis]))
          .attr("y", d => newYScale(d[chosenYAxis]))
          .attr("class", textClass);

        return textGroup;
    };

    // Function used to update the tooltip information
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
        var xLabel;
        var yLabel;

        if (chosenXAxis === "poverty") {
            xLabel = "In Poverty (%)";
        } else if (chosenXAxis === "age") {
            xLabel = "Age (Median)";
        } else {
            xLabel = "Household Income (Median)";
        }

        if (chosenYAxis === "poverty") {
            yLabel = "Lacks Healthcare (%)";
        } else if (chosenYAxis === "age") {
            yLabel = "Smokes (%)";
        } else {
            yLabel = "Obese (%)";
        }
        
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80,-60])
            .html(d => `<strong>${d.state}</strong><br><strong>${xLabel}:</strong> ${d[chosenXAxis]}<br><strong>${yLabel}:</strong> ${d[chosenYAxis]}`);

        chartGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    
        return circlesGroup;    
    };
    
    // Import data and define chart
    d3.csv("./assets/data/data.csv").then(function(healthData) {
    
        // Parse data
        healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });
    
        // Creating X & Y axis
        var xLinearScale = xScale(healthData, chosenXAxis);
        var yLinearScale = yScale(healthData, chosenYAxis);
    
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
    
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
    
        // Circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis])-3)
            .attr("class", "stateCirclePoverty")
        
        // State text
        var textGroup = chartGroup.selectAll("div")
            .data(healthData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("class", "stateTextHealthcare")
            .text(d => d.abbr);
        
        
        // Create group for 3 y-axis labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        
        var yLacksHealthcare = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .attr("class", "aText activeHealthcare")
        .text("Lacks Healthcare (%)");

        var ySmokes = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 25)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .attr("class", "aText inactiveSmokes")
        .text("Smokes (%)");

        var yObesity = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .attr("class", "aText inactiveObesity")
        .text("Obese (%)");
        
        // Create group for 3 x-axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`);
        
        var xInPoverty = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("value", "poverty")
            .attr("class", "aText activePoverty")
            .text("In Poverty (%)");

        var xAge = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .attr("value", "age")
        .attr("class", "aText inactiveAge")
        .text("Age (Median)");

        var xHouseholdIncome = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("value", "income")
        .attr("class", "aText inactiveIncome")
        .text("Household Income (Median)");

        // Create tooltip
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        // Updating chart on clicking X labels
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    chosenXAxis = value;
                    // MISSING CIRCLE SURROUNDING POINTER
                    xLinearScale = xScale(healthData, chosenXAxis);
                    xAxis = renderXAxis(xLinearScale, xAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderStates(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup)
                    if (chosenXAxis === "poverty") {
                        xInPoverty.attr("class", "aText activePoverty");
                        xAge.attr("class", "aText inactiveAge");
                        xHouseholdIncome.attr("class", "aText inactiveIncome");
                    } else if (chosenXAxis === "age") {
                        xInPoverty.attr("class", "aText inactivePoverty");
                        xAge.attr("class", "aText activeAge");
                        xHouseholdIncome.attr("class", "aText inactiveIncome");
                    } else {
                        xInPoverty.attr("class", "aText inactivePoverty");
                        xAge.attr("class", "aText inactiveAge");
                        xHouseholdIncome.attr("class", "aText activeIncome");
                    }
                };
            });
        
        // Updating chart on clicking Y labels
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
                    chosenYAxis = value;
                    // MISSING CIRCLE SURROUNDING POINTER
                    yLinearScale = yScale(healthData, chosenYAxis);
                    yAxis = renderYAxis(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
                    textGroup = renderStates(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup)
                    if (chosenYAxis === "healthcare") {
                        yLacksHealthcare.attr("class", "aText activeHealthcare");
                        ySmokes.attr("class", "aText inactiveSmokes");
                        yObesity.attr("class", "aText inactiveObesity");
                    } else if (chosenYAxis === "smokes") {
                        yLacksHealthcare.attr("class", "aText inactiveHealthcare");
                        ySmokes.attr("class", "aText activeSmokes");
                        yObesity.attr("class", "aText inactiveObesity");
                    } else {
                        yLacksHealthcare.attr("class", "aText inactiveHealthcare");
                        ySmokes.attr("class", "aText inactiveSmokes");
                        yObesity.attr("class", "aText activeObesity");
                    }
                };
            });
    });
};

makeResponsive();

d3.select(window).on("resize", makeResponsive);
