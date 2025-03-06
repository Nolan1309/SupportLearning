import React from "react";
import NavExample from "./Components/NavExample";
import ContentExample from "./Components/ContentExample";

function Example() {
  return (
    <section className="main-content main-margin" style={{ height: "auto !important", marginTop: "10px" }}>
      <div className="container" style={{ height: "auto !important" }}>
        <div className="row" style={{ height: "auto !important" }}>
          <NavExample />
          <ContentExample />
        </div>
      </div>
    </section>
  );
}

export default Example;
