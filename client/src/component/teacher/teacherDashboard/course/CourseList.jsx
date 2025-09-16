/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiUser,
  FiSearch,
  FiFilter,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiVideo,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";
import { FiImage } from "react-icons/fi";
import { FiUpload } from "react-icons/fi";
import { FiYoutube } from "react-icons/fi";

const CourseList = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // For string categories
  const [editingCourse, setEditingCourse] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: null,
    thumbnailPreview: null,
    attachments: [],
    content: [],
    price: "",
    categories: [],
    level: "beginner",
    category: "",
  });
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));
  const teacherId = teacherData?._id;

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/teacher/all-category`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
        },
      });

      const categoriesData = response.data.data || response.data;

      // If categories are objects with name properties, extract names
      const categoryNames = Array.isArray(categoriesData)
        ? categoriesData.map((cat) => cat.name || cat)
        : [];
      setCategories(categoryNames);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load categories");
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchCourses();
    }
  }, [teacherId]);

  const fetchCourses = async () => {
    const delay = new Promise((res) => setTimeout(res, 1000)); // 1s minimum loading
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${base_url}/api/teacher/my-courses/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );

      // Handle both response structures
      const coursesData = response.data.data || response.data;
      setCourses(coursesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      await delay;
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Fix the type filtering logic
    const matchesFilterType =
      filterType === "all" || course.type === filterType;

    // Fix category filtering - case insensitive comparison
    const matchesFilterCategory =
      filterCategory === "all" ||
      (course.categories || []).some(
        (cat) => cat.toLowerCase() === filterCategory.toLowerCase()
      );

    // Safely handle all possible level values
    const courseLevel = String(course.level || "")
      .toLowerCase()
      .trim();
    const matchesFilterLevel =
      filterLevel === "all" || courseLevel === filterLevel.toLowerCase();

    return (
      matchesSearch &&
      matchesFilterType &&
      matchesFilterCategory &&
      matchesFilterLevel
    );
  });

  const levelOptions = ["beginner", "intermediate", "advanced"];
  const categoryOptions = Array.from(
    new Set(
      (courses || [])
        .flatMap((c) => c.categories || [])
        .map((cat) => cat.toLowerCase())
    )
  );
  const startEdit = (course) => {
    setEditingCourse(course._id);

    // Set existing thumbnail and attachments
    if (course.thumbnail) {
      setExistingThumbnail(course.thumbnail);
    }
    if (course.attachments && course.attachments.length > 0) {
      setExistingAttachments(course.attachments);
    }

    // Determine the initial category value
    let initialCategory = "";
    if (course.category) {
      initialCategory = course.category;
    } else if (course.categories && course.categories.length > 0) {
      initialCategory = course.categories[0];
    }

    // Transform the course data to match our form state
    setCourseData({
      title: course.title,
      description: course.description,
      thumbnail: null,
      attachments: [],
      content: course.content.map((item) => {
        if (item.type === "tutorial") {
          return {
            ...item,
            // Preserve existing content for premium tutorials
            ...(course.type === "premium" && item.content
              ? { content: item.content }
              : {}),
            contentFile: null,
          };
        }
        if (item.type === "quiz") {
          return {
            ...item,
            questions: item.questions.map((q) => ({
              ...q,
              options: q.options || [],
              correctAnswer:
                q.correctAnswer || (q.type === "mcq-multiple" ? [] : 0),
            })),
          };
        }
        return item;
      }),
      type: course.type,
      price: course.price,
      categories: course.categories || [],
      level: course.level || "beginner",
      category: initialCategory,
    });
    // Expand all sections by default
    const expanded = {};
    course.content.forEach((item) => {
      expanded[item._id] = true;
    });
    setExpandedSections(expanded);
  };
  const cancelEdit = () => {
    setEditingCourse(null);
    setCourseData({
      title: "",
      description: "",
      thumbnail: null,
      attachments: [],
      content: [],
      price: "",
      categories: [],
      level: "beginner",
      category: "",
    });
    setExistingThumbnail(null);
    setExistingAttachments([]);
  };

  // Edit form handlers
  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const addTutorial = (isPremium = false) => {
    const newTutorial = {
      id: Date.now(),
      type: "tutorial",
      title: "",
      description: "",
      isPremium: isPremium,
      isExpanded: true,
      // Initialize fields based on course type
      ...(isPremium
        ? {
            contentFile: null, // Will be replaced with file object when uploaded
            youtubeLink: undefined, // Explicitly remove for premium
          }
        : {
            youtubeLink: "", // Required for free courses
            contentFile: undefined, // Explicitly remove for free
          }),
      // Animation properties
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
    };

    setCourseData((prev) => ({
      ...prev,
      content: [...prev.content, newTutorial],
    }));

    setExpandedSections((prev) => ({
      ...prev,
      [newTutorial.id]: true,
    }));
  };

  const addQuiz = () => {
    const newQuiz = {
      id: Date.now(),
      type: "quiz",
      title: "",
      description: "",
      questions: [
        {
          id: Date.now() + 1,
          question: "",
          type: "mcq-single",
          options: ["", ""],
          correctAnswer: 0,
          answer: "",
          marks: 1,
        },
      ],
      isExpanded: true,
      // Animation properties
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
    };
    setCourseData((prev) => ({
      ...prev,
      content: [...prev.content, newQuiz],
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [newQuiz.id]: true,
    }));
  };

  const addLiveClass = () => {
    const newLiveClass = {
      id: Date.now(),
      type: "live",
      title: "",
      description: "",
      thumbnail: null,
      meetingLink: "",
      schedule: new Date().toISOString().slice(0, 16),
      isExpanded: true,
      // Animation properties
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
    };
    setCourseData((prev) => ({
      ...prev,
      content: [...prev.content, newLiveClass],
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [newLiveClass.id]: true,
    }));
  };

  const addQuestion = (quizId, questionType = "mcq-single") => {
    const baseQuestion = {
      id: Date.now(),
      question: "",
      type: questionType,
      marks: 1,
    };

    let question;
    switch (questionType) {
      case "mcq-single":
        question = {
          ...baseQuestion,
          options: ["", ""],
          correctAnswer: 0,
        };
        break;
      case "mcq-multiple":
        question = {
          ...baseQuestion,
          options: ["", ""],
          correctAnswer: [],
        };
        break;
      case "short-answer":
      case "broad-answer":
        question = {
          ...baseQuestion,
          expectedAnswer: "", // Use expectedAnswer instead of answer
        };
        break;
      default:
        question = baseQuestion;
    }

    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: [...(item.questions || []), question],
          };
        }
        return item;
      }),
    }));
  };

  const addOption = (quizId, questionId) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                return {
                  ...q,
                  options: [...(q.options || []), ""],
                };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const removeContentItem = (id) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.filter((item) => item.id !== id && item._id !== id),
    }));
  };

  // In your CourseList component, update the handleInputChange function:
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // When course type changes
    if (name === "type") {
      setCourseData((prev) => {
        let updatedContent = [...prev.content];

        // If switching to live course
        if (value === "live") {
          // Remove all non-live content
          updatedContent = prev.content.filter((item) => item.type === "live");

          // If no live sessions exist, add one by default
          if (updatedContent.length === 0) {
            updatedContent = [
              {
                id: Date.now(),
                type: "live",
                title: "New Live Session",
                description: "",
                meetingLink: "",
                schedule: new Date().toISOString().slice(0, 16),
                isExpanded: true,
              },
            ];
          }
        }
        // If switching from live to another type
        else if (prev.type === "live") {
          // Remove all live content
          updatedContent = prev.content.filter((item) => item.type !== "live");
        }
        // If switching between free/premium
        else {
          // Transform tutorial content
          updatedContent = prev.content.map((item) => {
            if (item.type === "tutorial") {
              if (value === "premium") {
                // Switching to premium - remove youtubeLink and ensure contentFile exists
                const { youtubeLink, ...rest } = item;
                return {
                  ...rest,
                  contentFile: rest.contentFile || null,
                  content: rest.content || null,
                };
              } else {
                // Switching to free - remove content and ensure youtubeLink exists
                const { content, contentFile, ...rest } = item;
                return {
                  ...rest,
                  youtubeLink: rest.youtubeLink || "",
                };
              }
            }
            return item;
          });
        }

        return {
          ...prev,
          [name]: value,
          content: updatedContent,
          price: value === "premium" || value === "live" ? prev.price : "",
        };
      });
    } else {
      setCourseData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const calculateQuizTotalMarks = (quiz) => {
    return (quiz.questions || []).reduce(
      (total, question) => total + (question.marks || 1),
      0
    );
  };
  const handleContentChange = (id, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === id || item._id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  const handleQuestionChange = (quizId, questionId, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                return { ...q, [field]: value };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleOptionChange = (quizId, questionId, optionIndex, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                const newOptions = [...(q.options || [])];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleCorrectAnswerChange = (quizId, questionId, answerIndex) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (
                (q.id === questionId || q._id === questionId) &&
                q.type === "mcq-single"
              ) {
                return { ...q, correctAnswer: answerIndex };
              }
              if (
                (q.id === questionId || q._id === questionId) &&
                q.type === "mcq-multiple"
              ) {
                const currentAnswers = Array.isArray(q.correctAnswer)
                  ? q.correctAnswer
                  : [];
                const newAnswers = currentAnswers.includes(answerIndex)
                  ? currentAnswers.filter((a) => a !== answerIndex)
                  : [...currentAnswers, answerIndex];
                return { ...q, correctAnswer: newAnswers };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleAnswerChange = (quizId, questionId, value) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                // For short/broad answers, update expectedAnswer
                if (["short-answer", "broad-answer"].includes(q.type)) {
                  return { ...q, expectedAnswer: value };
                }
                // For MCQ questions, update answer (for student responses)
                else {
                  return { ...q, answer: value };
                }
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const handleFileUpload = (e, id, field = "contentFile") => {
    const file = e.target.files[0];
    if (file) {
      handleContentChange(id, field, file);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCourseData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: previewUrl,
      }));
      setExistingThumbnail(null);
    }
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    setCourseData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setCourseData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const removeExistingAttachment = (index) => {
    const attachmentToRemove = existingAttachments[index];
    setRemovedAttachments((prev) => [...prev, attachmentToRemove._id]);
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeOption = (quizId, questionId, optionIndex) => {
    setCourseData((prev) => ({
      ...prev,
      content: prev.content.map((item) => {
        if (item.id === quizId || item._id === quizId) {
          return {
            ...item,
            questions: item.questions.map((q) => {
              if (q.id === questionId || q._id === questionId) {
                const newOptions = (q.options || []).filter(
                  (_, i) => i !== optionIndex
                );
                let newCorrectAnswer = q.correctAnswer;

                if (q.type === "mcq-single") {
                  newCorrectAnswer =
                    newCorrectAnswer === optionIndex
                      ? 0
                      : newCorrectAnswer > optionIndex
                      ? newCorrectAnswer - 1
                      : newCorrectAnswer;
                } else if (q.type === "mcq-multiple") {
                  newCorrectAnswer = Array.isArray(newCorrectAnswer)
                    ? newCorrectAnswer
                        .filter((a) => a !== optionIndex)
                        .map((a) => (a > optionIndex ? a - 1 : a))
                    : [];
                }

                return {
                  ...q,
                  options: newOptions,
                  correctAnswer: newCorrectAnswer,
                };
              }
              return q;
            }),
          };
        }
        return item;
      }),
    }));
  };

  const updateCourse = async () => {
    try {
      // Validate required fields

      if (
        !courseData.title ||
        !courseData.description ||
        (!courseData.thumbnail && !existingThumbnail)
      ) {
        throw new Error("Please fill all required fields");
      }

      if (courseData.content.length === 0) {
        throw new Error("Please add at least one content item");
      }

      if (
        (courseData.type === "premium" || courseData.type === "live") &&
        !courseData.price
      ) {
        throw new Error("Please set a price for this course");
      }

      // Validate content items based on course type
      if (courseData.type === "live") {
        // Live courses can only contain live sessions
        const invalidItems = courseData.content.filter(
          (item) => item.type !== "live"
        );
        if (invalidItems.length > 0) {
          throw new Error("Live courses can only contain live sessions");
        }
      }
      // Transform and validate content items
      const processedContent = courseData.content.map((item) => {
        const contentItem = { ...item };

        // Handle tutorial content based on course type
        if (contentItem.type === "tutorial") {
          if (courseData.type === "premium") {
            delete contentItem.youtubeLink;

            const hasExistingContent =
              contentItem.content &&
              (contentItem.content.filename || contentItem.content._id);
            const hasNewUpload = contentItem.contentFile instanceof File;

            if (!hasExistingContent && !hasNewUpload) {
              throw new Error(
                `Please upload a video for tutorial "${contentItem.title}"`
              );
            }
            // If new upload, prepare it for submission
            if (hasNewUpload) {
              contentItem.content = {
                filename: contentItem.contentFile.name,
                size: contentItem.contentFile.size,
                mimetype: contentItem.contentFile.type,
              };
            }

            // Remove temporary field
            delete contentItem.contentFile;
          } else {
            // Free course - handle YouTube link
            delete contentItem.content;
            delete contentItem.contentFile;
            if (!contentItem.youtubeLink) {
              throw new Error(
                `Please add a YouTube link for tutorial "${contentItem.title}"`
              );
            }
          }
        }

        // Validate live classes
        if (contentItem.type === "live") {
          if (!contentItem.meetingLink) {
            throw new Error(
              `Please add a meeting link for live class "${contentItem.title}"`
            );
          }

          if (!contentItem.schedule) {
            throw new Error(
              `Please set a schedule for live class "${contentItem.title}"`
            );
          }
        }

        // Validate quizzes
        if (contentItem.type === "quiz") {
          if (contentItem.questions.length === 0) {
            throw new Error(
              `Please add at least one question to quiz "${contentItem.title}"`
            );
          }

          contentItem.questions.forEach((question) => {
            if (!question.question) {
              throw new Error(
                `Please add question text for all questions in quiz "${contentItem.title}"`
              );
            }

            if (["mcq-single", "mcq-multiple"].includes(question.type)) {
              if (question.options.length < 2) {
                throw new Error(
                  `Please add at least 2 options for MCQ questions in quiz "${contentItem.title}"`
                );
              }

              if (
                question.type === "mcq-single" &&
                question.correctAnswer === undefined
              ) {
                throw new Error(
                  `Please select a correct answer for all MCQ questions in quiz "${contentItem.title}"`
                );
              }

              if (
                question.type === "mcq-multiple" &&
                (!Array.isArray(question.correctAnswer) ||
                  question.correctAnswer.length === 0)
              ) {
                throw new Error(
                  `Please select at least one correct answer for multiple-choice questions in quiz "${contentItem.title}"`
                );
              }
            }
            return question;
          });
        }

        return contentItem;
      });

      // Prepare form data for upload
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);

      // Handle thumbnail
      if (courseData.thumbnail) {
        formData.append("thumbnail", courseData.thumbnail);
      }

      formData.append("type", courseData.type);
      formData.append(
        "price",
        courseData.type === "premium" || courseData.type === "live"
          ? courseData.price
          : 0
      );
      formData.append("content", JSON.stringify(processedContent));
      formData.append("categories", JSON.stringify([courseData.category]));
      formData.append("level", courseData.level);
      formData.append("status", "active");
      formData.append("category", courseData.category);

      // Handle attachments
      formData.append(
        "existingAttachments",
        JSON.stringify(
          existingAttachments.filter(
            (attachment) => !removedAttachments.includes(attachment._id)
          )
        )
      );

      // Add new attachments
      courseData.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      // Handle content files
      courseData.content.forEach((item) => {
        if (item.type === "tutorial" && courseData.type === "premium") {
          // Only append if it's a new file upload
          if (item.contentFile instanceof File) {
            formData.append("contentVideos", item.contentFile);
          }
        }

        if (item.type === "live" && item.thumbnail) {
          // Only append if thumbnail is a File object (new upload)
          if (item.thumbnail instanceof File) {
            formData.append("contentThumbnails", item.thumbnail);
          }
        }
      });

      // Show loading toast
      const loadingToast = toast.loading("Updating course...");

      // Make API call
      const response = await axios.put(
        `${base_url}/api/teacher/update-course/${editingCourse}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );

      // Success handling
      toast.dismiss(loadingToast);
      toast.success(`Course "${courseData.title}" updated successfully!`);

      // Update local state with new data
      const updatedCourse = response.data.data;
      if (updatedCourse.thumbnail) {
        setExistingThumbnail(updatedCourse.thumbnail);
      }

      // Refresh course list and reset edit mode
      fetchCourses();
      cancelEdit();
    } catch (error) {
      toast.dismiss();
      console.error("Update error:", error);

      // Show appropriate error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update course";
      toast.error(errorMessage);
    }
  };
  useEffect(() => {
    return () => {
      if (courseData.thumbnailPreview) {
        URL.revokeObjectURL(courseData.thumbnailPreview);
      }
    };
  }, [courseData.thumbnailPreview]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-2 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col"
    >
      <div className="max-w-full w-full mx-auto">
        {/* Header */}
        <div className="w-full mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 text-left">
            Course Management
          </h1>
          <p className="text-gray-600 mt-2">
            Streamline course creation and assign qualified instructors to
            ensure high-quality learning.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg  focus:border-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-600" />
            <div className="relative group w-full max-w-[220px]">
              <select
                className="
      block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:border-gray-500 cursor-pointer
      "
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all" className="text-gray-500 italic">
                  All Courses
                </option>
                <option
                  value="free"
                  className="text-gray-700 hover:bg-indigo-50"
                >
                  Free Courses
                </option>
                <option
                  value="premium"
                  className="text-gray-700 hover:bg-indigo-50"
                >
                  Premium Courses
                </option>
                <option
                  value="live"
                  className="text-gray-700 hover:bg-indigo-50"
                >
                  Live Courses
                </option>
              </select>

              <div
                className="
    absolute inset-y-0 right-0
    flex items-center pr-3
    pointer-events-none
    text-gray-400
    transition-all duration-200
    group-hover:text-gray-500
  "
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-200"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            {/* In the Search and Filter section, update the category filter dropdown to this: */}
            <div className="flex items-center space-x-2">
              <div className="relative group">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:border-gray-500 cursor-pointer"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all" className="text-gray-400 italic">
                    All Categories
                  </option>
                  {categoryOptions.map((cat) => (
                    <option
                      key={cat}
                      value={cat.toLowerCase()}
                      className="checked:bg-indigo-50 hover:bg-indigo-100"
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <div
                  className="
      pointer-events-none absolute inset-y-0 right-0
      flex items-center px-3 text-gray-400
      transition-transform duration-200
      group-hover:text-gray-500
      group-focus-within:rotate-180 group-focus-within:text-gray-600
    "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:border-gray-500 cursor-pointer"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  {levelOptions.map((level) => (
                    <option
                      key={level}
                      value={level.toLowerCase()}
                      className="checked:bg-gray-100"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
                <div
                  className="
      pointer-events-none absolute inset-y-0 right-0
      flex items-center px-3 text-gray-400
      transition-transform duration-200
      group-hover:text-gray-500
      group-focus-within:rotate-180 group-focus-within:text-gray-600
    "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No courses found matching your criteria
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <React.Fragment key={course._id}>
                {editingCourse === course._id ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Edit Course Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                          Edit {course.type === "free" ? "Free" : "Premium"}{" "}
                          Course
                        </h1>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 cursor-pointer hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Course Basic Info */}
                      <div className="mb-8">
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Title *
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={courseData.title}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-[6px] hover:border-gray-600 focus:border-gray-600 transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Description *
                            </label>
                            <textarea
                              name="description"
                              value={courseData.description}
                              onChange={handleInputChange}
                              rows={6}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 resize-vertical"
                              required
                              placeholder="Enter course description"
                            />
                          </div>

                          {/* Course Basic Info */}
                          <div className="my-4">
                            <div className="grid grid-cols-1 gap-6">
                              {/* Thumbnail Upload - Compact Version */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Course Thumbnail *
                                </label>

                                <div className="flex items-start gap-4">
                                  {/* Image Preview Box */}
                                  <div className="relative flex-shrink-0">
                                    {courseData.thumbnailPreview ||
                                    existingThumbnail ? (
                                      <div className="relative group">
                                        {/* Compact Image Preview (120x90 - 4:3 ratio) */}
                                        <div className="w-full md:w-48 h-32 rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                                          <img
                                            src={
                                              courseData.thumbnailPreview ||
                                              `${base_url}/courses/${existingThumbnail?.path}`
                                            }
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src =
                                                "/placeholder-image.jpg";
                                            }}
                                          />

                                          {/* Edit Button - Bottom Right Corner */}
                                          <motion.label
                                            initial={{
                                              opacity: 0,
                                              scale: 0.8,
                                              y: 10,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              scale: 1,
                                              y: 0,
                                            }}
                                            whileHover={{
                                              scale: 1.1,
                                              rotate: -5,
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{
                                              type: "spring",
                                              stiffness: 300,
                                              damping: 20,
                                            }}
                                            className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md border border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
                                          >
                                            <FiEdit2 className="text-gray-600 text-[16px]" />
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={handleThumbnailUpload}
                                              className="hidden"
                                            />
                                          </motion.label>
                                        </div>

                                        {/* Remove Button - Top Right Corner */}
                                        <motion.button
                                          onClick={() => {
                                            setCourseData((prev) => ({
                                              ...prev,
                                              thumbnail: null,
                                              thumbnailPreview: null,
                                            }));
                                            setExistingThumbnail(null);
                                          }}
                                          initial={{
                                            opacity: 0,
                                            scale: 0.8,
                                            y: -10,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            scale: 1,
                                            y: 0,
                                          }}
                                          whileHover={{
                                            scale: 1.1,
                                            rotate: 10,
                                          }}
                                          whileTap={{ scale: 0.9 }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20,
                                          }}
                                          className="absolute -right-2 -top-2 bg-white p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-red-50 text-red-500"
                                          type="button"
                                        >
                                          <FiTrash2 className="text-[16px]" />
                                        </motion.button>
                                      </div>
                                    ) : (
                                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors w-56 flex justify-center items-center border border-gray-300 hover:border-gray-500">
                                        <FiUpload className="inline mr-2" />
                                        Upload Thumbnail
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleThumbnailUpload}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>

                                  {/* File Info */}
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">
                                      {courseData.thumbnail ? (
                                        <>
                                          <span className="font-medium text-gray-700">
                                            New upload:
                                          </span>{" "}
                                          {courseData.thumbnail.name}
                                          <br />
                                          {(
                                            courseData.thumbnail.size / 1024
                                          ).toFixed(1)}{" "}
                                          KB •{" "}
                                          {courseData.type === "premium"
                                            ? "Premium"
                                            : "Free"}{" "}
                                          course
                                        </>
                                      ) : existingThumbnail ? (
                                        <>
                                          <span className="font-medium text-gray-700">
                                            Current:
                                          </span>{" "}
                                          {existingThumbnail.filename}
                                          <br />
                                          {(
                                            existingThumbnail.size / 1024
                                          ).toFixed(1)}{" "}
                                          KB
                                        </>
                                      ) : (
                                        "No thumbnail selected (Recommended: 800×450px)"
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                      JPG, PNG, or WebP. Max 2MB.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Course Type Selector */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Course Type *
                                </label>
                                <select
                                  name="type"
                                  value={courseData.type}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500"
                                  required
                                >
                                  <option value="free">Free</option>
                                  <option value="premium">Premium</option>
                                  <option value="live">Live</option>
                                </select>
                              </div>

                              {/* Pricing (show only for premium courses) */}
                              {(courseData.type === "premium" ||
                                courseData.type === "live") && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price *
                                  </label>
                                  <div className="flex items-center">
                                    <span className="mr-2 text-gray-700">
                                      ৳
                                    </span>
                                    <input
                                      type="number"
                                      name="price"
                                      value={courseData.price}
                                      onChange={handleInputChange}
                                      placeholder="Enter course price"
                                      min="0"
                                      step="0.01"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500 hover:border-gray-500 transition-colors"
                                      required
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Attachments (PDFs, Docs, etc.)
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors w-56 flex justify-center items-center border border-gray-300 hover:border-gray-500">
                                <FiUpload className="inline mr-2" />
                                Upload Files
                                <input
                                  type="file"
                                  multiple
                                  onChange={handleAttachmentUpload}
                                  className="hidden"
                                />
                              </label>
                              <div className="flex flex-wrap gap-2 max-h-36 overflow-auto w-full">
                                {existingAttachments
                                  .filter(
                                    (attachment) =>
                                      !removedAttachments.includes(
                                        attachment._id
                                      )
                                  )
                                  .map((file, index) => (
                                    <div
                                      key={index}
                                      className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center max-w-xs border border-gray-200"
                                    >
                                      <span className="truncate max-w-xs">
                                        {file.filename}
                                      </span>
                                      <button
                                        onClick={() =>
                                          removeExistingAttachment(index)
                                        }
                                        className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                                      >
                                        <FiTrash2 size={14} />
                                      </button>
                                    </div>
                                  ))}
                                {courseData.attachments.map((file, index) => (
                                  <div
                                    key={`new-${index}`}
                                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center max-w-xs border border-gray-200"
                                  >
                                    <span className="truncate max-w-xs">
                                      {file.name}
                                    </span>
                                    <button
                                      onClick={() => removeAttachment(index)}
                                      className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* In the edit form section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category *
                            </label>
                            {categories && categories.length > 0 ? (
                              <select
                                name="category"
                                value={courseData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500"
                                required
                              >
                                <option value="">Select a category</option>
                                {categories.map((category, index) => (
                                  <option key={index} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-red-500 text-sm">
                                No categories available. Please add categories
                                first.
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Level
                            </label>
                            <select
                              name="level"
                              value={courseData.level}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 transition-colors"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold text-gray-800">
                            Course Content
                          </h2>
                          <div className="flex gap-3">
                            {courseData.type === "live" ? (
                              <motion.button
                                onClick={addLiveClass}
                                className="bg-theme_color text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FiPlus className="mr-2" />
                                Add Live Session
                              </motion.button>
                            ) : (
                              <>
                                <motion.button
                                  onClick={() =>
                                    addTutorial(courseData.type === "premium")
                                  }
                                  className="bg-theme_color text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <FiPlus className="mr-2" />
                                  Add Tutorial
                                </motion.button>
                                <motion.button
                                  onClick={addQuiz}
                                  className="bg-theme_color text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <FiPlus className="mr-2" />
                                  Add Quiz
                                </motion.button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <AnimatePresence>
                            {courseData.content.map((item, index) => (
                              <motion.div
                                key={item.id || item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="border border-gray-200 rounded-lg p-0 relative hover:border-gray-500 transition-colors hover:shadow-md"
                                whileHover={{ scale: 1 }}
                              >
                                <div
                                  className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer rounded-t-lg"
                                  onClick={() =>
                                    toggleSection(item.id || item._id)
                                  }
                                >
                                  <div className="flex items-center">
                                    <h3 className="font-medium text-gray-800">
                                      {index + 1}.{" "}
                                      {item.type === "tutorial"
                                        ? "Tutorial"
                                        : item.type === "quiz"
                                        ? "Quiz"
                                        : "Live Class"}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeContentItem(item.id || item._id);
                                      }}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <FiTrash2 />
                                    </button>
                                    {expandedSections[item.id || item._id] ? (
                                      <FiChevronUp className="text-gray-500" />
                                    ) : (
                                      <FiChevronDown className="text-gray-500" />
                                    )}
                                  </div>
                                </div>
                                {expandedSections[item.id || item._id] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-6"
                                  >
                                    {item.type === "tutorial" ? (
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title *
                                          </label>
                                          <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "title",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 transition-colors"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                          </label>
                                          <textarea
                                            value={item.description}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "description",
                                                e.target.value
                                              )
                                            }
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 resize-vertical"
                                            placeholder="Enter tutorial description"
                                          />
                                        </div>
                                        {courseData.type === "free" ? (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              YouTube Video Link *
                                            </label>
                                            <div className="flex items-center">
                                              <FiYoutube className="text-red-500 mr-2 text-xl" />
                                              <input
                                                type="url"
                                                value={item.youtubeLink || ""}
                                                onChange={(e) =>
                                                  handleContentChange(
                                                    item.id || item._id,
                                                    "youtubeLink",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500 hover:border-gray-500 transition-colors"
                                                required
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Video Content *
                                            </label>
                                            <div className="flex items-center gap-2">
                                              {item.contentFile ||
                                              (item.content &&
                                                (item.content.filename ||
                                                  item.content._id)) ? (
                                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                                                  <FiVideo className="text-gray-600" />
                                                  <span className="text-sm truncate max-w-xs">
                                                    {item.contentFile instanceof
                                                    File
                                                      ? item.contentFile.name
                                                      : item.content
                                                          ?.filename ||
                                                        "Uploaded video"}
                                                  </span>
                                                </div>
                                              ) : (
                                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors inline-flex items-center border border-gray-300 hover:border-gray-500">
                                                  <FiUpload className="mr-2" />
                                                  Select Video File
                                                  <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => {
                                                      const file =
                                                        e.target.files[0];
                                                      if (file) {
                                                        handleContentChange(
                                                          item.id || item._id,
                                                          "contentFile",
                                                          file
                                                        );
                                                      }
                                                    }}
                                                    className="hidden"
                                                  />
                                                </label>
                                              )}

                                              {(item.contentFile ||
                                                item.content) && (
                                                <button
                                                  onClick={() => {
                                                    handleContentChange(
                                                      item.id || item._id,
                                                      "contentFile",
                                                      null
                                                    );
                                                    // Also clear existing content if present
                                                    if (item.content) {
                                                      handleContentChange(
                                                        item.id || item._id,
                                                        "content",
                                                        null
                                                      );
                                                    }
                                                  }}
                                                  className="text-gray-400 hover:text-red-500 p-2 rounded-full"
                                                  type="button"
                                                >
                                                  <FiTrash2 size={20} />
                                                </button>
                                              )}
                                            </div>

                                            {item.contentFile &&
                                              typeof item.contentFile ===
                                                "object" && (
                                                <div className="mt-2 text-sm text-gray-500">
                                                  Selected:{" "}
                                                  {item.contentFile.name} (
                                                  {(
                                                    item.contentFile.size /
                                                    (1024 * 1024)
                                                  ).toFixed(2)}{" "}
                                                  MB)
                                                </div>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                    ) : item.type === "live" ? (
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title *
                                          </label>
                                          <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "title",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 transition-colors"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                          </label>
                                          <textarea
                                            value={item.description}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "description",
                                                e.target.value
                                              )
                                            }
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 resize-vertical"
                                            placeholder="Enter quiz description"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Meeting Link (Zoom/Google Meet)
                                          </label>
                                          <input
                                            type="url"
                                            value={item.meetingLink}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "meetingLink",
                                                e.target.value
                                              )
                                            }
                                            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 transition-colors"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Schedule *
                                          </label>
                                          <input
                                            type="datetime-local"
                                            value={item.schedule}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "schedule",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500"
                                            required
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-medium text-gray-800 mb-2">
                                            Quiz Title *
                                          </h4>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quiz Title *
                                          </label>
                                          <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "title",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 transition-colors"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                          </label>
                                          <textarea
                                            value={item.description}
                                            onChange={(e) =>
                                              handleContentChange(
                                                item.id || item._id,
                                                "description",
                                                e.target.value
                                              )
                                            }
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 resize-vertical"
                                            placeholder="Enter live class description"
                                          />
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-800">
                                              Total Quiz Marks:{" "}
                                              {calculateQuizTotalMarks(item)}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                              {(item.questions || []).length}{" "}
                                              question
                                              {(item.questions || []).length !==
                                              1
                                                ? "s"
                                                : ""}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="space-y-6">
                                          {item.questions.map(
                                            (question, qIndex) => (
                                              <motion.div
                                                key={
                                                  question.id || question._id
                                                }
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="border-l-4 border-gray-500 pl-4 my-4"
                                              >
                                                <div className="flex justify-between items-start mb-2">
                                                  <h4 className="font-medium text-gray-800 mb-2">
                                                    Question {qIndex + 1}
                                                  </h4>
                                                  <div className="flex gap-2">
                                                    <select
                                                      value={question.type}
                                                      onChange={(e) =>
                                                        handleQuestionChange(
                                                          item.id || item._id,
                                                          question.id ||
                                                            question._id,
                                                          "type",
                                                          e.target.value
                                                        )
                                                      }
                                                      className="text-sm border border-gray-300 rounded px-2 py-1  focus:border-gray-500 hover:border-gray-500 transition-colors"
                                                    >
                                                      <option value="mcq-single">
                                                        Single Choice MCQ
                                                      </option>
                                                      <option value="mcq-multiple">
                                                        Multiple Choice MCQ
                                                      </option>
                                                      <option value="short-answer">
                                                        Short Answer
                                                      </option>
                                                      <option value="broad-answer">
                                                        Broad Answer
                                                      </option>
                                                    </select>
                                                    <button
                                                      onClick={() => {
                                                        setCourseData(
                                                          (prev) => ({
                                                            ...prev,
                                                            content:
                                                              prev.content.map(
                                                                (
                                                                  contentItem
                                                                ) => {
                                                                  if (
                                                                    contentItem.id ===
                                                                      item.id ||
                                                                    contentItem._id ===
                                                                      item._id
                                                                  ) {
                                                                    return {
                                                                      ...contentItem,
                                                                      questions:
                                                                        contentItem.questions.filter(
                                                                          (q) =>
                                                                            q.id !==
                                                                            (question.id ||
                                                                              question._id)
                                                                        ),
                                                                    };
                                                                  }
                                                                  return contentItem;
                                                                }
                                                              ),
                                                          })
                                                        );
                                                      }}
                                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                      <FiTrash2 size={14} />
                                                    </button>
                                                  </div>
                                                </div>
                                                <div className="mb-3">
                                                  <input
                                                    type="text"
                                                    value={question.question}
                                                    onChange={(e) =>
                                                      handleQuestionChange(
                                                        item.id || item._id,
                                                        question.id ||
                                                          question._id,
                                                        "question",
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder="Enter question"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 hover:border-gray-500 transition-colors"
                                                    required
                                                  />
                                                </div>
                                                <div className="mb-3">
                                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Marks/Points
                                                  </label>
                                                  <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={question.marks || 1}
                                                    onChange={(e) =>
                                                      handleQuestionChange(
                                                        item.id || item._id,
                                                        question.id ||
                                                          question._id,
                                                        "marks",
                                                        parseInt(
                                                          e.target.value
                                                        ) || 1
                                                      )
                                                    }
                                                    placeholder="Enter marks for this question"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-500 transition-colors"
                                                    required
                                                  />
                                                </div>
                                                {[
                                                  "mcq-single",
                                                  "mcq-multiple",
                                                ].includes(question.type) ? (
                                                  <div className="space-y-2">
                                                    {question.options.map(
                                                      (option, oIndex) => (
                                                        <div
                                                          key={oIndex}
                                                          className={`flex items-center gap-2 p-2 rounded-lg ${
                                                            (question.type ===
                                                              "mcq-single" &&
                                                              question.correctAnswer ===
                                                                oIndex) ||
                                                            (question.type ===
                                                              "mcq-multiple" &&
                                                              Array.isArray(
                                                                question.correctAnswer
                                                              ) &&
                                                              question.correctAnswer.includes(
                                                                oIndex
                                                              ))
                                                              ? "border-2 border-green-500 bg-green-50"
                                                              : "border border-gray-300"
                                                          }`}
                                                        >
                                                          <input
                                                            type={
                                                              question.type ===
                                                              "mcq-single"
                                                                ? "radio"
                                                                : "checkbox"
                                                            }
                                                            name={`correct-${
                                                              question.id ||
                                                              question._id
                                                            }`}
                                                            checked={
                                                              question.type ===
                                                              "mcq-single"
                                                                ? question.correctAnswer ===
                                                                  oIndex
                                                                : Array.isArray(
                                                                    question.correctAnswer
                                                                  ) &&
                                                                  question.correctAnswer.includes(
                                                                    oIndex
                                                                  )
                                                            }
                                                            onChange={() =>
                                                              handleCorrectAnswerChange(
                                                                item.id ||
                                                                  item._id,
                                                                question.id ||
                                                                  question._id,
                                                                oIndex
                                                              )
                                                            }
                                                            className={`focus:ring-green-500 h-4 w-4 ${
                                                              question.type ===
                                                              "mcq-single"
                                                                ? "text-green-600"
                                                                : "text-green-600"
                                                            }`}
                                                          />
                                                          <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) =>
                                                              handleOptionChange(
                                                                item.id ||
                                                                  item._id,
                                                                question.id ||
                                                                  question._id,
                                                                oIndex,
                                                                e.target.value
                                                              )
                                                            }
                                                            className="flex-1 px-3 py-1 border-none focus:ring-0 bg-transparent"
                                                            placeholder={`Option ${
                                                              oIndex + 1
                                                            }`}
                                                            required
                                                          />
                                                          {question.options
                                                            .length > 2 && (
                                                            <button
                                                              onClick={() =>
                                                                removeOption(
                                                                  item.id ||
                                                                    item._id,
                                                                  question.id ||
                                                                    question._id,
                                                                  oIndex
                                                                )
                                                              }
                                                              className="text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                              <FiTrash2
                                                                size={14}
                                                              />
                                                            </button>
                                                          )}
                                                        </div>
                                                      )
                                                    )}
                                                    <div className="flex justify-end">
                                                      <motion.button
                                                        onClick={() =>
                                                          addOption(
                                                            item.id || item._id,
                                                            question.id ||
                                                              question._id
                                                          )
                                                        }
                                                        className="text-green-600 hover:text-green-800 flex items-center text-sm mt-2 bg-green-50 hover:bg-green-100 px-3 py-1 rounded border border-green-200"
                                                        whileHover={{
                                                          scale: 1.05,
                                                        }}
                                                        whileTap={{
                                                          scale: 0.95,
                                                        }}
                                                      >
                                                        <FiPlus className="mr-1" />{" "}
                                                        Add Option
                                                      </motion.button>
                                                    </div>
                                                  </div>
                                                ) : question.type ===
                                                  "short-answer" ? (
                                                  <div className="mt-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      Expected Answer
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={
                                                        question.expectedAnswer ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        handleAnswerChange(
                                                          item.id || item._id,
                                                          question.id ||
                                                            question._id,
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Enter expected answer"
                                                      className={`w-full px-4 py-2 border rounded-lg  focus:border-gray-500 transition-colors ${
                                                        question.expectedAnswer
                                                          ? "border-green-500 bg-green-50"
                                                          : "border-gray-300"
                                                      }`}
                                                    />
                                                  </div>
                                                ) : question.type ===
                                                  "broad-answer" ? (
                                                  <div className="mt-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                      Expected Answer
                                                    </label>
                                                    <textarea
                                                      value={
                                                        question.expectedAnswer ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        handleAnswerChange(
                                                          item.id || item._id,
                                                          question.id ||
                                                            question._id,
                                                          e.target.value
                                                        )
                                                      }
                                                      rows={6}
                                                      className={`w-full px-4 py-2 border rounded-lg  focus:border-gray-500 resize-vertical ${
                                                        question.expectedAnswer
                                                          ? "border-green-500 bg-green-50"
                                                          : "border-gray-300"
                                                      }`}
                                                      placeholder="Enter expected answer"
                                                    />
                                                  </div>
                                                ) : null}
                                              </motion.div>
                                            )
                                          )}
                                          <div className="flex flex-wrap gap-2">
                                            <button
                                              onClick={() =>
                                                addQuestion(
                                                  item.id || item._id,
                                                  "mcq-single"
                                                )
                                              }
                                              className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                            >
                                              <FiPlus className="mr-1" /> Single
                                              Choice
                                            </button>
                                            <button
                                              onClick={() =>
                                                addQuestion(
                                                  item.id || item._id,
                                                  "mcq-multiple"
                                                )
                                              }
                                              className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                            >
                                              <FiPlus className="mr-1" />{" "}
                                              Multiple Choice
                                            </button>
                                            <button
                                              onClick={() =>
                                                addQuestion(
                                                  item.id || item._id,
                                                  "short-answer"
                                                )
                                              }
                                              className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                            >
                                              <FiPlus className="mr-1" /> Short
                                              Answer
                                            </button>
                                            <button
                                              onClick={() =>
                                                addQuestion(
                                                  item.id || item._id,
                                                  "broad-answer"
                                                )
                                              }
                                              className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm flex items-center border border-green-200 transition-colors"
                                            >
                                              <FiPlus className="mr-1" /> Broad
                                              Answer
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Publish Button */}
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-medium transition-colors shadow-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={updateCourse}
                          className="cursor-pointer bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors shadow-md hover:bg-gray-800 hover:text-gray-100"
                        >
                          Update Course
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Course Thumbnail */}
                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden relative group cursor-pointer">
                          {/* Thumbnail Image with hover effects */}
                          <div className="relative w-full h-full">
                            <img
                              src={`${base_url}/courses/${course.thumbnail.path}`}
                              alt={course.title}
                              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />

                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Course type badge */}
                            <span
                              className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${
                                course.type === "premium"
                                  ? "bg-yellow-500 text-white"
                                  : course.type === "live"
                                  ? "bg-purple-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              {course.type === "premium"
                                ? "Premium"
                                : course.type === "live"
                                ? "Live"
                                : "Free"}
                            </span>
                          </div>

                          {/* Loading skeleton */}
                          {!course.thumbnail?.path && (
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                              <FiImage className="text-gray-400 text-2xl" />
                            </div>
                          )}

                          {/* Hover title overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-sm font-medium truncate">
                              {course.title}
                            </p>
                            {course.type === "live" &&
                              course.content?.[0]?.schedule && (
                                <p className="text-white text-xs mt-1">
                                  Next session:{" "}
                                  {new Date(
                                    course.content[0].schedule
                                  ).toLocaleString()}
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Course Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">
                                {course.title}
                              </h2>
                              <div
                                className="text-sm text-gray-500 line-clamp-1 overflow-hidden"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    course.description
                                  ),
                                }}
                              />
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {course.level && (
                                  <span className="bg-black text-white text-xs px-2 py-1 rounded-md">
                                    {typeof course.level === "string"
                                      ? course.level.charAt(0).toUpperCase() +
                                        course.level.slice(1)
                                      : course.level}
                                  </span>
                                )}
                                {course.categories &&
                                  course.categories.map((category, index) => (
                                    <span
                                      key={index}
                                      className="bg-black text-white text-xs px-2 py-1 rounded-md"
                                    >
                                      {category}
                                    </span>
                                  ))}
                                {course.type === "live" && (
                                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md">
                                    {course.content?.length || 0} Sessions
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(course)}
                                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                              >
                                <FiEdit2 />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-4 items-center">
                            {/* Price display for premium and live courses */}
                            {(course.type === "premium" ||
                              course.type === "live") && (
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-green-600">
                                  ৳{course.price}
                                </span>
                              </div>
                            )}

                            <div className="text-sm text-gray-500">
                              {course.totalStudents.toLocaleString()} students
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseList;
