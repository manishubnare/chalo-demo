import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { get, map } from "lodash";
import moment from "moment";

const generatePdf = (routesData) => {
  const newDoc = new jsPDF();
  const tableCoumns = [
    {
      header: "Route ID",
      dataKey: "routeId",
    },
    {
      header: "Route Name",
      dataKey: "routeName",
    },
    {
      header: "Route Direction",
      dataKey: "routeDirection",
    },
    {
      header: "Route Status",
      dataKey: "routeStatus",
    },
    {
      header: "Stop Details",
      dataKey: "routeStops",
    },
  ];

  const tableBody = map(routesData, (data) => {
    let allstopDetails = "";
    const stopsData = get(data, "routeStops", []);
    map(stopsData, ({ stopName, stopLat, stopLong }) => {
      const stopDetails = `${stopName} (${stopLat}, ${stopLong}) `;
      allstopDetails += stopDetails;
    });

    return {
      routeId: get(data, "routeId", ""),
      routeName: get(data, "routeName", ""),
      routeDirection: get(data, "routeDirection", ""),
      routeStatus: get(data, "routeStatus", ""),
      routeStops: allstopDetails,
    };
  });

  const todayDate = moment().format("DD/MM/YYYY");
  autoTable(newDoc, {
    body: tableBody,
    columns: tableCoumns,
    startY: 20,
  });
  newDoc.text("All Routes and their stops", 14, 15);
  newDoc.save(`route_detail_${todayDate}.pdf`);
};

export default generatePdf;
