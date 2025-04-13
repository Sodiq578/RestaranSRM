import React, { useContext } from "react";
import ReportTable from "../components/ReportTable";
import { AppContext } from "../context/AppContext";

function Reports() {
  const { ordersHistory } = useContext(AppContext);

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "28px",
        }}
      >
        Hisobotlar
      </h1>
      <ReportTable orders={ordersHistory} />
    </div>
  );
}

export default Reports;