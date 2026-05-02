const sequelize = require("../Utils/db-connection");
const expensetable=require("../Models/expensetrackertable")
const { Notes } = require("../Models");

const { Op } = require("sequelize");

const addlist=async(req,res,next)=>{
  let t;
  try {
    t = await sequelize.transaction();
        const {typeSelect,category,title,amount}=req.body
        const data=await expensetable.create({
            typeSelect,
            category,
            title,
            amount,
            userId: req.user.id
        },{
          transaction:t
        })
        await t.commit();
        res.status(201).json(data)
    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
}



const getlist = async (req, res,next) => {
  try {
    const { filter, date, search, typeSelect } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = {
      userId: req.user.id
    };

   
    if (typeSelect) {
      whereClause.typeSelect = typeSelect;
    }

  
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
    }

    
    if (date && filter) {
      const selectedDate = new Date(Number(date));
      const y = selectedDate.getFullYear();
      const m = selectedDate.getMonth();
      const d = selectedDate.getDate();

      if (filter === "daily") {
        whereClause.createdAt = {
          [Op.between]: [
            new Date(y, m, d, 0, 0, 0, 0),
            new Date(y, m, d, 23, 59, 59, 999)
          ]
        };
      } else if (filter === "monthly") {
        whereClause.createdAt = {
          [Op.between]: [
            new Date(y, m, 1),
            new Date(y, m + 1, 0, 23, 59, 59, 999)
          ]
        };
      } else if (filter === "yearly") {
        whereClause.createdAt = {
          [Op.between]: [
            new Date(y, 0, 1),
            new Date(y, 11, 31, 23, 59, 59, 999)
          ]
        };
      }
    }

    const { count, rows } = await expensetable.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.status(200).json({
      transactions: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });

  } catch (error) {
    next(error);
  }
};

const updatelist=async(req,res,next)=>{
 let t;
  try {
    t = await sequelize.transaction();
        const {id}=req.params
        const {category,title,amount}=req.body

         const existing = await expensetable.findByPk(id, { transaction: t });
    if (!existing) {
        await t.rollback();
      return res.status(404).json({ message: "Data not found" });
    }

        await expensetable.update({
            category,
            title,
            amount
        },{
            where:{
                id:id
            }, transaction: t })

        const updatedData = await expensetable.findByPk(id, { transaction: t });
        
        await t.commit();
        res.status(200).json(updatedData)
    } catch (error) {
      if (t) await t.rollback();
        next(error);
    }
}

const deletelist=async(req,res,next)=>{
 let t;
  try {
    t = await sequelize.transaction();
        const {id}=req.params
       const deleted = await expensetable.destroy({ where: { id },transaction: t });

if (!deleted) {
  await t.rollback();
  return res.status(404).json({ message: "Data not found" });
}

        await t.commit();
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      if (t) await t.rollback();
       next(error);
    }
}

const getTotals = async (req, res,next) => {
  try {
    const { filter, date, search } = req.query;

    let whereClause = {
      userId: req.user.id
    };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
    }

    // same date filter logic here...

    const data = await expensetable.findAll({ where: whereClause });

    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach(item => {
      if (item.typeSelect === "income") {
        totalIncome += Number(item.amount);
      } else {
        totalExpense += Number(item.amount);
      }
    });

    res.json({
      totalIncome,
      totalExpense
    });

  } catch (error) {
    next(error);
  }
};

const createNote=async(req,res,next)=>{
  try {
    const userId= req.user.id
    const {noteText,date}=req.body
    const today = new Date().toISOString().split("T")[0];
    const existing = await Notes.findOne({
      where: { userId, date: today }
    });

    if (existing) {
      await existing.update({ note: noteText });
    } else {
      await Notes.create({
        note: noteText,
        date: today,
        userId
      });
    }
    res.status(200).json({ message: "Note saved successfully" });
  } catch (error) {
   next(error);
  }
}

const getNote=async(req,res,next)=>{
  try {
     const { date } = req.query;
    let whereClause = {
      date,
      userId: req.user.id
    };
     const data = await Notes.findAll({ where: whereClause });

      res.status(200).json(data)
  } catch (error) {
     next(error);
  }
}
module.exports={
    addlist,
    getlist,
    updatelist,
    deletelist,
    getTotals,
    createNote,
    getNote
}