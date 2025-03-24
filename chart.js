// Simple Chart Rendering Utility

// Create a bar chart
function createBarChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Default options
    const defaultOptions = {
        height: 250,
        barColor: 'var(--primary-color)',
        barWidth: 30,
        barGap: 10,
        showValues: true,
        maxValue: null, // Set to null to calculate from data
        valueFormatter: value => value,
        axisYFormatter: value => value,
        axisXFormatter: label => label,
        padding: { top: 30, right: 20, bottom: 40, left: 40 }
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Set dimensions
    container.style.height = `${chartOptions.height}px`;
    
    // Calculate max value if not provided
    const maxValue = chartOptions.maxValue || Math.max(...data.map(item => item.value)) * 1.2;
    
    // Create chart wrapper
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-wrapper';
    chartWrapper.style.position = 'relative';
    chartWrapper.style.height = '100%';
    chartWrapper.style.width = '100%';
    chartWrapper.style.paddingTop = `${chartOptions.padding.top}px`;
    chartWrapper.style.paddingRight = `${chartOptions.padding.right}px`;
    chartWrapper.style.paddingBottom = `${chartOptions.padding.bottom}px`;
    chartWrapper.style.paddingLeft = `${chartOptions.padding.left}px`;
    container.appendChild(chartWrapper);
    
    // Create chart Y axis
    const yAxis = document.createElement('div');
    yAxis.className = 'chart-y-axis';
    yAxis.style.position = 'absolute';
    yAxis.style.left = '0';
    yAxis.style.top = '0';
    yAxis.style.bottom = '0';
    yAxis.style.width = `${chartOptions.padding.left}px`;
    yAxis.style.display = 'flex';
    yAxis.style.flexDirection = 'column';
    yAxis.style.justifyContent = 'space-between';
    yAxis.style.paddingTop = `${chartOptions.padding.top}px`;
    yAxis.style.paddingBottom = `${chartOptions.padding.bottom}px`;
    chartWrapper.appendChild(yAxis);
    
    // Add Y axis labels (4 divisions)
    for (let i = 4; i >= 0; i--) {
        const value = maxValue * (i / 4);
        const yLabel = document.createElement('div');
        yLabel.className = 'chart-y-label';
        yLabel.style.fontSize = '10px';
        yLabel.style.color = 'var(--text-secondary)';
        yLabel.style.textAlign = 'right';
        yLabel.style.paddingRight = '5px';
        yLabel.textContent = chartOptions.axisYFormatter(value);
        yAxis.appendChild(yLabel);
    }
    
    // Create chart area
    const chartArea = document.createElement('div');
    chartArea.className = 'chart-area';
    chartArea.style.display = 'flex';
    chartArea.style.alignItems = 'flex-end';
    chartArea.style.height = `calc(100% - ${chartOptions.padding.top + chartOptions.padding.bottom}px)`;
    chartArea.style.marginLeft = `${chartOptions.padding.left}px`;
    chartArea.style.position = 'relative';
    chartWrapper.appendChild(chartArea);
    
    // Create X axis
    const xAxis = document.createElement('div');
    xAxis.className = 'chart-x-axis';
    xAxis.style.position = 'absolute';
    xAxis.style.left = `${chartOptions.padding.left}px`;
    xAxis.style.right = `${chartOptions.padding.right}px`;
    xAxis.style.bottom = '0';
    xAxis.style.height = `${chartOptions.padding.bottom}px`;
    xAxis.style.display = 'flex';
    xAxis.style.alignItems = 'flex-start';
    chartWrapper.appendChild(xAxis);
    
    // Add grid lines
    for (let i = 0; i <= 4; i++) {
        const gridLine = document.createElement('div');
        gridLine.className = 'chart-grid-line';
        gridLine.style.position = 'absolute';
        gridLine.style.left = '0';
        gridLine.style.right = '0';
        gridLine.style.top = `${i * 25}%`;
        gridLine.style.borderTop = '1px dashed var(--border-color)';
        gridLine.style.zIndex = '1';
        chartArea.appendChild(gridLine);
    }
    
    // Calculate total width needed
    const totalBarsWidth = data.length * (chartOptions.barWidth + chartOptions.barGap) - chartOptions.barGap;
    
    // Create bars container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'chart-bars-container';
    barsContainer.style.display = 'flex';
    barsContainer.style.alignItems = 'flex-end';
    barsContainer.style.height = '100%';
    barsContainer.style.width = `${totalBarsWidth}px`;
    barsContainer.style.position = 'relative';
    barsContainer.style.zIndex = '2';
    chartArea.appendChild(barsContainer);
    
    // Add bars with labels
    data.forEach((item, index) => {
        // Create bar group
        const barGroup = document.createElement('div');
        barGroup.className = 'chart-bar-group';
        barGroup.style.display = 'flex';
        barGroup.style.flexDirection = 'column';
        barGroup.style.alignItems = 'center';
        barGroup.style.width = `${chartOptions.barWidth}px`;
        barGroup.style.marginRight = index < data.length - 1 ? `${chartOptions.barGap}px` : '0';
        barsContainer.appendChild(barGroup);
        
        // Calculate height percentage
        const heightPercentage = (item.value / maxValue) * 100;
        
        // Create bar
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.width = '100%';
        bar.style.height = `${heightPercentage}%`;
        bar.style.backgroundColor = item.color || chartOptions.barColor;
        bar.style.borderRadius = '4px 4px 0 0';
        barGroup.appendChild(bar);
        
        // Add tooltip with value if enabled
        if (chartOptions.showValues) {
            const valueTooltip = document.createElement('div');
            valueTooltip.className = 'chart-value-tooltip';
            valueTooltip.style.fontSize = '11px';
            valueTooltip.style.fontWeight = '600';
            valueTooltip.style.color = 'var(--text-primary)';
            valueTooltip.style.marginBottom = '5px';
            valueTooltip.style.opacity = heightPercentage < 5 ? '0' : '1';
            valueTooltip.textContent = chartOptions.valueFormatter(item.value);
            bar.appendChild(valueTooltip);
        }
        
        // Add x-axis label
        const xLabel = document.createElement('div');
        xLabel.className = 'chart-x-label';
        xLabel.style.fontSize = '10px';
        xLabel.style.color = 'var(--text-secondary)';
        xLabel.style.textAlign = 'center';
        xLabel.style.width = `${chartOptions.barWidth}px`;
        xLabel.style.whiteSpace = 'nowrap';
        xLabel.style.overflow = 'hidden';
        xLabel.style.textOverflow = 'ellipsis';
        xLabel.style.transform = 'translateX(-50%)';
        xLabel.style.marginLeft = `${chartOptions.barWidth / 2 + (index * (chartOptions.barWidth + chartOptions.barGap))}px`;
        xLabel.textContent = chartOptions.axisXFormatter(item.label);
        xAxis.appendChild(xLabel);
    });
    
    return chartWrapper;
}

// Create a pie chart
function createPieChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Default options
    const defaultOptions = {
        size: 200,
        donut: false,
        donutSize: 0.6, // Percentage of radius
        showLabels: true,
        showValues: true,
        valueFormatter: value => value
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', chartOptions.size);
    svg.setAttribute('height', chartOptions.size);
    svg.setAttribute('viewBox', `0 0 ${chartOptions.size} ${chartOptions.size}`);
    container.appendChild(svg);
    
    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate center and radius
    const centerX = chartOptions.size / 2;
    const centerY = chartOptions.size / 2;
    const radius = chartOptions.size / 2 * 0.9; // 90% of container size
    
    // Calculate inner radius for donut
    const innerRadius = chartOptions.donut ? radius * chartOptions.donutSize : 0;
    
    // Create pie slices
    let startAngle = 0;
    
    data.forEach((item, index) => {
        // Calculate angles
        const angle = (item.value / total) * (2 * Math.PI);
        const endAngle = startAngle + angle;
        
        // Calculate path coordinates
        const startX = centerX + radius * Math.cos(startAngle);
        const startY = centerY + radius * Math.sin(startAngle);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);
        
        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Define path
        let d = '';
        
        if (chartOptions.donut) {
            // Calculate inner points
            const innerStartX = centerX + innerRadius * Math.cos(startAngle);
            const innerStartY = centerY + innerRadius * Math.sin(startAngle);
            const innerEndX = centerX + innerRadius * Math.cos(endAngle);
            const innerEndY = centerY + innerRadius * Math.sin(endAngle);
            
            d = `M ${innerStartX} ${innerStartY}
                 L ${startX} ${startY}
                 A ${radius} ${radius} 0 ${angle > Math.PI ? 1 : 0} 1 ${endX} ${endY}
                 L ${innerEndX} ${innerEndY}
                 A ${innerRadius} ${innerRadius} 0 ${angle > Math.PI ? 1 : 0} 0 ${innerStartX} ${innerStartY}
                 Z`;
        } else {
            d = `M ${centerX} ${centerY}
                 L ${startX} ${startY}
                 A ${radius} ${radius} 0 ${angle > Math.PI ? 1 : 0} 1 ${endX} ${endY}
                 Z`;
        }
        
        path.setAttribute('d', d);
        path.setAttribute('fill', item.color);
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '1');
        
        // Add tooltip on hover
        path.addEventListener('mouseenter', function() {
            path.setAttribute('opacity', 0.8);
        });
        path.addEventListener('mouseleave', function() {
            path.setAttribute('opacity', 1);
        });
        
        svg.appendChild(path);
        
        // Calculate position for label
        if (chartOptions.showLabels) {
            const midAngle = startAngle + (angle / 2);
            const labelRadius = radius * 0.7; // 70% of radius
            const labelX = centerX + labelRadius * Math.cos(midAngle);
            const labelY = centerY + labelRadius * Math.sin(midAngle);
            
            // Add percentage text
            const percentage = Math.round((item.value / total) * 100);
            if (percentage > 5) { // Only show if slice is large enough
                const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                labelText.setAttribute('x', labelX);
                labelText.setAttribute('y', labelY);
                labelText.setAttribute('text-anchor', 'middle');
                labelText.setAttribute('dominant-baseline', 'middle');
                labelText.setAttribute('fill', 'white');
                labelText.setAttribute('font-size', '12px');
                labelText.setAttribute('font-weight', 'bold');
                labelText.textContent = `${percentage}%`;
                svg.appendChild(labelText);
            }
        }
        
        startAngle = endAngle;
    });
    
    // Create legend
    if (chartOptions.showValues) {
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        legend.style.display = 'flex';
        legend.style.flexWrap = 'wrap';
        legend.style.gap = '10px';
        legend.style.justifyContent = 'center';
        legend.style.marginTop = '15px';
        
        data.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.gap = '5px';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.width = '12px';
            colorBox.style.height = '12px';
            colorBox.style.backgroundColor = item.color;
            colorBox.style.borderRadius = '2px';
            
            const label = document.createElement('span');
            label.className = 'legend-label';
            label.style.fontSize = '12px';
            label.style.color = 'var(--text-secondary)';
            label.textContent = `${item.label}: ${chartOptions.valueFormatter(item.value)}`;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });
        
        container.appendChild(legend);
    }
    
    return svg;
}

// Create a progress ring chart
function createProgressRing(containerId, percentage, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Default options
    const defaultOptions = {
        size: 120,
        strokeWidth: 8,
        color: 'var(--primary-color)',
        backgroundColor: 'var(--border-color)',
        labelText: 'Completed'
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Clear container
    container.innerHTML = '';
    
    // Create ring container
    const ringContainer = document.createElement('div');
    ringContainer.className = 'progress-ring';
    ringContainer.style.width = `${chartOptions.size}px`;
    ringContainer.style.height = `${chartOptions.size}px`;
    ringContainer.style.position = 'relative';
    container.appendChild(ringContainer);
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', chartOptions.size);
    svg.setAttribute('height', chartOptions.size);
    svg.setAttribute('viewBox', `0 0 ${chartOptions.size} ${chartOptions.size}`);
    svg.style.transform = 'rotate(-90deg)';
    ringContainer.appendChild(svg);
    
    // Calculate values
    const radius = (chartOptions.size / 2) - (chartOptions.strokeWidth / 2);
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100 * circumference);
    
    // Create background circle
    const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    backgroundCircle.setAttribute('cx', chartOptions.size / 2);
    backgroundCircle.setAttribute('cy', chartOptions.size / 2);
    backgroundCircle.setAttribute('r', radius);
    backgroundCircle.setAttribute('stroke', chartOptions.backgroundColor);
    backgroundCircle.setAttribute('stroke-width', chartOptions.strokeWidth);
    backgroundCircle.setAttribute('fill', 'none');
    svg.appendChild(backgroundCircle);
    
    // Create progress circle
    const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.setAttribute('cx', chartOptions.size / 2);
    progressCircle.setAttribute('cy', chartOptions.size / 2);
    progressCircle.setAttribute('r', radius);
    progressCircle.setAttribute('stroke', chartOptions.color);
    progressCircle.setAttribute('stroke-width', chartOptions.strokeWidth);
    progressCircle.setAttribute('stroke-dasharray', circumference);
    progressCircle.setAttribute('stroke-dashoffset', offset);
    progressCircle.setAttribute('stroke-linecap', 'round');
    progressCircle.setAttribute('fill', 'none');
    svg.appendChild(progressCircle);
    
    // Add text in the center
    const textContainer = document.createElement('div');
    textContainer.className = 'progress-ring-text';
    textContainer.style.position = 'absolute';
    textContainer.style.top = '50%';
    textContainer.style.left = '50%';
    textContainer.style.transform = 'translate(-50%, -50%)';
    textContainer.style.textAlign = 'center';
    
    const percentageText = document.createElement('span');
    percentageText.className = 'progress-ring-percentage';
    percentageText.style.fontSize = `${chartOptions.size / 5}px`;
    percentageText.style.fontWeight = '700';
    percentageText.style.color = 'var(--text-primary)';
    percentageText.textContent = `${Math.round(percentage)}%`;
    
    const labelText = document.createElement('span');
    labelText.className = 'progress-ring-label';
    labelText.style.fontSize = `${chartOptions.size / 10}px`;
    labelText.style.color = 'var(--text-secondary)';
    labelText.textContent = chartOptions.labelText;
    
    textContainer.appendChild(percentageText);
    textContainer.appendChild(labelText);
    ringContainer.appendChild(textContainer);
    
    // Return the ring container
    return ringContainer;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createBarChart,
        createPieChart,
        createProgressRing
    };
} 