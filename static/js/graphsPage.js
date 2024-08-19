import { CreateLogoutButton } from "./authentication.js";
import { GradesQuery, GetUserProfileInfo, GetUserTransactions } from "./graphQLRequests.js";

export async function LoadGraphsPage() {

    const main = document.querySelector('.main');
    const userToken = localStorage.getItem('jwt');
    const userProfile = await GetUserProfileInfo(userToken);

    const logoutButton = await CreateLogoutButton();
    const menuContainer = document.getElementById('menuContainer');
    menuContainer.appendChild(logoutButton);

    const welcomeContainer = await WelcomeContainer(userProfile);
    main.appendChild(welcomeContainer);

    const profileContainer = await CreateProfileContainer(userProfile);
    main.appendChild(profileContainer);

    const gradesPieChartContainer = await PieChart(userToken);
    main.appendChild(gradesPieChartContainer);

    const barGraphContainer = await BarGraph(userToken);
    main.appendChild(barGraphContainer);

    const auditsDoneContainer = await AuditsDone(userToken);
    main.appendChild(auditsDoneContainer);

    const auditsRecievedContainer = await AuditsRecieved(userToken);
    main.appendChild(auditsRecievedContainer);

}

export async function AuditsDone(userToken) {

    const userTransactions = await GetUserTransactions(userToken);
    const sortedUserTransactions = userTransactions.data.transaction.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const upTransactions = sortedUserTransactions.filter(transaction => transaction.type === "up" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));
    const downTransactions = sortedUserTransactions.filter(transaction => transaction.type === "down" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));

    const auditsDoneTable = document.createElement('div');
    auditsDoneTable.id = 'auditsTableContainer';
    const auditsDoneTableTitle = document.createElement('div');
    auditsDoneTableTitle.id = 'auditsTableTitle';
    auditsDoneTableTitle.textContent = `Audits done`;
    auditsDoneTable.appendChild(auditsDoneTableTitle);

    const auditsDoneColumnsTitlesContainer = document.createElement('div');
    auditsDoneColumnsTitlesContainer.id = 'auditsDoneColumnsTitlesContainer';
    const projectNameColumnTitle = document.createElement('div');
    projectNameColumnTitle.id = 'projectNameColumnTitle';
    projectNameColumnTitle.textContent = 'Project';
    auditsDoneColumnsTitlesContainer.appendChild(projectNameColumnTitle);
    const xpColumnTitle = document.createElement('div');
    xpColumnTitle.id = 'xpColumnTitle';
    xpColumnTitle.textContent = 'XP';
    auditsDoneColumnsTitlesContainer.appendChild(xpColumnTitle);

    auditsDoneTable.appendChild(auditsDoneColumnsTitlesContainer);

    for (const upTransaction of upTransactions) {
        const auditsDoneTableElement = document.createElement('div');
        auditsDoneTableElement.id = 'tableElement';

        const auditName = upTransaction.path.substring(upTransaction.path.lastIndexOf('/') + 1);
        const projectName = document.createElement('div');
        projectName.id = 'projectName';
        projectName.textContent = upTransaction.attrs.reason ? xpTransaction.attrs.reason : auditName;
        auditsDoneTableElement.appendChild(projectName);

        const amountInfo = document.createElement('div');
        amountInfo.id = 'xpamount';
        amountInfo.textContent = `${(upTransaction.amount / 1000).toFixed(2)} kB`;
        auditsDoneTableElement.appendChild(amountInfo);

        auditsDoneTable.appendChild(auditsDoneTableElement);
    }
    return auditsDoneTable

}

export async function AuditsRecieved(userToken) {

    const userTransactions = await GetUserTransactions(userToken);
    const sortedUserTransactions = userTransactions.data.transaction.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const downTransactions = sortedUserTransactions.filter(transaction => transaction.type === "down" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));

    const auditsDoneTable = document.createElement('div');
    auditsDoneTable.id = 'auditsTableContainer';
    const auditsDoneTableTitle = document.createElement('div');
    auditsDoneTableTitle.id = 'auditsTableTitle';
    auditsDoneTableTitle.textContent = `Audits recieved`;
    auditsDoneTable.appendChild(auditsDoneTableTitle);

    const auditsDoneColumnsTitlesContainer = document.createElement('div');
    auditsDoneColumnsTitlesContainer.id = 'auditsDoneColumnsTitlesContainer';
    const projectNameColumnTitle = document.createElement('div');
    projectNameColumnTitle.id = 'projectNameColumnTitle';
    projectNameColumnTitle.textContent = 'Project';
    auditsDoneColumnsTitlesContainer.appendChild(projectNameColumnTitle);
    const xpColumnTitle = document.createElement('div');
    xpColumnTitle.id = 'xpColumnTitle';
    xpColumnTitle.textContent = 'XP';
    auditsDoneColumnsTitlesContainer.appendChild(xpColumnTitle);

    auditsDoneTable.appendChild(auditsDoneColumnsTitlesContainer);

    for (const downTransaction of downTransactions) {
        const auditsDoneTableElement = document.createElement('div');
        auditsDoneTableElement.id = 'tableElement';

        const auditName = downTransaction.path.substring(downTransaction.path.lastIndexOf('/') + 1);
        const projectName = document.createElement('div');
        projectName.id = 'projectName';
        projectName.textContent = downTransaction.attrs.reason ? xpTransaction.attrs.reason : auditName;
        auditsDoneTableElement.appendChild(projectName);

        const amountInfo = document.createElement('div');
        amountInfo.id = 'xpamount';
        amountInfo.textContent = `${(downTransaction.amount / 1000).toFixed(2)} kB`;
        auditsDoneTableElement.appendChild(amountInfo);

        auditsDoneTable.appendChild(auditsDoneTableElement);
    }
    return auditsDoneTable

}

async function BarGraph(userToken) {
    const barGraph = document.createElement('div');
    barGraph.id = 'barGraphContainer';
    const barGraphTitle = document.createElement('div');
    barGraphTitle.id = 'barGraphTitle';
    barGraphTitle.textContent = `XP per project`;
    barGraph.appendChild(barGraphTitle);

    const userTransactions = await GetUserTransactions(userToken);
    const sortedUserTransactions = userTransactions.data.transaction.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const xpTransactions = sortedUserTransactions.filter(transaction => transaction.type === "xp" && transaction.path.includes('/johvi/div-01') && !transaction.path.includes('piscine'));

    const formattedData = xpTransactions.map(transaction => {
        const pathSegments = transaction.path.split('/');
        const projectName = pathSegments[pathSegments.length - 1].replace(/-/g, ' '); 
        return { key: projectName, value: transaction.amount };
    });

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 190, left: 70 };

    // Create the SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Create scales
    const xScale = d3.scaleBand()
        .domain(formattedData.map(d => d.key))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Append bars
    formattedData.forEach(d => {
        const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bar.setAttribute("x", xScale(d.key));
        bar.setAttribute("y", yScale(d.value));
        bar.setAttribute("width", xScale.bandwidth());
        bar.setAttribute("height", height - margin.bottom - yScale(d.value));
        bar.setAttribute("fill", "blue");
        svg.appendChild(bar);
    });

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
    xAxis.setAttribute("transform", `translate(0,${height - margin.bottom + 10})`);

    formattedData.forEach(d => {
        const xTick = document.createElementNS("http://www.w3.org/2000/svg", "text");

        // Calculate the x position centered on the bar
        const xPos = xScale(d.key) + xScale.bandwidth() / 2;

        // Set text attributes
        xTick.setAttribute("x", xPos);
        xTick.setAttribute("y", 0);  
        xTick.setAttribute("text-anchor", "end");  
        xTick.setAttribute("fill", "white");  
        xTick.textContent = d.key;

        // Rotate around the label's own position
        xTick.setAttribute("transform", `rotate(270, ${xPos}, 0)`);

        // Append the label to the x-axis
        xAxis.appendChild(xTick);
    });

    svg.appendChild(xAxis);

    // Append y-axis
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
    yAxis.setAttribute("transform", `translate(${margin.left},0)`);
    const yTicks = yScale.ticks();
    yTicks.forEach(tick => {
        const yTick = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yTick.setAttribute("x", -5);
        yTick.setAttribute("y", yScale(tick));
        yTick.setAttribute("dy", "0.32em"); // Vertical alignment of the tick text
        yTick.setAttribute("text-anchor", "end");
        yTick.setAttribute("fill", "white"); // Set text color to white
        yTick.textContent = tick;
        yAxis.appendChild(yTick);

        const yLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yLine.setAttribute("x1", 0);
        yLine.setAttribute("x2", width - margin.left - margin.right);
        yLine.setAttribute("y1", yScale(tick));
        yLine.setAttribute("y2", yScale(tick));
        yLine.setAttribute("stroke", "#ccc");
        yAxis.appendChild(yLine);
    });
    svg.appendChild(yAxis);

    barGraph.appendChild(svg);
    return barGraph;
}
//-----------------------------------------------------------
export async function PieChart(userToken) {
    // Create the container for the pie chart
    const pieChart = document.createElement('div');
    pieChart.id = 'pieChartContainer';

    const pieChartTitle = document.createElement('div');
    pieChartTitle.id = 'pieChartTitle';
    pieChartTitle.textContent = `Grades per project`;
    pieChart.appendChild(pieChartTitle);

    // Fetch the grades data
    let gradesData = await GradesQuery(userToken);

    // Map and format the grades data
    const rawGrades = new Map();
    for (let i = 0; i < gradesData.data.progress.length; i++) {
        let project = gradesData.data.progress[i].path.substring(gradesData.data.progress[i].path.lastIndexOf('/') + 1);
        let grade = gradesData.data.progress[i].grade.toFixed(1);
        grade = parseFloat(grade);
        rawGrades.set(project, grade);
    }
    const grades = Array.from(rawGrades, ([key, value]) => ({ key, value }));

    // Calculate the total value for the pie chart
    const total = grades.reduce((sum, item) => sum + item.value, 0);

    // SVG dimensions
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    // Create the SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    // Create a group element to center the pie chart
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${width / 2}, ${height / 2})`);
    svg.appendChild(g);

    // Function to generate a random color for each slice
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Function to create an SVG path for a pie slice
    const createSlice = (startAngle, endAngle) => {
        const x1 = radius * Math.cos(startAngle);
        const y1 = radius * Math.sin(startAngle);
        const x2 = radius * Math.cos(endAngle);
        const y2 = radius * Math.sin(endAngle);
        const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

        return `
            M 0 0
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `;
    };

    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "3px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.display = "none";
    tooltip.style.zIndex = "1000";  
    document.body.appendChild(tooltip);

    // Create the pie slices and add hover events
    let startAngle = 0;
    grades.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", createSlice(startAngle, endAngle));
        path.setAttribute("fill", getRandomColor());

        // Add hover event to show key and value in the tooltip
        path.addEventListener("mouseover", (event) => {
            tooltip.innerHTML = `<strong>${item.key}:</strong> ${item.value}`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;
        });

        // Update tooltip position on mouse move
        path.addEventListener("mousemove", (event) => {
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;
        });

        // Hide tooltip when mouse leaves the slice
        path.addEventListener("mouseout", () => {
            tooltip.style.display = 'none';
        });

        g.appendChild(path);

        startAngle = endAngle;
    });
    pieChart.appendChild(svg);

    return pieChart;
}

export async function WelcomeContainer(userProfile) {
    const welcomeInfoContainer = document.createElement('div');
    welcomeInfoContainer.id = 'welcomeInfoContainer';

    const firstName = userProfile.data.user[0].attrs.firstName

    const welcomeInfo = document.createElement('div');
    welcomeInfo.id = 'welcomeInfo';
    welcomeInfo.textContent = `Welcome, ${firstName}!`;
    welcomeInfoContainer.appendChild(welcomeInfo);

    return welcomeInfoContainer;
}

export async function CreateProfileContainer(userProfile) {
    const profileContainer = document.createElement('div');
    profileContainer.id = 'profileContainer';

    const profileTitle = document.createElement('div');
    profileTitle.id = 'profileTitle';
    profileTitle.textContent = 'Profile';
    profileContainer.appendChild(profileTitle);

    const loginName = document.createElement('div');
    loginName.id = 'loginName';
    loginName.textContent = 'Login: ' + userProfile.data.user[0].login;
    profileContainer.appendChild(loginName);

    const email = document.createElement('div');
    email.id = 'email';
    email.textContent = 'Email: ' + userProfile.data.user[0].attrs.email;
    profileContainer.appendChild(email);

    const telephone = document.createElement('div');
    telephone.id = 'telephone';
    telephone.textContent = 'Telephone: ' + userProfile.data.user[0].attrs.tel;
    profileContainer.appendChild(telephone);

    const addressCountry = document.createElement('div');
    addressCountry.id = 'addressCountry';
    addressCountry.textContent = 'Country: ' + userProfile.data.user[0].attrs.addressCountry;
    profileContainer.appendChild(addressCountry);

    return profileContainer;
}