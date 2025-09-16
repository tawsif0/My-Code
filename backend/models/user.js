const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: true,
  },
});

const userSchema = new Schema({
  // Basic Info
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },

  // Profile
  avatar: String,
  bio: String,

  // Status
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["active", "suspended", "deactivated"],
    default: "active",
  },

  // Cart & Courses
  cart: [cartItemSchema],
  enrolledCourses: [
    {
      courseId: { type: Schema.Types.ObjectId, ref: "Course" },
      enrolledAt: { type: Date, default: Date.now },
    },
  ],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Virtuals
userSchema.virtual("cartTotal").get(function () {
  return this.cart.reduce((total, item) => total + item.price, 0);
});

userSchema.virtual("cartCount").get(function () {
  return this.cart.length;
});

// Cart Methods
userSchema.methods.addToCart = async function (courseId, price) {
  if (this.cart.some((item) => item.courseId.equals(courseId))) {
    throw new Error("Course already in cart");
  }

  this.cart.push({ courseId, price });
  await this.save();
  return this.cart;
};

userSchema.methods.removeFromCart = async function (courseId) {
  const index = this.cart.findIndex((item) => item.courseId.equals(courseId));
  if (index === -1) throw new Error("Course not in cart");

  this.cart.splice(index, 1);
  await this.save();
  return this.cart;
};

userSchema.methods.clearCart = async function () {
  this.cart = [];
  await this.save();
};

// Enrollment Methods
userSchema.methods.enrollInCourse = async function (courseId) {
  if (this.enrolledCourses.some((c) => c.courseId.equals(courseId))) {
    throw new Error("Already enrolled in this course");
  }

  this.enrolledCourses.push({ courseId });
  await this.save();
  return this.enrolledCourses;
};

// Pre-save hook
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("User", userSchema);
