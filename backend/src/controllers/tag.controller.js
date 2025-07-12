    import { Tag } from "../models/Tag.model.js";
    // import Question from "../models/Question.model.js";
    import { QuestionTag } from "../models/QuestionTag.model.js";
    import { ApiError } from "../utils/apiError.js";
    import { ApiResponse } from "../utils/apiResponse.js";
    import { asyncHandler } from "../utils/asyncHandler.js";

    // Create a new tag
    const createTag = asyncHandler(async (req, res) => {
        const { name } = req.body;

        // Validate input
        if (!name || name.trim() === '') {
            throw new ApiError(400, "Tag name is required");
        }

        // Check if tag already exists (case-insensitive)
        const existingTag = await Tag.findOne({ name: name.toLowerCase().trim() });
        if (existingTag) {
            throw new ApiError(409, "Tag already exists");
        }

        // Create new tag
        const tag = await Tag.create({
            name: name.toLowerCase().trim()
        });

        res.status(201).json(
            new ApiResponse(201, tag, "Tag created successfully")
        );
    });

    // Get all tags with pagination and search
    const getAllTags = asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

        // Build search filter
        const searchFilter = search 
            ? { name: { $regex: search, $options: 'i' } }
            : {};

        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get tags with pagination
        const tags = await Tag.find(searchFilter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalTags = await Tag.countDocuments(searchFilter);

        // Get question counts for each tag
        const tagsWithCounts = await Promise.all(
            tags.map(async (tag) => {
                const questionCount = await QuestionTag.countDocuments({ tagId: tag._id });
                return {
                    ...tag.toObject(),
                    questionCount
                };
            })
        );

        const pagination = {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTags / limit),
            totalTags,
            hasNextPage: page < Math.ceil(totalTags / limit),
            hasPrevPage: page > 1
        };

        res.status(200).json(
            new ApiResponse(200, { tags: tagsWithCounts, pagination }, "Tags retrieved successfully")
        );
    });

    // Get a specific tag by ID
    const getTagById = asyncHandler(async (req, res) => {
        const { tagId } = req.params;

        const tag = await Tag.findById(tagId);
        if (!tag) {
            throw new ApiError(404, "Tag not found");
        }

        // Get question count for this tag
        const questionCount = await QuestionTag.countDocuments({ tagId: tag._id });

        const tagWithCount = {
            ...tag.toObject(),
            questionCount
        };

        res.status(200).json(
            new ApiResponse(200, tagWithCount, "Tag retrieved successfully")
        );
    });

    // Get a specific tag by name
    const getTagByName = asyncHandler(async (req, res) => {
        const { tagName } = req.params;

        const tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
            throw new ApiError(404, "Tag not found");
        }

        // Get question count for this tag
        const questionCount = await QuestionTag.countDocuments({ tagId: tag._id });

        const tagWithCount = {
            ...tag.toObject(),
            questionCount
        };

        res.status(200).json(
            new ApiResponse(200, tagWithCount, "Tag retrieved successfully")
        );
    });

    // Update a tag
    const updateTag = asyncHandler(async (req, res) => {
        const { tagId } = req.params;
        const { name } = req.body;

        // Validate input
        if (!name || name.trim() === '') {
            throw new ApiError(400, "Tag name is required");
        }

        // Check if tag exists
        const tag = await Tag.findById(tagId);
        if (!tag) {
            throw new ApiError(404, "Tag not found");
        }

        // Check if new name already exists (case-insensitive)
        const existingTag = await Tag.findOne({ 
            name: name.toLowerCase().trim(),
            _id: { $ne: tagId }
        });
        if (existingTag) {
            throw new ApiError(409, "Tag name already exists");
        }

        // Update tag
        const updatedTag = await Tag.findByIdAndUpdate(
            tagId,
            { name: name.toLowerCase().trim() },
            { new: true, runValidators: true }
        );

        res.status(200).json(
            new ApiResponse(200, updatedTag, "Tag updated successfully")
        );
    });

    // Delete a tag
    const deleteTag = asyncHandler(async (req, res) => {
        const { tagId } = req.params;

        // Check if tag exists
        const tag = await Tag.findById(tagId);
        if (!tag) {
            throw new ApiError(404, "Tag not found");
        }

        // Delete all question-tag relationships for this tag
        await QuestionTag.deleteMany({ tagId });

        // Delete the tag
        await Tag.findByIdAndDelete(tagId);

        res.status(200).json(
            new ApiResponse(200, {}, "Tag deleted successfully")
        );
    });

    // Add tag to question
    // const addTagToQuestion = asyncHandler(async (req, res) => {
    //     const { questionId, tagId } = req.params;

    //     // Check if question exists
    //     const question = await Question.findById(questionId);
    //     if (!question) {
    //         throw new ApiError(404, "Question not found");
    //     }

    //     // Check if tag exists
    //     const tag = await Tag.findById(tagId);
    //     if (!tag) {
    //         throw new ApiError(404, "Tag not found");
    //     }

    //     // Check if relationship already exists
    //     const existingRelation = await QuestionTag.findOne({ questionId, tagId });
    //     if (existingRelation) {
    //         throw new ApiError(409, "Tag is already associated with this question");
    //     }

    //     // Create the relationship
    //     const questionTag = await QuestionTag.create({ questionId, tagId });

    //     // Return the created relationship with populated data
    //     const populatedRelation = await QuestionTag.findById(questionTag._id)
    //         .populate('questionId', 'title')
    //         .populate('tagId', 'name');

    //     res.status(201).json(
    //         new ApiResponse(201, populatedRelation, "Tag added to question successfully")
    //     );
    // });

    // // Remove tag from question
    // const removeTagFromQuestion = asyncHandler(async (req, res) => {
    //     const { questionId, tagId } = req.params;

    //     // Check if relationship exists
    //     const questionTag = await QuestionTag.findOne({ questionId, tagId });
    //     if (!questionTag) {
    //         throw new ApiError(404, "Tag is not associated with this question");
    //     }

    //     // Delete the relationship
    //     await QuestionTag.findByIdAndDelete(questionTag._id);

    //     res.status(200).json(
    //         new ApiResponse(200, {}, "Tag removed from question successfully")
    //     );
    // });

    // // Get all tags for a specific question
    // const getTagsForQuestion = asyncHandler(async (req, res) => {
    //     const { questionId } = req.params;

    //     // Check if question exists
    //     const question = await Question.findById(questionId);
    //     if (!question) {
    //         throw new ApiError(404, "Question not found");
    //     }

    //     // Get all tags for this question
    //     const questionTags = await QuestionTag.find({ questionId })
    //         .populate('tagId', 'name createdAt');

    //     const tags = questionTags.map(qt => qt.tagId);

    //     res.status(200).json(
    //         new ApiResponse(200, tags, "Question tags retrieved successfully")
    //     );
    // });

    // // Get all questions for a specific tag
    // const getQuestionsForTag = asyncHandler(async (req, res) => {
    //     const { tagId } = req.params;
    //     const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    //     // Check if tag exists
    //     const tag = await Tag.findById(tagId);
    //     if (!tag) {
    //         throw new ApiError(404, "Tag not found");
    //     }

    //     const skip = (page - 1) * limit;
    //     const sortOptions = {};
    //     sortOptions[`questionId.${sortBy}`] = sortOrder === 'desc' ? -1 : 1;

    //     // Get all questions for this tag
    //     const questionTags = await QuestionTag.find({ tagId })
    //         .populate({
    //             path: 'questionId',
    //             select: 'title description userId acceptedAnswerId createdAt updatedAt',
    //             populate: {
    //                 path: 'userId',
    //                 select: 'username email avatar'
    //             }
    //         })
    //         .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
    //         .skip(skip)
    //         .limit(parseInt(limit));

    //     const questions = questionTags.map(qt => qt.questionId);

    //     // Get total count for pagination
    //     const totalQuestions = await QuestionTag.countDocuments({ tagId });

    //     const pagination = {
    //         currentPage: parseInt(page),
    //         totalPages: Math.ceil(totalQuestions / limit),
    //         totalQuestions,
    //         hasNextPage: page < Math.ceil(totalQuestions / limit),
    //         hasPrevPage: page > 1
    //     };

    //     res.status(200).json(
    //         new ApiResponse(200, { questions, pagination, tag }, "Tag questions retrieved successfully")
    //     );
    // });

    // // Get popular tags (most used tags)
    // const getPopularTags = asyncHandler(async (req, res) => {
    //     const { limit = 10 } = req.query;

    //     // Aggregate to get tags with question counts
    //     const popularTags = await QuestionTag.aggregate([
    //         {
    //             $group: {
    //                 _id: '$tagId',
    //                 questionCount: { $sum: 1 }
    //             }
    //         },
    //         {
    //             $lookup: {
    //                 from: 'tags',
    //                 localField: '_id',
    //                 foreignField: '_id',
    //                 as: 'tag'
    //             }
    //         },
    //         {
    //             $unwind: '$tag'
    //         },
    //         {
    //             $project: {
    //                 _id: '$tag._id',
    //                 name: '$tag.name',
    //                 createdAt: '$tag.createdAt',
    //                 questionCount: 1
    //             }
    //         },
    //         {
    //             $sort: { questionCount: -1 }
    //         },
    //         {
    //             $limit: parseInt(limit)
    //         }
    //     ]);

    //     res.status(200).json(
    //         new ApiResponse(200, popularTags, "Popular tags retrieved successfully")
    //     );
    // });

    // // Bulk add tags to question
    // const bulkAddTagsToQuestion = asyncHandler(async (req, res) => {
    //     const { questionId } = req.params;
    //     const { tagIds } = req.body;

    //     // Validate input
    //     if (!Array.isArray(tagIds) || tagIds.length === 0) {
    //         throw new ApiError(400, "Tag IDs array is required");
    //     }

    //     // Check if question exists
    //     const question = await Question.findById(questionId);
    //     if (!question) {
    //         throw new ApiError(404, "Question not found");
    //     }

    //     // Check if all tags exist
    //     const tags = await Tag.find({ _id: { $in: tagIds } });
    //     if (tags.length !== tagIds.length) {
    //         throw new ApiError(404, "One or more tags not found");
    //     }

    //     // Get existing relationships
    //     const existingRelations = await QuestionTag.find({
    //         questionId,
    //         tagId: { $in: tagIds }
    //     });

    //     // Filter out already existing relationships
    //     const existingTagIds = existingRelations.map(rel => rel.tagId.toString());
    //     const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId));

    //     // Create new relationships
    //     const newRelations = newTagIds.map(tagId => ({
    //         questionId,
    //         tagId
    //     }));

    //     const createdRelations = await QuestionTag.insertMany(newRelations);

    //     res.status(201).json(
    //         new ApiResponse(201, {
    //             created: createdRelations.length,
    //             skipped: existingTagIds.length,
    //             total: tagIds.length
    //         }, "Tags added to question successfully")
    //     );
    // });

    export {
        createTag,
        getAllTags,
        getTagById,
        getTagByName,
        updateTag,
        deleteTag,
        // addTagToQuestion,
        // removeTagFromQuestion,
        // getTagsForQuestion,
        // getQuestionsForTag,
        // getPopularTags,
        // bulkAddTagsToQuestion
    };