// routes/EmployeeAnalytics.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/employeeAuth");
const Employee = require("../models/Employee");
const Consultation = require("../models/Consultation");
const VisaRequest = require("../models/VisaRequest");
const mongoose = require("mongoose");

// Employee Dashboard Analytics
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.user.id);
    const employeeRole = req.user.role;

    // Base analytics object
    let analytics = {
      success: true,
      period: "all", // Could be extended to support different time periods
      timestamp: new Date().toISOString(),
    };

    if (employeeRole === "consultant") {
      // Consultant-specific analytics
      const consultationStats = await Consultation.aggregate([
        {
          $match: { assignedTo: employeeId },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const visaRequestStats = await VisaRequest.aggregate([
        {
          $match: { assignedConsultant: employeeId },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Convert arrays to objects for easier access
      const consultationStatusCounts = consultationStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      const visaRequestStatusCounts = visaRequestStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      analytics.consultations = {
        total: consultationStats.reduce((sum, item) => sum + item.count, 0),
        pending: consultationStatusCounts.pending || 0,
        confirmed: consultationStatusCounts.confirmed || 0,
        completed: consultationStatusCounts.completed || 0,
        cancelled: consultationStatusCounts.cancelled || 0,
      };

      analytics.visaRequests = {
        total: visaRequestStats.reduce((sum, item) => sum + item.count, 0),
        pending: visaRequestStatusCounts.pending || 0,
        in_review: visaRequestStatusCounts.in_review || 0,
        approved: visaRequestStatusCounts.approved || 0,
        rejected: visaRequestStatusCounts.rejected || 0,
        completed: visaRequestStatusCounts.completed || 0,
      };

      // Recent activity (dynamic period filter)
      let matchDate = {};
      const { period = "all" } = req.query;

      if (period && period !== "all") {
        const now = new Date();
        let fromDate = new Date();

        if (period === "week") {
          // Last 7 days
          fromDate.setDate(now.getDate() - 7);
        } else if (period === "month") {
          // First day of current month
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === "year") {
          // First day of current year
          fromDate = new Date(now.getFullYear(), 0, 1);
        }

        fromDate.setHours(0, 0, 0, 0);
        matchDate = { createdAt: { $gte: fromDate, $lte: now } };
      }

      const recentConsultations = await Consultation.find({
        assignedTo: employeeId,
        ...matchDate,
      }).sort({ createdAt: -1 });

      const recentVisaRequests = await VisaRequest.find({
        assignedConsultant: employeeId,
        ...matchDate,
      })
        .sort({ createdAt: -1 })
        .populate("student", "full_name email");

      analytics.recentActivity = {
        consultations: recentConsultations,
        visaRequests: recentVisaRequests,
      };

      // Performance metrics
      const performanceStats = await Consultation.aggregate([
        {
          $match: { assignedTo: employeeId, status: "completed" },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalRevenue: { $sum: "$fee" },
            count: { $sum: 1 },
          },
        },
      ]);

      analytics.performance = {
        avgRating: performanceStats[0]?.avgRating || 0,
        totalRevenue: performanceStats[0]?.totalRevenue || 0,
        completedConsultations: performanceStats[0]?.count || 0,
      };
    } else if (employeeRole === "admin" || employeeRole === "superadmin") {
      // Admin-specific analytics (overview of all data)
      const totalConsultations = await Consultation.countDocuments();
      const totalVisaRequests = await VisaRequest.countDocuments();
      const totalEmployees = await Employee.countDocuments({
        role: { $ne: "superadmin" },
      });

      const consultationStatusStats = await Consultation.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const visaRequestStatusStats = await VisaRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const employeeRoleStats = await Employee.aggregate([
        {
          $match: { role: { $ne: "superadmin" } },
        },
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);

      analytics.overview = {
        totalConsultations,
        totalVisaRequests,
        totalEmployees,
        consultationStatus: consultationStatusStats,
        visaRequestStatus: visaRequestStatusStats,
        employeeRoles: employeeRoleStats,
      };
    }

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
      error: error.message,
    });
  }
});

// Get My Consultations
router.get("/my-consultations", authenticateToken, async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.user.id);
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    let matchCriteria = { assignedTo: employeeId };

    if (status) {
      matchCriteria.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    const consultations = await Consultation.find(matchCriteria)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Consultation.countDocuments(matchCriteria);

    // Get status breakdown
    const statusBreakdown = await Consultation.aggregate([
      { $match: { assignedTo: employeeId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: consultations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      statusBreakdown: statusBreakdown.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching consultations",
      error: error.message,
    });
  }
});

// Get My Visa Requests
router.get("/my-visa-requests", authenticateToken, async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.user.id);
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    let matchCriteria = { assignedConsultant: employeeId };

    if (status) {
      matchCriteria.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    const visaRequests = await VisaRequest.find(matchCriteria)
      .populate("student", "full_name email phone_number")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VisaRequest.countDocuments(matchCriteria);

    // Get status breakdown
    const statusBreakdown = await VisaRequest.aggregate([
      { $match: { assignedConsultant: employeeId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get visa type breakdown
    const visaTypeBreakdown = await VisaRequest.aggregate([
      { $match: { assignedConsultant: employeeId } },
      {
        $group: {
          _id: "$visaType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get document status breakdown
    const documentStats = await VisaRequest.aggregate([
      { $match: { assignedConsultant: employeeId } },
      { $unwind: "$documents" },
      {
        $group: {
          _id: "$documents.status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: visaRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      statusBreakdown: statusBreakdown.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      visaTypeBreakdown: visaTypeBreakdown.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      documentStats: documentStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching visa requests",
      error: error.message,
    });
  }
});

// Update Consultation Status
router.put("/consultations/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    const consultation = await Consultation.findOne({
      _id: req.params.id,
      assignedTo: employeeId,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found or not assigned to you",
      });
    }

    consultation.status = status;
    if (notes) consultation.notes = notes;
    if (status === "completed") consultation.completedAt = new Date();

    await consultation.save();

    const updatedConsultation = await Consultation.findById(consultation._id);

    res.status(200).json({
      success: true,
      data: updatedConsultation,
      message: `Consultation ${status} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating consultation status",
      error: error.message,
    });
  }
});

// Update Visa Request Status
router.put("/visa-requests/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const employeeId = new mongoose.Types.ObjectId(req.user.id);

    const visaRequest = await VisaRequest.findOne({
      _id: req.params.id,
      assignedConsultant: employeeId,
    });

    if (!visaRequest) {
      return res.status(404).json({
        success: false,
        message: "Visa request not found or not assigned to you",
      });
    }

    visaRequest.status = status;
    if (notes) visaRequest.notes = notes;
    if (status === "completed") visaRequest.completedAt = new Date();

    await visaRequest.save();

    const updatedVisaRequest = await VisaRequest.findById(
      visaRequest._id
    ).populate("student", "full_name email phone_number");

    res.status(200).json({
      success: true,
      data: updatedVisaRequest,
      message: `Visa request ${status} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating visa request status",
      error: error.message,
    });
  }
});

// Consultation Analytics with filters
router.get("/consultations/analytics", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const employeeId = new mongoose.Types.ObjectId(req.user.id);
    const employeeRole = req.user.role;

    let matchCriteria = {};

    // Apply role-based filtering
    if (employeeRole === "consultant") {
      matchCriteria.assignedTo = employeeId;
    }

    // Apply date filters
    if (startDate || endDate) {
      matchCriteria.createdAt = {};
      if (startDate) matchCriteria.createdAt.$gte = new Date(startDate);
      if (endDate) matchCriteria.createdAt.$lte = new Date(endDate);
    }

    // Apply status filter
    if (status) {
      matchCriteria.status = status;
    }

    const consultationAnalytics = await Consultation.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgDuration: { $avg: "$duration" },
          totalRevenue: { $sum: "$fee" },
        },
      },
    ]);

    const totalStats = await Consultation.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalRevenue: { $sum: "$fee" },
          avgFee: { $avg: "$fee" },
        },
      },
    ]);

    const dailyTrends = await Consultation.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$fee" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $limit: 30 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: consultationAnalytics,
        totals: totalStats[0] || { total: 0, totalRevenue: 0, avgFee: 0 },
        dailyTrends,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching consultation analytics",
      error: error.message,
    });
  }
});

// Visa Request Analytics with filters
router.get("/visa-requests/analytics", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status, visaType } = req.query;
    const employeeId = new mongoose.Types.ObjectId(req.user.id);
    const employeeRole = req.user.role;

    let matchCriteria = {};

    // Apply role-based filtering
    if (employeeRole === "consultant") {
      matchCriteria.assignedConsultant = employeeId;
    }

    // Apply filters
    if (startDate || endDate) {
      matchCriteria.createdAt = {};
      if (startDate) matchCriteria.createdAt.$gte = new Date(startDate);
      if (endDate) matchCriteria.createdAt.$lte = new Date(endDate);
    }

    if (status) matchCriteria.status = status;
    if (visaType) matchCriteria.visaType = visaType;

    const visaAnalytics = await VisaRequest.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgProcessingTime: {
            $avg: {
              $subtract: ["$completedAt", "$createdAt"],
            },
          },
        },
      },
    ]);

    const byVisaType = await VisaRequest.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: "$visaType",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]);

    const documentStats = await VisaRequest.aggregate([
      { $match: matchCriteria },
      { $unwind: "$documents" },
      {
        $group: {
          _id: "$documents.status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: visaAnalytics,
        byVisaType,
        documentStatus: documentStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching visa request analytics",
      error: error.message,
    });
  }
});

module.exports = router;
