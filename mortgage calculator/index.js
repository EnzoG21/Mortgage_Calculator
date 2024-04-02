document.addEventListener("DOMContentLoaded", function() {
    // Initialize formatter for currency formatting
    const formatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
    });

    // Select DOM elements
    const form = document.querySelector(".form");
    const paymentAmount = document.querySelector(".payment-amount");
    const repaymentTable = document.getElementById("repayment-table");
    const graphSection = document.querySelector(".graph");
    const tableSection = document.querySelector(".schedule");
    let repaymentChart; // Declare repaymentChart variable
    let showMoreButton; // Declare showMoreButton variable

    // Function to generate data for the repayment schedule
    function generateRepaymentData(principal, numOfPayments, interestRate) {
        const labels = [];
        const totalPayments = [];
        const remainingBalances = [];

        let remainingPrincipal = principal;
        for (let i = 1; i <= numOfPayments; i++) {
            const totalPayment = monthlyPayment(principal, numOfPayments, interestRate);

            const interestPayment = totalPayment / 2;
            const principalPayment = totalPayment / 2;

            remainingPrincipal -= principalPayment;

            // Add data to arrays
            labels.push(`Month ${i}`);
            totalPayments.push(totalPayment);
            remainingBalances.push(remainingPrincipal);
        }

        return {
            labels: labels,
            interestPayments: totalPayments.map(payment => payment / 2),
            principalPayments: totalPayments.map(payment => payment / 2),
            remainingBalances: remainingBalances
        };
    }

    // Function to render the repayment schedule graph
    function renderRepaymentGraph(data) {
        if (repaymentChart) {
            // If repaymentChart exists, destroy it
            repaymentChart.destroy();
        }
        const ctx = document.getElementById('repayment-chart').getContext('2d');
        repaymentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Interest Payment',
                        data: data.interestPayments,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Principal Payment',
                        data: data.principalPayments,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Remaining Balance',
                        data: data.remainingBalances,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Months'
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'Amount'
                        }
                    }
                }
            }
        });
    }

    // Function to calculate monthly payment
    function monthlyPayment(principal, numOfPayments, interestRate) {
        if (interestRate === 0) {
            return principal / numOfPayments;
        }
        return (principal * interestRate * Math.pow(1 + interestRate, numOfPayments)) /
            (Math.pow(1 + interestRate, numOfPayments) - 1);
    }

    // Function to populate the repayment table
    function populateRepaymentTable(data) {
        const tbody = repaymentTable.querySelector('tbody');
        tbody.innerHTML = '';

        // Populate only the first row
        const firstRow = document.createElement('tr');
        firstRow.innerHTML = `
            <td>${data.labels[0]}</td>
            <td>${formatter.format(data.interestPayments[0])}</td>
            <td>${formatter.format(data.principalPayments[0])}</td>
            <td>${formatter.format(data.remainingBalances[0])}</td>
        `;
        tbody.appendChild(firstRow);

        // Add a button to show the rest of the rows
        showMoreButton = document.createElement('button');
        showMoreButton.textContent = 'Show More';
        showMoreButton.classList.add('show-more-button');
        showMoreButton.addEventListener('click', function() {
            // Populate the rest of the rows
            for (let i = 1; i < data.labels.length; i++) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.labels[i]}</td>
                    <td>${formatter.format(data.interestPayments[i])}</td>
                    <td>${formatter.format(data.principalPayments[i])}</td>
                    <td>${formatter.format(data.remainingBalances[i])}</td>
                `;
                tbody.appendChild(row);
            }
            // Hide the show more button
            showMoreButton.style.display = 'none';
        });
        // Append button after the table
        tbody.parentNode.parentNode.appendChild(showMoreButton);
    }

    // Event listener for form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Hide the form
        form.style.display = "none";

        // Retrieve form inputs
        const housePrice = parseInt(document.getElementById('house-price').value);
        const deposit = parseInt(document.getElementById('deposit').value);
        const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 / 12;
        const mortgageTerm = parseInt(document.getElementById('mortgage-term').value) * 12;
        const principal = housePrice - deposit;

        // Generate repayment data
        const repaymentData = generateRepaymentData(principal, mortgageTerm, interestRate);

        // Render repayment graph and populate table
        renderRepaymentGraph(repaymentData);
        populateRepaymentTable(repaymentData);

        // Calculate and display monthly mortgage payment
        const monthlyMortgagePayment = monthlyPayment(principal, mortgageTerm, interestRate).toFixed(2);
        const formattedPayment = formatter.format(monthlyMortgagePayment);
        paymentAmount.textContent = `${formattedPayment}`;

        // Show graph and table sections
        graphSection.style.display = "block";
        tableSection.style.display = "block";
    });

    // Add event listener for the restart button
    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", function() {
        // Show the form
        form.style.display = "block";
        // Hide graph and table sections
        graphSection.style.display = "none";
        tableSection.style.display = "none";
        // Reset form inputs
        form.reset();
        // Clear the graph
        if (repaymentChart) {
            repaymentChart.destroy();
        }
        // Clear the table
        const tbody = repaymentTable.querySelector('tbody');
        tbody.innerHTML = '';
        // Clear the payment amount
        paymentAmount.textContent = '';
        // Clear the "Show More" button
        if (showMoreButton) {
            showMoreButton.style.display = 'none';
        }
    });
});
