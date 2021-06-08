const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const redis = require("redis");
const redisStore = require("connect-redis")(session);
const client = redis.createClient();
const router = express.Router();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: "secret_id",
    store: new redisStore({
      host: "localhost",
      port: 6379,
      client: client,
      ttl: 260,
    }),
    saveUninitialized: true,
    resave: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/views"));

router.get("/", (req, res) => {
  let user_session = req.session;
  console.log(user_session);
  if (user_session.email) {
    return res.redirect("/admin");
  }
  res.sendFile("index.html");
});

router.post("/login", (req, res) => {
  let user_session = req.session;
  user_session.email = req.body.email;
  res.end("done");
});

router.get("/admin", (req, res) => {
  let user_session = req.session;
  if (user_session.email) {
    res.write(`<h1> Hello ${user_session.email} </h1><br>`);
    res.end("<a href=" + "/logout" + ">Logout</a>");
  } else {
    res.write("<h1>Please login first.</h1>");
    res.end("<a href=" + "/" + ">Login</a>");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
});

app.use(router);

app.listen(PORT, () => {
  console.log(`App started on PORT ${PORT}`);
});
