import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  crops: [
    {
      cropId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
      },
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      cropName: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  farmers: [
    {
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      farmerName: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Wishlist', wishlistSchema);
