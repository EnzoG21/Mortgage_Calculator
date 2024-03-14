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

    // Function to generate data for the repayment schedule
    function generateRepaymentData(principal, numOfPayments, interestRate) {
        const labels = [];
        const interestPayments = [];
        const principalPayments = [];
        const remainingBalances = [];

        let remainingPrincipal = principal;
        for (let i = 1; i <= numOfPayments; i++) {
            const interestPayment = remainingPrincipal * interestRate;
            const principalPayment = monthlyPayment(principal, numOfPayments, interestRate) - interestPayment;

            remainingPrincipal -= principalPayment;

            // Add data to arrays
            labels.push(`Month ${i}`);
            interestPayments.push(interestPayment);
            principalPayments.push(principalPayment);
            remainingBalances.push(remainingPrincipal);
        }

        return {
            labels: labels,
            interestPayments: interestPayments,
            principalPayments: principalPayments,
            remainingBalances: remainingBalances
        };
    }

    // Function to render the repayment schedule graph
    function renderRepaymentGraph(data) {
        const ctx = document.getElementById('repayment-chart').getContext('2d');
        new Chart(ctx, {
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

        // Populate table rows with data
        for (let i = 0; i < data.labels.length; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.labels[i]}</td>
                <td>${formatter.format(data.interestPayments[i])}</td>
                <td>${formatter.format(data.principalPayments[i])}</td>
                <td>${formatter.format(data.remainingBalances[i])}</td>
            `;
            tbody.appendChild(row);
        }
    }

    // Event listener for form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

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
});
