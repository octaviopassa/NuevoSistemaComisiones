import React from "react";
import "../../../../client/stylesheets/panels.css";

const Panel = ({ id, title, content, className, children }) => (
  <div id={id} className={`panel`}>
    <div className={`panel-hdr ${className}`}>
      <h2>{title}</h2>
    </div>
    <div className="panel-container show">
      <div className="panel-content">
        {content}
        {children}
      </div>
    </div>
  </div>
);

export default Panel;
