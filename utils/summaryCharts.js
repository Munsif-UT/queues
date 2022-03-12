const months = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "November",
  "December",
];
const timeSpan = Object.freeze({
  tommorow: "tomorrow",
  nextWeek: "next-week",
  nextMonth: "next-month",
  nextYear: "next-year",
});
export const divideByPolicy = (key, array) => {
  switch (key) {
    case timeSpan.nextYear:
      return divideIntoMonths(array);

    default:
      return [...array];
  }
};

const divideIntoMonths = (chartData) => {
  let newchartData = [];
  let chartDataCopy = [...chartData];

  chartData.forEach((ele, i) => {
    const dateOfthis = new Date(ele.date);
    const month = dateOfthis.getMonth();
    let newElementToPush = { ...ele };
    let elementsToRemove = [];
    for (let j = 0; j < chartDataCopy.length; j++) {
      const eleMonth = new Date(chartDataCopy[j].date).getMonth();

      if (month === eleMonth) {
        newElementToPush = {
          ...newElementToPush,
          Revenue: newElementToPush.Revenue + chartDataCopy[j].Revenue,
          Sales: newElementToPush.Sales + chartDataCopy[j].Sales,
          month: months[month],
          totalAmount:
            parseFloat(newElementToPush.totalAmount) +
            parseFloat(chartDataCopy[j].totalAmount),
          list: [...newElementToPush.list, ...chartDataCopy[j].list],
        };
        elementsToRemove.push(chartDataCopy[j]);
      }
    }
    if (elementsToRemove.length) {
      newchartData.push(newElementToPush);
      chartDataCopy = chartDataCopy.filter((item) => !elementsToRemove.includes(item));
    }
  });
  if (newchartData.length && newchartData.length < 12) {
    const firstDate = new Date(newchartData[0].date);
    const lastDate = new Date(newchartData[newchartData.length - 1].date);
    const firstMonth = firstDate.getMonth();
    const lastMonth = lastDate.getMonth();

    if (firstMonth > 0) {
      let arr = [];
      for (let j = 0; j < firstMonth; j++) {
        firstDate.setMonth(j);
        let el = {
          Revenue: 0,
          Sales: 0,
          list: [],
          totalAmount: 0,
          totalTax: 0,
          date: firstDate,
          _id: firstDate,
          month: months[j],
        };
        arr.push(el);
      }
      newchartData = [...arr, ...newchartData];
    }

    if (lastMonth < 11) {
      for (let j = lastMonth + 1; j < 12; j++) {
        lastDate.setMonth(j);
        let el = {
          Revenue: 0,
          Sales: 0,
          list: [],
          totalAmount: 0,
          totalTax: 0,
          date: lastDate,
          _id: lastDate,
          month: months[j],
        };
        newchartData.push(el);
      }
    }
  }
  return newchartData;
};

const divideIntoHours = (chartData) => {
  const item = chartData[0];
  const list = item.list;
  let newChartData = [];
};
