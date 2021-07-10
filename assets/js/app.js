function makeResponsive() {

    var svgArea = d3.select("#scatter").select("svg");

    if(!svgArea.empty()) {
        svgArea.remove();
    };

    var svgHeight = window.innerHeight**.9;
    var svgWidth = window.innerWidth**.93;
    
    var margin = {
        top: 20,
        right: 40,
        bottom: 130,
        left: 120
      };
      
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
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
    
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
      
        xAxis.transition()
          .duration(1000)
          .call(bottomAxis);
      
        return xAxis;
    };

    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        
        return yAxis;
    };

    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circlesGroup.transition()
          .duration(1000)
          .attr("cx", d => newXScale(d[chosenXAxis]))
          .attr("cy", d => newYScale(d[chosenYAxis])-3);
      
        return circlesGroup;
    };      

    function renderStates(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        textGroup.transition()
          .duration(1000)
          .attr("x", d => newXScale(d[chosenXAxis]))
          .attr("y", d => newYScale(d[chosenYAxis]));

        return textGroup;
    };

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
    
    
    d3.csv("./assets/data/data.csv").then(function(healthData) {
    
        healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });
    
        var xLinearScale = xScale(healthData, chosenXAxis);
        var yLinearScale = yScale(healthData, chosenYAxis);
    
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
    
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
    
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis])-3)
            .attr("class", "stateCircle")
        
        var textGroup = chartGroup.selectAll("div")
            .data(healthData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("class", "stateText")
            .text(d => d.abbr);
        
        
        // Create group for 3 y-axis labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        
        var yLacksHealthcare = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .attr("class", "aText active")
        .text("Lacks Healthcare (%)");

        var ySmokes = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 25)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .attr("class", "aText inactive")
        .text("Smokes (%)");

        var yObesity = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .attr("class", "aText inactive")
        .text("Obese (%)");
        
        // Create group for 3 x-axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`);
        
        var xInPoverty = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("value", "poverty") // value to grab for event listener
            .attr("class", "aText active")
            .text("In Poverty (%)");

        var xAge = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .attr("value", "age") // value to grab for event listener
        .attr("class", "aText inactive")
        .text("Age (Median)");

        var xHouseholdIncome = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("value", "income") // value to grab for event listener
        .attr("class", "aText inactive")
        .text("Household Income (Median)");

        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        xLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    chosenXAxis = value;
                    xLinearScale = xScale(healthData, chosenXAxis)
                    xAxis = renderXAxis(xLinearScale, xAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderStates(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup)
                    if (chosenXAxis === "poverty") {
                        xInPoverty.attr("class", "active");
                        xAge.attr("class", "inactive");
                        xHouseholdIncome.attr("class", "inactive");
                    } else if (chosenXAxis === "age") {
                        xInPoverty.attr("class", "inactive");
                        xAge.attr("class", "active");
                        xHouseholdIncome.attr("class", "inactive");
                    } else {
                        xInPoverty.attr("class", "inactive");
                        xAge.attr("class", "inactive");
                        xHouseholdIncome.attr("class", "active");
                    }
                }
            })
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
                    chosenYAxis = value;
                    yLinearScale = yScale(healthData, chosenYAxis)
                    yAxis = renderYAxis(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
                    textGroup = renderStates(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup)
                    if (chosenYAxis === "healthcare") {
                        yLacksHealthcare.attr("class", "active");
                        ySmokes.attr("class", "inactive");
                        yObesity.attr("class", "inactive");
                    } else if (chosenYAxis === "smokes") {
                        yLacksHealthcare.attr("class", "inactive");
                        ySmokes.attr("class", "active");
                        yObesity.attr("class", "inactive");
                    } else {
                        yLacksHealthcare.attr("class", "inactive");
                        ySmokes.attr("class", "inactive");
                        yObesity.attr("class", "active");
                    }
                }
            })
    });
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);
