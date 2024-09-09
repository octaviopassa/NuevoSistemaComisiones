import React, { useEffect, useRef } from "react";
import $ from "jquery";

// Asegúrate de que jQuery esté disponible globalmente antes de importar "flot"
window.$ = window.jQuery = $;
require("flot");
require("flot-pie");
require("jquery.flot.tooltip");

const FlotChart = ({ data, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data.length > 0 && options) {
      $.plot($(chartRef.current), data, options);
    }
  }, [data, options]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "240px",
        padding: "0px",
        position: "relative",
      }}
    ></div>
  );
};

export default FlotChart;
