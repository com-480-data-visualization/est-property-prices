const express = require("express");
const exphbs = require("express-handlebars");

const app = express();

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

const path = require("path");
app.use("/static", express.static(path.join(__dirname, "public"), {maxAge: "10m"}));

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
  const counties = ['harju-maakond', 'hiiu-maakond', 'ida-viru-maakond', 'järva-maakond', 'jõgeva-maakond', 'lääne-maakond', 'lääne-viru-maakond', 'pärnu-maakond', 'põlva-maakond', 'rapla-maakond', 'saare-maakond', 'tartu-maakond', 'valga-maakond', 'viljandi-maakond', 'võru-maakond']
  if (!counties.includes(pathId)){
    res.status(403).send('Bad county name')
  }
  
  let [firstPart, secondPart] = pathId.split("-");
  firstPart = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  secondPart = "county";
  const formattedPathId = `${firstPart} ${secondPart}`;

  res.render("county", { pageTitle: formattedPathId });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
