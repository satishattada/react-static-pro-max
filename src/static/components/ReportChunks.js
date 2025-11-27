// @flow

import React from "react";
import PropTypes from "prop-types";
import ReportContext from "./context";

export default class ReportChunks extends React.Component {
  static propTypes = {
    report: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      report: props.report,
    };
  }

  render() {
    return (
      <ReportContext.Provider value={this.state}>
        {this.props.children}
      </ReportContext.Provider>
    );
  }
}
