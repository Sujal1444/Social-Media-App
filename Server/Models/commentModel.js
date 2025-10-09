import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Posts',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }],
        dislikes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }],
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comments',
            default: null
        },
        replies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comments'
        }],
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

// Index for better query performance
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentComment: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for dislike count
commentSchema.virtual('dislikeCount').get(function() {
    return this.dislikes.length;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
    return this.replies.length;
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });

const commentModel = mongoose.model("Comments", commentSchema);

export default commentModel;