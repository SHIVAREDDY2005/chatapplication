import User from '../models/User.js';
import Message from '../models/Message.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          seenBy: { $ne: req.user._id }
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = unreadCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    return res.json(
      users.map((u) => ({
        ...u.toObject(),
        unreadCount: unreadMap[u._id.toString()] || 0
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};
