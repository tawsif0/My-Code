const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Order = require("./Order"); // Adjust path as needed
const studentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email"
      ]
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    full_name: {
      type: String,
      required: [true, "Please enter your full name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"]
    },
    date_of_birth: {
      type: String,
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of birth must be in YYYY-MM-DD format"
      ]
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"]
    },
    profile_picture: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: "student",
      enum: ["student", "admin", "instructor"]
    },
    // Add this to your schema fields (near other fields like 'role', 'isVerified', etc.)
    subscription: {
      active: {
        type: Boolean,
        default: false
      },
      plan: {
        type: String,
        enum: ["basic", "pro", "enterprise"],
        default: "basic"
      },
      startsAt: {
        type: Date,
        default: Date.now
      },
      expiresAt: Date,
      paymentMethod: String,
      autoRenew: {
        type: Boolean,
        default: false
      }
    },
    otp: {
      type: String
    },
    otpExpires: {
      type: Date
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpire: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    enrolledCourses: {
      type: [
        {
          courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
          },
          enrolledAt: {
            type: Date,
            default: Date.now
          },
          progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
          },
          completed: {
            type: Boolean,
            default: false
          },
          lastAccessed: {
            type: Date
          },
          quizAttempts: {
            type: [
              {
                contentItemId: {
                  type: mongoose.Schema.Types.ObjectId,
                  required: true
                },
                attemptDate: {
                  type: Date,
                  default: Date.now
                },
                score: {
                  type: Number,
                  min: 0,
                  max: 100
                },
                answers: {
                  type: [
                    {
                      questionId: mongoose.Schema.Types.ObjectId,
                      answer: mongoose.Schema.Types.Mixed,
                      isCorrect: Boolean
                    }
                  ],
                  default: [] // Initialize nested array
                },
                passed: Boolean
              }
            ],
            default: [] // Initialize quizAttempts array
          },
          contentProgress: {
            type: [
              {
                contentItemId: {
                  type: mongoose.Schema.Types.ObjectId,
                  required: true
                },
                completed: {
                  type: Boolean,
                  default: false
                },
                lastAccessed: Date,
                completedAt: Date
              }
            ],
            default: [] // Initialize contentProgress array
          },
          certificates: {
            type: [
              {
                url: String,
                issuedAt: Date,
                expiresAt: Date
              }
            ],
            default: [] // Initialize certificates array
          }
        }
      ],
      default: [] // Initialize main enrolledCourses array
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],
    cart: {
      type: {
        items: {
          type: [
            {
              courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
                required: true
              },
              addedAt: {
                type: Date,
                default: Date.now
              },
              price: {
                type: Number,
                required: true
              }
            }
          ],
          default: [] // Initialize cart items array
        },
        total: {
          type: Number,
          default: 0
        },
        lastUpdated: {
          type: Date,
          default: Date.now
        }
      },
      default: {} // Initialize entire cart object
    },
    learningGoals: {
      type: String,
      maxlength: [500, "Learning goals cannot exceed 500 characters"]
    },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number
      }
    ],
    skills: [String],
    preferences: {
      notificationEnabled: {
        type: Boolean,
        default: true
      },
      darkMode: {
        type: Boolean,
        default: false
      },
      language: {
        type: String,
        default: "english"
      }
    },
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ["credit_card", "debit_card", "paypal", "bank_transfer"],
          required: true
        },
        details: {
          // Generic field that can store different payment method details
          type: mongoose.Schema.Types.Mixed
        },
        isDefault: {
          type: Boolean,
          default: false
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    orders: [
      {
        orderId: {
          type: String,
          required: true
        },
        courses: [
          {
            courseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Course",
              required: true
            },
            price: {
              type: Number,
              required: true
            }
          }
        ],
        totalAmount: {
          type: Number,
          required: true
        },
        paymentMethod: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ["pending", "completed", "failed", "refunded"],
          default: "pending"
        },
        transactionId: String,
        purchasedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals
studentSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

studentSchema.virtual("enrolledCoursesCount").get(function () {
  return this.enrolledCourses?.length || 0;
});

studentSchema.virtual("cartItemCount").get(function () {
  return this.cart?.items?.length || 0;
});
// Middleware
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
studentSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

studentSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.incrementLoginAttempts = function () {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// Enrollment Methods
studentSchema.methods.enrollCourse = async function (courseId) {
  const isEnrolled = this.enrolledCourses.some(
    (c) => c.course.toString() === courseId.toString()
  );

  if (isEnrolled) {
    throw new Error("You are already enrolled in this course");
  }

  this.enrolledCourses.push({
    course: courseId,
    progress: 0,
    completed: false
  });

  await this.save();
  return this;
};
// Add these methods to your studentSchema.methods

// Activate subscription
studentSchema.methods.activateSubscription = async function (
  plan,
  durationMonths,
  paymentMethod
) {
  const startDate = new Date();
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + durationMonths);

  this.subscription = {
    active: true,
    plan,
    startsAt: startDate,
    expiresAt: expireDate,
    paymentMethod
  };

  await this.save();
  return this.subscription;
};

// Cancel subscription
studentSchema.methods.cancelSubscription = async function () {
  this.subscription.active = false;
  await this.save();
  return this.subscription;
};

// Check subscription status
studentSchema.methods.checkSubscriptionStatus = function () {
  return {
    active: this.subscription.active,
    plan: this.subscription.plan,
    expiresAt: this.subscription.expiresAt,
    daysRemaining: this.subscription.expiresAt
      ? Math.ceil(
          (this.subscription.expiresAt - new Date()) / (1000 * 60 * 60 * 24)
        )
      : null
  };
};
studentSchema.methods.updateCourseProgress = async function (
  courseId,
  progress
) {
  const enrollment = this.enrolledCourses.find(
    (c) => c.course.toString() === courseId.toString()
  );

  if (!enrollment) {
    throw new Error("You are not enrolled in this course");
  }

  enrollment.progress = Math.min(progress, 100);
  enrollment.lastAccessed = Date.now();

  if (progress >= 100) {
    enrollment.completed = true;
  }

  await this.save();
  return this;
};

// Quiz Methods
studentSchema.methods.recordQuizAttempt = async function (
  courseId,
  contentItemId,
  answers,
  score,
  passed
) {
  const enrollment = this.enrolledCourses.find(
    (e) => e.course.toString() === courseId.toString()
  );

  if (!enrollment) {
    throw new Error("You are not enrolled in this course");
  }

  // Record the quiz attempt
  enrollment.quizAttempts.push({
    contentItemId,
    score,
    answers,
    passed
  });

  // Update content progress
  let contentProgress = enrollment.contentProgress.find(
    (cp) => cp.contentItemId.toString() === contentItemId.toString()
  );

  if (!contentProgress) {
    contentProgress = {
      contentItemId,
      completed: passed,
      lastAccessed: new Date()
    };
    if (passed) {
      contentProgress.completedAt = new Date();
    }
    enrollment.contentProgress.push(contentProgress);
  } else {
    contentProgress.lastAccessed = new Date();
    if (passed && !contentProgress.completed) {
      contentProgress.completed = true;
      contentProgress.completedAt = new Date();
    }
  }

  // Update overall course progress
  const completedContentCount = enrollment.contentProgress.filter(
    (cp) => cp.completed
  ).length;
  const totalContentCount = await this.constructor.getCourseContentCount(
    courseId
  );
  const newProgress = Math.floor(
    (completedContentCount / totalContentCount) * 100
  );

  if (newProgress > enrollment.progress) {
    enrollment.progress = newProgress;
    if (newProgress >= 100) {
      enrollment.completed = true;
    }
  }

  await this.save();
  return this;
};

// Static method to get course content count
studentSchema.statics.getCourseContentCount = async function (courseId) {
  const course = await mongoose
    .model("Course")
    .findById(courseId)
    .select("content");
  return course ? course.content.length : 0;
};

studentSchema.methods.addToWishlist = async function (courseId) {
  if (this.wishlist.includes(courseId)) {
    throw new Error("Course already in wishlist");
  }

  this.wishlist.push(courseId);
  await this.save();
  return this;
};

studentSchema.methods.removeFromWishlist = async function (courseId) {
  this.wishlist = this.wishlist.filter(
    (id) => id.toString() !== courseId.toString()
  );
  await this.save();
  return this;
};
// Cart Methods
studentSchema.methods.addToCart = async function (courseId, price) {
  const existingItem = this.cart.items.find(
    (item) => item.courseId.toString() === courseId.toString()
  );

  if (existingItem) {
    throw new Error("Course already in cart");
  }

  this.cart.items.push({
    courseId,
    price
  });

  // Recalculate total
  this.cart.total = this.cart.items.reduce(
    (total, item) => total + item.price,
    0
  );
  this.cart.lastUpdated = new Date();

  await this.save();
  return this.cart;
};
studentSchema.methods.removeFromCart = async function (courseId) {
  // Convert courseId to ObjectId if it's a string
  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  // Filter out the item
  this.cart.items = this.cart.items.filter(
    (item) => !item.courseId.equals(courseObjectId)
  );

  // Mark the array as modified
  this.markModified("cart.items");

  // Save with validation disabled
  await this.save({ validateBeforeSave: false });
};

studentSchema.methods.clearCart = async function () {
  this.cart = {
    items: [],
    total: 0,
    lastUpdated: new Date()
  };

  await this.save();
  return this.cart;
};
studentSchema.methods.checkoutCart = async function () {
  // 1. Populate cart items with basic course info
  await this.populate({
    path: "cart.items.courseId",
    select: "_id title price"
  });

  // 2. Enroll student in all cart courses
  const enrolledCourses = this.cart.items.map((item) => ({
    courseId: item.courseId._id,
    enrolledAt: new Date()
  }));

  this.enrolledCourses.push(...enrolledCourses);

  // 3. Clear the cart
  this.cart = { items: [], total: 0 };

  // 4. Save changes
  await this.save();

  return { success: true, enrolledCourses };
};

// Payment Methods
studentSchema.methods.addPaymentMethod = async function (
  type,
  details,
  isDefault = false
) {
  // If setting as default, first unset any existing default
  if (isDefault) {
    this.paymentMethods.forEach((method) => {
      method.isDefault = false;
    });
  }

  this.paymentMethods.push({
    type,
    details,
    isDefault
  });

  await this.save();
  return this.paymentMethods;
};

studentSchema.methods.removePaymentMethod = async function (paymentMethodId) {
  this.paymentMethods = this.paymentMethods.filter(
    (method) => method._id.toString() !== paymentMethodId.toString()
  );

  await this.save();
  return this.paymentMethods;
};

studentSchema.methods.setDefaultPaymentMethod = async function (
  paymentMethodId
) {
  // First unset any existing default
  this.paymentMethods.forEach((method) => {
    method.isDefault = false;
  });

  // Set the new default
  const method = this.paymentMethods.id(paymentMethodId);
  if (method) {
    method.isDefault = true;
  }

  await this.save();
  return this.paymentMethods;
};
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
