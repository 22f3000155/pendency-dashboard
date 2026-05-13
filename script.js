let allData = [];

let officeChart;
let serviceChart;




// ==========================
// SERVICE TIME LIMITS
// ==========================

function getServiceLimit(service){

    service = service.toLowerCase();


    if(service.includes("permanent resident")){
        return 14;
    }

    if(service.includes("birth")){
        return 10;
    }

    if(service.includes("death")){
        return 10;
    }

    if(service.includes("caste")){
        return 30;
    }

    if(service.includes("gorkha")){
        return 30;
    }

    if(service.includes("income")){
        return 10;
    }

    if(service.includes("non creamy")){
        return 30;
    }

    if(service.includes("next of kin")){
        return 30;
    }

    if(service.includes("fairs")){
        return 10;
    }

    if(service.includes("senior citizen")){
        return 30;
    }


    return 30;
}





// ==========================
// FETCH DATA
// ==========================

fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSm2E2NtnS0wKaXZw4SQzJxXn9jrCuDDfetKCQfoUnsFz2TXYetnWGZTyagdFzkSzQ-z7q41rjbZR1F/pub?output=csv")

.then(response => response.text())

.then(data => {

    const lines = data.trim().split("\n");


    allData = lines.slice(1).map(line => {

        const cols = line.split(",");

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





// ==========================
// CALCULATE PENDING DAYS
// ==========================

function calculateDays(dateStr){

    if(!dateStr){
        return 0;
    }

    let parts = dateStr.split("-");

    let day = parseInt(parts[0]);

    let month = parseInt(parts[1]) - 1;

    let year = parseInt(parts[2]);

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





// ==========================
// RENDER TABLE
// ==========================

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


        let limit =
            getServiceLimit(item.service);


        let exceededBy =
            pendingDays - limit;


        let tr =
            document.createElement("tr");


        if(pendingDays > limit){

            tr.classList.add("redRow");
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

            <td>${limit}</td>

            <td>

                ${
                    exceededBy > 0
                    ?
                    exceededBy + " Days"
                    :
                    "Within Limit"
                }

            </td>
        `;

        tbody.appendChild(tr);
    });
}





// ==========================
// SUMMARY CARDS
// ==========================

function updateSummary(data){

    document.getElementById(
        "totalPending"
    ).innerText = data.length;


    let exceeded =
        data.filter(d => {

            let pendingDays =
                calculateDays(
                    d.submissionDate
                );

            let limit =
                getServiceLimit(d.service);

            return pendingDays > limit;

        }).length;


    let withinLimit =
        data.filter(d => {

            let pendingDays =
                calculateDays(
                    d.submissionDate
                );

            let limit =
                getServiceLimit(d.service);

            return pendingDays <= limit;

        }).length;


    let offices =
        new Set(
            data.map(d => d.office)
        );


    document.getElementById(
        "above30"
    ).innerText = exceeded;


    document.getElementById(
        "below30"
    ).innerText = withinLimit;


    document.getElementById(
        "totalOffices"
    ).innerText = offices.size;
}





// ==========================
// CHARTS
// ==========================

function createCharts(data){

    let officeCounts = {};

    let serviceCounts = {};


    data.forEach(item => {

        officeCounts[item.office] =
            (officeCounts[item.office] || 0) + 1;

        serviceCounts[item.service] =
            (serviceCounts[item.service] || 0) + 1;
    });



    // SORT OFFICE DATA

    let sortedOffice =
        Object.entries(officeCounts)

        .sort((a,b) => b[1] - a[1])

        .slice(0,10);


    let officeLabels =
        sortedOffice.map(item => item[0]);

    let officeValues =
        sortedOffice.map(item => item[1]);



    // SERVICE DATA

    let serviceLabels =
        Object.keys(serviceCounts);

    let serviceValues =
        Object.values(serviceCounts);




    // DESTROY OLD CHARTS

    if(officeChart){

        officeChart.destroy();
    }

    if(serviceChart){

        serviceChart.destroy();
    }





    // ==========================
    // OFFICE BAR CHART
    // ==========================

    officeChart = new Chart(

        document.getElementById("officeChart"),

        {

            type:"bar",

            data:{

                labels:officeLabels,

                datasets:[{

                    label:"Pending Cases",

                    data:officeValues,

                    backgroundColor:
                    "rgba(54, 162, 235, 0.7)",

                    borderColor:
                    "rgba(54, 162, 235, 1)",

                    borderWidth:1,

                    borderRadius:8
                }]
            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                animation:{
                    duration:1200
                },

                interaction:{
                    mode:"index",
                    intersect:false
                },

                plugins:{

                    legend:{
                        display:false
                    },

                    title:{
                        display:true,
                        text:"Top 10 Office Wise Pendency"
                    }
                },

                scales:{

                    x:{

                        ticks:{
                            maxRotation:45,
                            minRotation:45
                        }
                    },

                    y:{
                        beginAtZero:true
                    }
                }
            }
        }
    );






    // ==========================
    // SERVICE DOUGHNUT CHART
    // ==========================

    serviceChart = new Chart(

        document.getElementById("serviceChart"),

        {

            type:"doughnut",

            data:{

                labels:serviceLabels,

                datasets:[{

                    data:serviceValues,

                    backgroundColor:[

                        "#36A2EB",
                        "#FF6384",
                        "#4BC0C0",
                        "#FFCE56",
                        "#9966FF",
                        "#FF9F40",
                        "#8BC34A",
                        "#E91E63",
                        "#009688",
                        "#795548"
                    ],

                    borderWidth:1
                }]
            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                animation:{
                    duration:1200
                },

                interaction:{
                    mode:"index",
                    intersect:false
                },

                plugins:{

                    legend:{
                        position:"bottom"
                    },

                    title:{
                        display:true,
                        text:"Service Wise Pendency"
                    }
                }
            }
        }
    );
}





// ==========================
// LAST UPDATED
// ==========================

function updateLastUpdated(){

    let now = new Date();

    document.getElementById(
        "lastUpdated"
    ).innerText =
        "Last Updated: " +
        now.toLocaleString();
}





// ==========================
// FILTERS
// ==========================

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


        let limit =
            getServiceLimit(item.service);


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

                    pendingDays > limit
                )

                ||

                (
                    days === "below30"

                    &&

                    pendingDays <= limit
                )
            )
        );
    });



    renderTable(filtered);

    updateSummary(filtered);

    createCharts(filtered);
}





// ==========================
// DOWNLOAD CSV
// ==========================

document.getElementById(
    "downloadBtn"
)
.addEventListener("click", () => {

    let rows = [];


    rows.push([

        "Service",
        "Applicant",
        "ACK",
        "Pending At",
        "Role",
        "Office",
        "Submission Date",
        "Pending Days",
        "Limit",
        "Exceeded By"
    ]);


    document
    .querySelectorAll("#reportTable tbody tr")

    .forEach(tr => {

        let cols = [];

        tr.querySelectorAll("td")

        .forEach(td => {

            cols.push(td.innerText);
        });

        rows.push(cols);
    });


    let csvContent =
        rows.map(e => e.join(","))
        .join("\n");


    let blob =
        new Blob(
            [csvContent],
            { type:"text/csv" }
        );

    let url =
        URL.createObjectURL(blob);

    let a =
        document.createElement("a");

    a.href = url;

    a.download =
        "pendency_report.csv";

    a.click();

    URL.revokeObjectURL(url);
});





// ==========================
// EVENT LISTENERS
// ==========================

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





// ==========================
// AUTO REFRESH
// ==========================

setInterval(() => {

    location.reload();

}, 30000);