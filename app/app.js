const express = require("express");
const exphbs = require("express-handlebars");

const app = express();

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

const path = require("path");
app.use(
  "/static",
  express.static(path.join(__dirname, "public"), { maxAge: "10m" })
);

// Routes
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/county/:pathId", (req, res) => {
  const pathId = req.params.pathId;

  // Check if user input is a valid county to avoid XSS.
  const counties = [
    "harju-maakond",
    "hiiu-maakond",
    "ida-viru-maakond",
    "järva-maakond",
    "jõgeva-maakond",
    "lääne-maakond",
    "lääne-viru-maakond",
    "pärnu-maakond",
    "põlva-maakond",
    "rapla-maakond",
    "saare-maakond",
    "tartu-maakond",
    "valga-maakond",
    "viljandi-maakond",
    "võru-maakond",
  ];
  if (!counties.includes(pathId)) {
    res.status(403).send("Bad county name");
  }

  let [firstPart, _] = splitCapitalizeJoin(pathId);
  firstPart = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  const formattedPathId = `${firstPart}`;

  res.render("county", { pageTitle: formattedPathId, pathId: pathId });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function splitCapitalizeJoin(str, delimiter = "-") {
  const parts = str.split(delimiter).map(capitalize);

  if (parts.length === 1) {
    return [parts[0], ""];
  }

  const firstPart = parts.slice(0, -1).join(delimiter);
  const lastPart = parts[parts.length - 1];

  return [firstPart, lastPart];
}