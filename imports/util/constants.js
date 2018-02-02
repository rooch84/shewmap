export const npuColours = ["#197F8E", "#B33355", "#02B395",  "#A3CD00", "#FF6529",  "#1E425C", "#E62A3D", "#FFBA00"];

export const processScaleTypes = [ {id: "global", name: "Global crime count"}, {id: "globalVar", name: "Global variance"},
{id: "local", name: "Local range"}];//,{id: "volume", name: "Global crime volume"}];

export const exampleDatasets = {
  stop: {
    id: "stop",
    name: "West Midlands Stop and Search",
    fileName: "data/stopAndSearch.csv.gz",
    date: "Date",
    npu: "NPU_code",
    neighbourhood: "neighbourhood",
    aggregateBy: "month",
  },
  crime: {
    id: "crime",
    name: "West Midlands Crime",
    fileName: "data/crime_subset.csv.gz",
    date: "Date",
    npu: "NPU_code",
    neighbourhood: "neighbourhood",
    aggregateBy: "month",
  },
}

export const dateAggregations = {
  hour: {
    format: "%Y-%m-%d %H:00",
    field: "__Hour",
    name: "Hour",
    id: "hour",
    inc: d => {return d.setHours(d.getHours()+1);}
  },
  day: {
    format: "%Y-%m-%d",
    field: "__Day",
    name: "Day",
    id: "day",
    inc: d => {return d.setDate(d.getDay()+1);}
  },
  month: {
    format: "%Y-%m",
    field: "__Month",
    name: "Month",
    id: "month",
    inc: d => {return d.setMonth(d.getMonth()+1);}
  },
  year: {
    format: "%Y",
    field: "__Year",
    name: "Year",
    id: "year",
    inc: d => {return d.setYear(d.getYear()+1);}
  }
}

export const dateFormat = "%d/%m/%Y %H:%M:%S";
export const defaultFormat = dateAggregations.day;
