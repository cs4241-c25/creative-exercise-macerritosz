const marginTop = 30;
const marginRight = 0;
const marginBottom = 10;
const marginLeft = 150;
const width = 1500;
const height = 5000;

const svgContainer = d3.select('#chart')  //append to chart div
    .style("width", "100%")  // chart div full width
    .style("height", "100vh") // chart div full view
    .style("overflow", "auto"); // lets you scroll if greater than full view

// Create the SVG container
const svg = svgContainer.append('svg')
    .attr('width', width + marginLeft + marginRight)
    .attr('height', height + marginTop + marginBottom)
    .append('g')
    .attr('transform', `translate(${marginLeft},${marginTop})`);

// Fetch data from the API
fetch('https://www.govtrack.us/api/v2/role?current=true&role_type=senator')
    .then(res => res.json())
    .then(data => {
        console.log(data); //Check if all data was gotten

        const calcAge = (birthday) => {
            const birthdayDate = new Date(birthday);
            const today = new Date();
            const age = today.getFullYear() - birthdayDate.getFullYear();
            const month = today.getMonth() - birthdayDate.getMonth();
            // If their birthday hasn't occurred yet this year, subtract 1 from the age
            if (month < 0 || (month === 0 && today.getDate() < birthdayDate.getDate())) {
                return age - 1;
            }
            return age;
        };

        // Map through the objects and get the age based on the person's birthday
        const ages = data.objects.map(d => calcAge(d.person.birthday));  // acccesed w/ d.person.birthday
        const barHeight = Math.max(25, (height/1.25) / data.objects.length);
        console.log(ages);  // Show ages list

        const x = d3.scaleLinear()
            .domain([30, d3.max(ages)])  // Pass the array of ages directly, min is min age to be US senator
            .range([0, width - marginLeft - marginRight]);

        const y = d3.scaleBand()
            .domain(d3.sort(data.objects, d => -calcAge(d.person.birthday)).map(d => d.person.name)) // Sort by age
            .rangeRound([marginTop, height - marginBottom])
            .padding(0.1);

        // Create a value format
        const format = x.tickFormat(20, "%");

        // Append rects for each senator
        svg.append("g")
            .attr("fill", "steelblue")
            .attr("text-anchor", "end")
            .selectAll()
            .data(data.objects)
            .join("rect")
            .style("font-size", "16px")
            .attr("x", marginLeft)
            .attr("y", (d) => y(d.person.name))
            .attr("width", d => x(calcAge(d.person.birthday))) // Width is based on  age
            .attr("height", barHeight); // Set the height of each bar to barHeight

        // Append labels for each senator
        svg.append("g")
            .attr("fill", "white")
            .attr("text-anchor", "end")
            .selectAll()
            .data(data.objects)
            .join("text")
            .attr("x", d => x(calcAge(d.person.birthday)) + 50)
            .attr("y", d => y(d.person.name) + y.bandwidth() / 2)
            .attr("dy", +2.5)
            .text(d => `(${calcAge(d.person.birthday)})`);

        // Create the axes
        svg.append("g")
            .style("font-size", "14px")
            .attr("transform", `translate(${marginLeft},${marginTop})`)
            .call(d3.axisTop(x).ticks(10)) // Display 10 ticks for the x-axis
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .style("font-size", "14px")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0));
    });
