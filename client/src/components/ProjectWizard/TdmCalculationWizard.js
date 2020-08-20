import React, { useEffect, useContext, useState } from "react";
import PropTypes from "prop-types";
import ToastContext from "../../contexts/Toast/ToastContext";
import { createUseStyles } from "react-jss";
import clsx from "clsx";
import ProjectSummary from "./WizardPages/ProjectSummary";
import SidebarPointsPanel from "./SidebarPoints/SidebarPointsPanel";
import NavButton from "./NavButton";
import SwitchViewButton from "../SwitchViewButton";
import Sidebar from "../Sidebar";
import { Switch, Route, withRouter } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faAngleLeft,
  faAngleRight
} from "@fortawesome/free-solid-svg-icons";
import {
  ProjectDescriptions,
  // ProjectUse,
  ProjectSpecifications,
  ProjectTargetPoints,
  ProjectMeasures
} from "./WizardPages";
import * as projectService from "../../services/project.service";
import moment from "moment";

const useStyles = createUseStyles({
  root: {
    flex: "1 1 auto",
    display: "flex",
    flexDirection: "row"
  },
  "@media (max-width:768px)": {
    root: {
      flexDirection: "column"
    }
  },
  sidebarOverlay: {
    position: "absolute",
    background: "rgba(0, 46, 109, 0.65)",
    height: "100%",
    width: "100%",
    zIndex: 0
  },
  sidebarContent: {
    zIndex: 1,
    display: "flex",
    position: "sticky",
    top: 0,
    height: "calc(100vh - 103px)",
    flexDirection: "column",
    "@media (max-width:768px)": {
      height: "auto"
    }
  },
  contentContainer: {
    justifyContent: "space-around",
    boxSizing: "border-box",
    overflow: "auto"
  },
  buttonWrapper: {
    textAlign: "center"
  },
  navButtonsWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "2em 0"
  },
  unSelectContainer: {
    display: "grid",
    gridTemplateColumns: "[h-start] 20% [h-mid] auto [h-end] 20%",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative"
  },
  unSelectButton: {
    marginLeft: "auto",
    marginRight: "1em",
    gridColumn: "h-end",
    backgroundColor: "transparent",
    border: "0",
    cursor: "pointer",
    textDecoration: "underline"
  },
  alignMid: {
    gridColumn: "h-mid",
    display: "flex",
    justifyContent: "center"
  },
  buttonContainer: {
    marginTop: "5px"
  },
  lastSaved: {
    fontSize: "14px",
    color: "#6F6C64"
  },
  lastSavedContainer: {
    margin: "0 auto"
  },
  navArrow: {
    marginTop: "6px"
  }
});

const TdmCalculationWizard = props => {
  const [dateModified, setDateModified] = useState("");

  useEffect(() => {
    const getDateModified = async () => {
      try {
        const result = await projectService.get();
        const currentProject = result.data.filter(
          project => project.id === projectId
        );
        let lastSaved = currentProject[0].dateModified;
        lastSaved = moment(lastSaved).format("MM/DD/YYYY h:mm A");
        setDateModified(lastSaved);
      } catch (err) {
        console.error(err);
      }
    };

    if (projectId) getDateModified();
  });

  const context = useContext(ToastContext);
  const classes = useStyles();
  const {
    rules,
    onInputChange,
    onCommentChange,
    onUncheckAll,
    filters,
    onPkgSelect,
    resultRuleCodes,
    account,
    loginId,
    onSave,
    onViewChange,
    //pageNo,
    history,
    match
  } = props;
  const page = Number(match.params.page);
  const projectId = Number(match.params.projectId);

  useEffect(() => {
    if (!projectId) {
      history.push("/calculation/1/");
    } else if (
      projectId &&
      account &&
      (account.isAdmin || account.id === loginId)
    ) {
      // Project Calculation is editable if it is not saved
      // or the project was created by the current logged in
      // user, or the logged in user is admin.
      history.push(`/calculation/1/${projectId ? projectId : ""}`);
    } else {
      // read-only users can only see the summary page.
      history.push(`/calculation/6/${projectId}`);
      // setPage(6);
    }
  }, [projectId, account, loginId, history]);

  const projectDescriptionRules =
    rules && rules.filter(filters.projectDescriptionRules);
  const landUseRules = rules && rules.filter(filters.landUseRules);
  const specificationRules = rules && rules.filter(filters.specificationRules);
  const targetPointRules = rules && rules.filter(filters.targetPointRules);
  const strategyRules = rules && rules.filter(filters.strategyRules);
  const resultRules =
    rules &&
    rules.filter(rule => resultRuleCodes.includes(rule.code) && rule.display);

  // Disable the page navigation buttons if page-specific rules are not satisfied
  let disablePageNavigation = false;
  if (
    page === 1 &&
    projectDescriptionRules.find(rule => !!rule.validationErrors)
  ) {
    disablePageNavigation = true;
  }
  if (page === 2 && specificationRules.find(rule => !!rule.validationErrors)) {
    disablePageNavigation = true;
  }

  const routes = (
    <Switch>
      <Route path="/calculation/1/:projectId?">
        <ProjectDescriptions
          rules={projectDescriptionRules}
          onInputChange={onInputChange}
          classes={classes}
        />
      </Route>
      {/* <Route path="/calculation/2/:projectId?">
        <ProjectUse
          rules={landUseRules}
          onInputChange={onInputChange}
          classes={classes}
          uncheckAll={() => onUncheckAll(filters.landUseRules)}
        />
      </Route> */}
      <Route path="/calculation/2/:projectId?">
        <ProjectSpecifications
          rules={specificationRules}
          onInputChange={onInputChange}
          classes={classes}
          uncheckAll={() => onUncheckAll(filters.specificationRules)}
        />
      </Route>
      <Route path="/calculation/3/:projectId?">
        <ProjectTargetPoints
          rules={targetPointRules}
          onInputChange={onInputChange}
          classes={classes}
        />
      </Route>
      <Route path="/calculation/4/:projectId?">
        <ProjectMeasures
          rules={strategyRules}
          landUseRules={landUseRules}
          onInputChange={onInputChange}
          onCommentChange={onCommentChange}
          classes={classes}
          onPkgSelect={onPkgSelect}
          uncheckAll={() => onUncheckAll(filters.strategyRules)}
        />
      </Route>
      <Route path="/calculation/5/:projectId?">
        <ProjectSummary
          rules={rules}
          account={account}
          projectId={projectId}
          loginId={loginId}
          onSave={onSave}
          dateModified={dateModified}
        />
      </Route>
    </Switch>
  );

  const handleValidate = () => {
    const { page } = props.match.params;
    const validations = {
      1: {
        function: () => {
          return !projectDescriptionRules.find(rule => !!rule.validationErrors);
        },
        toast: "Please fill out all required fields"
      }
      // 2: {
      //   function: () => {
      //     let selected = false;
      //     let landUseRules = rules.filter(filters.landUseRules);
      //     landUseRules.forEach(val => {
      //       if (val.value === true) {
      //         selected = true;
      //       }
      //     });
      //     return selected;
      //   },
      //   toast: "Please select at least one land use type."
      // }
    };
    const result = validations[page] ? validations[page].function() : true;
    if (result === false) {
      context.add(validations[page].toast);
      return false;
    } else {
      return true;
    }
  };

  const onPageChange = pageNo => {
    const { page, projectId } = props.match.params;
    const projectIdParam = projectId ? `/${projectId}` : "";
    if (Number(pageNo) > Number(props.match.params.page)) {
      if (handleValidate()) {
        // setPageNo(pageNo);
        props.history.push(`/calculation/${Number(page) + 1}${projectIdParam}`);
      }
    } else {
      // setPageNo(pageNo);
      props.history.push(`/calculation/${Number(page) - 1}${projectIdParam}`);
    }
  };

  return (
    <React.Fragment>
      <div className={clsx("tdm-wizard", classes.root)}>
        <Sidebar>
          {rules && rules.length > 0 && (
            <div className={classes.sidebarContent}>
              <SwitchViewButton onClick={onViewChange}>
                Switch to Single Page View
              </SwitchViewButton>
              <SidebarPointsPanel rules={resultRules} />
            </div>
          )}
        </Sidebar>
        <div
          className={clsx(
            "tdm-wizard-content-container",
            classes.contentContainer
          )}
        >
          {routes}
          {!projectId ||
          (account &&
            account.id &&
            (account.id === loginId || account.isAdmin)) ||
          (account && account.isAdmin) ? (
            <div className={classes.navButtonsWrapper}>
              {rules && rules.length ? ( //navigation disabled until rules have loaded
                <>
                  <div className="space-between">
                    {page !== 1 ? (
                      <NavButton
                        disabled={Number(page) === 1}
                        onClick={() => {
                          onPageChange(Number(page) - 1);
                        }}
                      >
                        <div className={classes.navArrow}>
                          <FontAwesomeIcon icon={faAngleLeft} />
                        </div>
                      </NavButton>
                    ) : null}
                    {account.id &&
                    (!projectId || account.id === loginId) &&
                    page === 5 ? (
                      <button
                        className="tdm-wizard-save-button"
                        onClick={onSave}
                      >
                        {projectId ? "Save Project" : "Save As New Project"}
                      </button>
                    ) : null}
                    {page !== 5 ? (
                      <NavButton
                        disabled={Number(page) === 5 || disablePageNavigation}
                        onClick={() => {
                          onPageChange(Number(page) + 1);
                        }}
                      >
                        <div className={classes.navArrow}>
                          <FontAwesomeIcon icon={faAngleRight} />
                        </div>
                      </NavButton>
                    ) : null}
                  </div>
                  <div>
                    <a
                      className={clsx(
                        "return-home-button",
                        "tdm-wizard-nav-button"
                      )}
                      href="/calculation"
                    >
                      Begin New Project
                    </a>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
          {page === 5 ? (
            <div className={classes.lastSavedContainer}>
              {dateModified && (
                <span className={classes.lastSaved}>
                  <FontAwesomeIcon icon={faClock} /> &nbsp;Last saved:{" "}
                  {dateModified}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </React.Fragment>
  );
};

TdmCalculationWizard.propTypes = {
  rules: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      dataType: PropTypes.string.isRequired,
      value: PropTypes.any,
      units: PropTypes.string,
      minValue: PropTypes.number,
      maxValue: PropTypes.number,
      choices: PropTypes.array,
      calcValue: PropTypes.number,
      calcUnits: PropTypes.string,
      required: PropTypes.bool,
      minStringLength: PropTypes.number,
      maxStringLength: PropTypes.number,
      validationErrors: PropTypes.array
    })
  ).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      page: PropTypes.string,
      projectId: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  onInputChange: PropTypes.func.isRequired,
  onCommentChange: PropTypes.func,
  onPkgSelect: PropTypes.func.isRequired,
  onUncheckAll: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  resultRuleCodes: PropTypes.array.isRequired,
  account: PropTypes.object.isRequired,
  loginId: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired
};

export default withRouter(TdmCalculationWizard);
