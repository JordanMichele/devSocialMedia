const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const PostSchema = new Schema({
  // User associated with the posts
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  // Text typed for post
  text: {
    type: String,
    required: true
  },
  // Users Name
  name: {
    type: String
  },
  // Users Avatar
  avatar: {
    type: String
  },
  // Likes which is an array of user Id's
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  // Comments which is an array of objects that include (user, text, name, avatar and date)
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  // Date for the post itself
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model("posts", PostSchema);
