
let allData = [];

let officeChart;
let serviceChart;


fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSm2E2NtnS0wKaXZw4SQzJxXn9jrCuDDfetKCQfoUnsFz2TXYetnWGZTyagdFzkSzQ-z7q41rjbZR1F/pub?output=csv")

.then(response => response.text())

.then(data => {

    const lines =
        data.trim().split("\n");


    allData =
        lines.slice(1).map(line => {

        const cols =
            line.split(",");


        return {

            service:
                cols[0]?.trim(),

            applicant:
                cols[1]?.trim(),

            ack:
                cols[2]?.trim(),

            pendingAt:
                cols[3]?.trim(),

            role:
                cols[4]?.trim(),

            office:
                cols[5]?.trim(),

            submissionDate:
                cols[6]?.trim()
        };
    });


    renderTable(allData);

    updateSummary(allData);

    createCharts(allData);

    updateLastUpdated();
});


// Render Table

function renderTable(data){

    let tbody =
        document.querySelector(
            "#reportTable tbody"
        );

    tbody.innerHTML = "";


    data.forEach(item => {

        let pendingDays =
            calculateDays(
                item.submissionDate
            );

        let tr =
            document.createElement("tr");


        if(pendingDays > 30){

            tr.classList.add("redRow");
        }

        else if(pendingDays > 7){

            tr.classList.add("orangeRow");
        }

        else{

            tr.classList.add("greenRow");
        }


        tr.innerHTML = `

            <td>${item.service}</td>

            <td>${item.applicant}</td>

            <td>${item.ack}</td>

            <td>${item.pendingAt}</td>

            <td>${item.role}</td>

            <td>${item.office}</td>

            <td>${item.submissionDate}</td>

            <td>${pendingDays}</td>

        `;

        tbody.appendChild(tr);
    });
}


// Pending Days

function calculateDays(dateStr){

    let parts =
        dateStr.split("-");

    let day =
        parseInt(parts[0]);

    let month =
        parseInt(parts[1]) - 1;

    let year =
        parseInt(parts[2]);

    let submitDate =
        new Date(year, month, day);

    let today =
        new Date();

    let diff =
        today - submitDate;

    return Math.floor(
        diff / (1000 * 60 * 60 * 24)
    );
}


// Summary Cards

function updateSummary(data){

    document.getElementById(
        "totalPending"
    ).innerText = data.length;


    let above30 =
        data.filter(d =>
            calculateDays(d.submissionDate) > 30
        ).length;


    let below30 =
        data.filter(d =>
            calculateDays(d.submissionDate) <= 30
        ).length;


    let offices =
        new Set(data.map(d => d.office));


    document.getElementById(
        "above30"
    ).innerText = above30;


    document.getElementById(
        "below30"
    ).innerText = below30;


    document.getElementById(
        "totalOffices"
    ).innerText = offices.size;
}

// Charts

function createCharts(data){

    let officeCounts = {};

    let serviceCounts = {};


    data.forEach(item => {

        officeCounts[item.office] =
            (officeCounts[item.office] || 0) + 1;

        serviceCounts[item.service] =
            (serviceCounts[item.service] || 0) + 1;
    });



    // Office Chart

    if(officeChart){

        officeChart.destroy();
    }

    officeChart = new Chart(

        document.getElementById("officeChart"),

        {

            type:"bar",

            data:{

                labels:Object.keys(officeCounts),

                datasets:[{

                    label:"Office Wise Pending",

                    data:Object.values(officeCounts)
                }]
            }
        }
    );



    // Service Chart

    if(serviceChart){

        serviceChart.destroy();
    }

    serviceChart = new Chart(

        document.getElementById("serviceChart"),

        {

            type:"pie",

            data:{

                labels:Object.keys(serviceCounts),

                datasets:[{

                    data:Object.values(serviceCounts)
                }]
            }
        }
    );
}







// Last Updated

function updateLastUpdated(){

    let now =
        new Date();

    document.getElementById(
        "lastUpdated"
    ).innerText =
        "Last Updated: " +
        now.toLocaleString();
}

// Filters

function applyFilters(){

    let service =
        document.getElementById(
            "serviceFilter"
        )
        .value
        .toLowerCase();


    let office =
        document.getElementById(
            "officeFilter"
        )
        .value
        .toLowerCase();


    let pendingAt =
        document.getElementById(
            "pendingFilter"
        )
        .value
        .toLowerCase();


    let days =
        document.getElementById(
            "daysFilter"
        )
        .value;



    let filtered =
        allData.filter(item => {

        let pendingDays =
            calculateDays(
                item.submissionDate
            );


        return (

            (
                service === ""

                ||

                item.service
                .toLowerCase()
                .includes(service)
            )

            &&

            (
                office === ""

                ||

                item.office
                .toLowerCase()
                .includes(office)
            )

            &&

            (
                pendingAt === ""

                ||

                item.pendingAt
                .toLowerCase()
                .includes(pendingAt)
            )

            &&

            (

                days === ""

                ||

                (
                    days === "above30"

                    &&

                    pendingDays > 30
                )

                ||

                (
                    days === "below30"

                    &&

                    pendingDays <= 30
                )
            )
        );
    });



    renderTable(filtered);

    updateSummary(filtered);

    createCharts(filtered);
}






// Event Listeners

document
.querySelectorAll("input,select")
.forEach(element => {

    element.addEventListener(
        "input",
        applyFilters
    );

    element.addEventListener(
        "change",
        applyFilters
    );
});




// Auto Refresh every 30 sec

setInterval(() => {

    location.reload();

}, 30000);