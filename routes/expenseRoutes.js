const express=require("express")
const expenseRouter=express.Router()
const expenseController=require("../controllers/expenseTrackerController")
const auth = require("../middleware/authMiddleware");


expenseRouter.post("/add",auth,expenseController.addlist)
expenseRouter.put("/update/:id",auth,expenseController.updatelist)
expenseRouter.delete("/delete/:id",auth,expenseController.deletelist)
expenseRouter.get("/",auth,expenseController.getlist)


expenseRouter.get("/download-report", auth, expenseController.downloadReport);

expenseRouter.get("/totals", auth, expenseController.getTotals);

expenseRouter.post("/create-note",auth,expenseController.createNote)
expenseRouter.get("/get-note",auth,expenseController.getNote)


module.exports=expenseRouter