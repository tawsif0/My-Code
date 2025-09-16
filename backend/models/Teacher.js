const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          // Basic email regex pattern
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email format"
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (value) {
          // Requires at least one number and one special character
          return /\d/.test(value) && /[!@#$%^&*]/.test(value);
        },
        message: "Password must contain a number and a special character"
      },
      select: false
    },
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      validate: {
        validator: function (value) {
          // At least two words (first and last name)
          return value.trim().split(/\s+/).length >= 2;
        },
        message: "Must include first and last name"
      }
    },
    phone: {
      type: String,
      required: [true, "Phone is required"]
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      validate: {
        validator: function (value) {
          const allowed = ["IELTS", "GRE", "SAT", "TOEFL", "GMAT", "Other"];
          // Allow predefined or custom if "Other" is selected
          return allowed.includes(value) || value.trim().length > 0;
        },
        message: "Invalid specialization"
      }
    },

    qualifications: {
      type: String,
      required: [true, "Qualifications are required"],
      minlength: [20, "Minimum 20 characters required"]
    },
    linkedin_url: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          return /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/.+/.test(value);
        },
        message: "Invalid LinkedIn URL"
      }
    },
    hourly_rate: {
      type: Number,
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          return value >= 10;
        },
        message: "Minimum $10/hour"
      }
    },
    cv: { type: String, required: true },
    certificates: [{ type: String, required: true }],
    profile_photo: { type: String }, // Path to the file
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejection_reason: String,
    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Email uniqueness check middleware
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("email")) return next();

  const existingTeacher = await this.constructor.findOne({ email: this.email });
  if (existingTeacher) {
    throw new Error("Email already in use");
  }
  next();
});

// Hash password before saving
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method
teacherSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add any custom methods or virtuals here if needed

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
