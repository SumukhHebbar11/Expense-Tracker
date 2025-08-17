import { z } from "zod";
import Transaction from "../models/Transaction.js";
import FamilyMember from "../models/FamilyMember.js";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  paymentMethod: z
    .enum([
      "Cash",
      "UPI",
      "Bank Transfer",
      "Credit Card",
      "Debit Card",
      "Cheque",
      "Other",
    ])
    .optional(),
  forMember: z.string().optional(),
});

export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      type,
      sortBy = "createdAt",
    } = req.query;

    const query = { userId: req.user._id };

    if (category) {
      query.category = new RegExp(category, "i");
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const sortField = sortBy === "date" ? "date" : "createdAt";
    const sortObj = { [sortField]: -1 };

    const transactions = await Transaction.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({ path: "forMemberId", select: "name" });

    const total = await Transaction.countDocuments(query);

    // Map transactions to include forMember string for client convenience
    const mapped = transactions.map((t) => {
      const obj = t.toObject();
      obj.forMember = obj.forMemberId
        ? obj.forMemberId.name
        : obj.forMember || "Self";
      return obj;
    });

    res.json({
      success: true,
      transactions: mapped,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching transactions" });
  }
};

export const createTransaction = async (req, res) => {
  try {
    // Normalize input: ensure amount is number and date is ISO datetime string
    const validatedData = transactionSchema.parse({
      ...req.body,
      amount: parseFloat(req.body.amount),
      date: req.body.date ? new Date(req.body.date).toISOString() : undefined,
    });

    // Handle forMember: accept 'Self' or a member id
    let forMemberId = null;
    if (validatedData.forMember && validatedData.forMember !== "Self") {
      // expect an ObjectId string
      const member = await FamilyMember.findOne({
        _id: validatedData.forMember,
        userId: req.user._id,
      });
      if (!member)
        return res.status(400).json({ message: "Invalid forMember value" });
      forMemberId = member._id;
    }

    const transaction = await Transaction.create({
      ...validatedData,
      forMemberId,
      userId: req.user._id,
      date: validatedData.date ? new Date(validatedData.date) : new Date(),
    });

    // populate forMember name for response
    await transaction.populate({ path: "forMemberId", select: "name" });
    const txObj = transaction.toObject();
    txObj.forMember = txObj.forMemberId ? txObj.forMemberId.name : "Self";

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      transaction: txObj,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res
      .status(500)
      .json({ message: "Server error while creating transaction" });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    // Normalize input: ensure amount is number and date is ISO datetime string
    const validatedData = transactionSchema.parse({
      ...req.body,
      amount: parseFloat(req.body.amount),
      date: req.body.date ? new Date(req.body.date).toISOString() : undefined,
    });

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Process forMember when updating
    let forMemberId = transaction.forMemberId || null;
    if (validatedData.forMember && validatedData.forMember !== "Self") {
      const member = await FamilyMember.findOne({
        _id: validatedData.forMember,
        userId: req.user._id,
      });
      if (!member)
        return res.status(400).json({ message: "Invalid forMember value" });
      forMemberId = member._id;
    } else if (validatedData.forMember === "Self") {
      forMemberId = null;
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        ...validatedData,
        forMemberId,
        date: validatedData.date
          ? new Date(validatedData.date)
          : transaction.date,
      },
      { new: true, runValidators: true }
    ).populate({ path: "forMemberId", select: "name" });

    const txObj = updatedTransaction.toObject();
    txObj.forMember = txObj.forMemberId ? txObj.forMemberId.name : "Self";

    res.json({
      success: true,
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    res
      .status(500)
      .json({ message: "Server error while updating transaction" });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while deleting transaction" });
  }
};

export const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = { userId: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        dateFilter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.date.$lte = new Date(endDate);
      }
    }

    const [incomeResult, expenseResult] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...dateFilter, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { ...dateFilter, type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpense = expenseResult[0]?.total || 0;
    const balance = totalIncome - totalExpense;

    const categoryBreakdown = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id.category",
          type: "$_id.type",
          total: 1,
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const months = parseInt(req.query.months, 10) || 6;
    const end = endDate ? new Date(endDate) : new Date();

    end.setHours(23, 59, 59, 999);
    const startForMonths = new Date(end);
    startForMonths.setMonth(end.getMonth() - (months - 1));
    startForMonths.setDate(1);
    startForMonths.setHours(0, 0, 0, 0);

    const monthMatch = {
      userId: req.user._id,
      date: { $gte: startForMonths, $lte: end },
    };

    const tz = process.env.SERVER_TIMEZONE || process.env.TZ || "UTC";

    const incomeByMonth = await Transaction.aggregate([
      { $match: { ...monthMatch, type: "income" } },
      {
        $project: {
          yearMonth: {
            $dateToString: { format: "%Y-%m", date: "$date", timezone: tz },
          },
          monthNum: { $month: "$date" },
          amount: 1,
        },
      },
      {
        $group: {
          _id: "$yearMonth",
          monthNum: { $first: "$monthNum" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const expenseByMonth = await Transaction.aggregate([
      { $match: { ...monthMatch, type: "expense" } },
      {
        $project: {
          yearMonth: {
            $dateToString: { format: "%Y-%m", date: "$date", timezone: tz },
          },
          monthNum: { $month: "$date" },
          amount: 1,
        },
      },
      {
        $group: {
          _id: "$yearMonth",
          monthNum: { $first: "$monthNum" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const incomeMap = new Map();
    incomeByMonth.forEach((item) => {
      const key = item._id;
      incomeMap.set(key, item.total);
    });

    const expenseMap = new Map();
    expenseByMonth.forEach((item) => {
      const key = item._id;
      expenseMap.set(key, item.total);
    });

    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyTrend = [];
    // If months === 1, provide weekly breakdown for the last 4 weeks
    if (months === 1) {
      const weeks = 4;
      const startForWeeks = new Date(end);
      startForWeeks.setDate(end.getDate() - 7 * (weeks - 1));
      startForWeeks.setHours(0, 0, 0, 0);

      const weekMatch = {
        userId: req.user._id,
        date: { $gte: startForWeeks, $lte: end },
      };

      const incomeByWeek = await Transaction.aggregate([
        { $match: { ...weekMatch, type: "income" } },
        {
          $project: {
            weekStart: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: {
                  $dateTrunc: { date: "$date", unit: "week", timezone: tz },
                },
                timezone: tz,
              },
            },
            amount: 1,
          },
        },
        { $group: { _id: "$weekStart", total: { $sum: "$amount" } } },
      ]);

      const expenseByWeek = await Transaction.aggregate([
        { $match: { ...weekMatch, type: "expense" } },
        {
          $project: {
            weekStart: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: {
                  $dateTrunc: { date: "$date", unit: "week", timezone: tz },
                },
                timezone: tz,
              },
            },
            amount: 1,
          },
        },
        { $group: { _id: "$weekStart", total: { $sum: "$amount" } } },
      ]);

      const incomeWeekMap = new Map();
      incomeByWeek.forEach((item) => incomeWeekMap.set(item._id, item.total));
      const expenseWeekMap = new Map();
      expenseByWeek.forEach((item) => expenseWeekMap.set(item._id, item.total));

      for (let i = weeks - 1; i >= 0; i--) {
        const endOfWeek = new Date(end);
        endOfWeek.setDate(end.getDate() - 7 * i);
        // Compute week start using server-side week start (assume week starts on day returned by dateTrunc, which is locale dependent; use Monday start here)
        const weekStart = new Date(endOfWeek);
        const day = weekStart.getDay();
        const diff = (day + 6) % 7;
        weekStart.setDate(weekStart.getDate() - diff);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const formatYMDInTZ = (date, timezone) => {
          // Use Intl.DateTimeFormat to get year/month/day in the target timezone
          const parts = new Intl.DateTimeFormat("en", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).formatToParts(date);

          const y = parts.find((p) => p.type === "year")?.value;
          const m = parts.find((p) => p.type === "month")?.value;
          const d = parts.find((p) => p.type === "day")?.value;
          return `${y}-${m}-${d}`;
        };

        const fmt = (d) => {
          return d.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
          });
        };

        // Ensure the key uses the same timezone formatting as the aggregation (tz)
        const key = formatYMDInTZ(weekStart, tz);

        monthlyTrend.push({
          month: `${fmt(weekStart)} - ${fmt(weekEnd)}`,
          year: weekStart.getFullYear(),
          key,
          income: incomeWeekMap.get(key) || 0,
          expense: expenseWeekMap.get(key) || 0,
        });
      }
    } else {
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setMonth(end.getMonth() - i);
        const year = d.getFullYear();
        const monthNum = d.getMonth() + 1;
        const key = `${year}-${String(monthNum).padStart(2, "0")}`;
        const label = monthLabels[d.getMonth()];
        monthlyTrend.push({
          month: label,
          year,
          key,
          income: incomeMap.get(key) || 0,
          expense: expenseMap.get(key) || 0,
        });
      }
    }

    res.json({
      success: true,
      totalIncome,
      totalExpense,
      balance,
      categoryBreakdown,
      monthlyTrend,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching summary" });
  }
};
