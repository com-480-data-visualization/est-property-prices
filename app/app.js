const express = require("express");
const exphbs = require("express-handlebars");

const app = express();

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

const path = require("path");
app.use("/static", express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/county/:pathId", (req, res) => {
  const pathId = req.params.pathId;
  
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
