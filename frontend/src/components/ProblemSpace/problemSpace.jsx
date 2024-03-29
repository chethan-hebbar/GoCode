import { useEffect, useState } from "react";
import { Col } from "react-grid-system";
import ReactLoading from "react-loading";
import ProblemBox from "./ProblemBox";
import { makeStyles, alpha } from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { domain } from "../../constants/config";
import SelectSearch from "react-select-search";
import test from "./select-search.css";
import fuzzySearch from "./fuzzy";
import { useHistory } from "react-router";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },

  content: {
    flexGrow: 1,
    paddingTop: "100px",
    padding: theme.spacing(3),
    backgroundColor: "#212121",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    height: "2.5rem",
    backgroundColor: alpha(theme.palette.common.white, 0.5),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.8),
    },
    marginRight: theme.spacing(30),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(30),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "black",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },

  grow: {
    flexGrow: 1,
  },
}));

const ProblemSpace = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProblems, setsearchProblems] = useState([]);
  const [options, setOptions] = useState([]);
  const history = useHistory();

  const classes = useStyles();
  const hasCache = (expireTime, cachedProblems) => {
    if (
      cachedProblems === null ||
      expireTime === null ||
      +new Date() > expireTime
    )
      return false;
    return true;
  };
  // Problems refresh every 5 minutes
  const MINUTES_TO_ADD = 5;

  useEffect(() => {
    setOptions([]);
    const cachedProblems = localStorage.getItem("problems");

    let dummysearch = [];
    // // console.log(cachedProblems)
    // // console.log(+new Date())
    const expireTime = localStorage.getItem("problemsExpirationTimestamp");
    if (!hasCache(expireTime, cachedProblems)) {
      fetch(`${domain}/api/problems`)
        .then((data) => data.json())
        .then((data) => {
          let tags = [];

          data.forEach((problem) => {
            dummysearch.push({
              value: problem._id.toString(),
              name: problem.name,
            });

            problem.tags.forEach((tag) => {
              tags.push(tag);
              // // console.log(tag);
            });
          });

          // console.log(dummysearch);

          setOptions(dummysearch);
          // // console.log(tags);
          const uniqueTags = new Set(tags);
          // // console.log(uniqueTags);
          const finalData = {};
          uniqueTags.forEach((t) => {
            finalData[t] = data.filter((d) => {
              return d.tags.indexOf(t) !== -1;
            });
          });
          setProblems(finalData);
          // console.log(finalData);
          // console.log(JSON.stringify(finalData));
          localStorage.setItem("problems", JSON.stringify(finalData));

          let currentDate = new Date();
          let expireTimeStamp = +new Date(
            currentDate.getTime() + MINUTES_TO_ADD * 60000
          );
          localStorage.setItem("problemsExpirationTimestamp", expireTimeStamp);
          setLoading(false);
        });
    } else {
      setProblems(JSON.parse(cachedProblems));

      let t = JSON.parse(cachedProblems);
      // console.log(cachedProblems);
      // console.log(t);

      // console.log(typeof t);
      let lproblems = [];

      for (const tag in t) {
        t[tag].map((p) => {
          lproblems.push(p);
        });
      }
      let answer = [];

      lproblems.forEach((x) => {
        if (!answer.some((y) => JSON.stringify(y) === JSON.stringify(x))) {
          answer.push(x);
        }
      });

      // console.log(answer);
      answer.forEach((problem) => {
        dummysearch.push({
          value: problem._id.toString(),
          name: problem.name,
        });
      });

      setOptions(dummysearch);

      setLoading(false);
    }
  }, []);

  // const options = [
  //   { name: "Swedish", value: "sv" },
  //   { name: "English", value: "en" },
  //   // {
  //   //   type: "group",
  //   //   name: "Group name",
  //   //   items: [{ name: "Spanish", value: "es" }],
  //   // },
  // ];

  const loadingOptions = {
    type: "spin",
    color: "#347deb",
  };
  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <ReactLoading
            type={loadingOptions.type}
            color={loadingOptions.color}
            height={100}
            width={100}
          />
        </div>
      ) : (
        <Col>
          {/* <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
            />
          </div> */}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <SelectSearch
              options={options}
              search
              filterOptions={fuzzySearch}
              emptyMessage={() => (
                <div style={{ textAlign: "center", fontSize: "0.8em" }}>
                  No Problems Found
                </div>
              )}
              onChange={(e) => history.push(`/problem/${e}`)}
              placeholder="Search for Problems"
            />
          </div>

          {Object.entries(problems).map((problem, i) => (
            <ProblemBox problemset={problem} key={i} />
          ))}
        </Col>
      )}
    </>
  );
};

export default ProblemSpace;
