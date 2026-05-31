require("dotenv").config();
const express=require("express")
const cors=require("cors")
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const app=express()
const db=require("./Utils/db-connection")
require("./Models");
const expenseRouter=require("./routes/expenseRoutes")
const userRouter=require("./routes/signUpRoute")
const paymentRouter = require("./routes/paymentRoutes");
const aiRouter=require("./routes/ai")

const errorLogger=require("./middleware/errorLogger")
const errorHandler=require("./middleware/errorHandler")

const compression = require("compression");
app.use(compression());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" } 
);

app.use(morgan("dev")); 
app.use(morgan("combined", { stream: accessLogStream }));

app.use(cors());
app.use(express.json());
app.use(express.static("public"))

app.use("/user",userRouter)
app.use("/expensetracker",expenseRouter)
app.use("/payment", paymentRouter);
app.use("/ai",aiRouter)

app.use(errorLogger);
app.use(errorHandler);

db.authenticate()
  .then(() => {
    console.log("Database connected");

    app.listen(process.env.PORT || 3000, () => {
      console.log("Server is running");
    });
  })
  .catch(err => console.log(err));

